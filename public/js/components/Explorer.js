import { store } from '../store.js';
import { api } from '../api.js';
import { openPreview } from './Modals.js';
import { showToast } from '../utils.js';

let selectedObjects = new Set();
let shareTarget = null;

export async function openExplorer(providerId, name, prefix = '', isStandalone = false) {
    try {
        console.log(`🚀 openExplorer called for ${providerId}/${name}, prefix: "${prefix}", standalone: ${isStandalone}`);
        
        store.currentProviderId = providerId;
        store.currentBucket = name;
        store.currentPrefix = prefix;
        store.isExplorerStandalone = isStandalone;
        
        // Hide search results if any
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.value = '';

        // Update UI
        const titleEl = document.getElementById('explorerTitle');
        if (titleEl) titleEl.innerText = name;
        
        // Switch Views if in Manager
        const listView = document.getElementById('bucketListView');
        const explorerView = document.getElementById('explorerView');
        
        if (!isStandalone) {
            if (listView && explorerView) {
                console.log('UI: Hiding list, showing explorer');
                listView.classList.add('hidden');
                explorerView.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.error('UI: Explorer view elements not found!');
                showToast('UI Error: View elements missing', 'error');
            }
        }

        const modalEl = document.getElementById('explorerModal');
        if (modalEl) {
            modalEl.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }

        // Update URL if needed
        if (!isStandalone) {
            const newPath = `/manager/${providerId}/${name}/files/${prefix}`;
            if (window.location.pathname !== newPath && !window.location.pathname.startsWith('/explorer')) {
                window.history.pushState({ providerId, name, prefix, type: 'explorer' }, '', newPath);
            }
        }

        await renderExplorerContent();
    } catch (err) {
        console.error('Failed to open explorer:', err);
        showToast('Failed to open explorer', 'error');
    }
}

export function closeExplorer() {
    const modalEl = document.getElementById('explorerModal');
    if (modalEl) {
        modalEl.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    // Switch Views if in Manager
    const listView = document.getElementById('bucketListView');
    const explorerView = document.getElementById('explorerView');
    
    if (listView && explorerView) {
        if (!store.isExplorerStandalone) {
            // Check if we are currently in an explorer path
            const isExplorerPath = window.location.pathname.includes('/files/');
            if (isExplorerPath) {
                window.history.back();
            } else {
                listView.classList.remove('hidden');
                explorerView.classList.add('hidden');
                if (window.location.pathname !== '/manager') {
                    window.history.pushState({ type: 'list' }, '', '/manager');
                }
            }
        }
    }
}

export async function navigateExplorer(prefix) {
    store.currentPrefix = prefix;
    
    // Update URL
    if (store.isExplorerStandalone) {
        // We don't change the path in standalone explorer yet to avoid reloading, 
        // but we could use query params or hash if needed. 
        // For now let's just keep it simple.
    } else {
        const newPath = `/manager/${store.currentProviderId}/${store.currentBucket}/files/${prefix}`;
        window.history.pushState({ 
            providerId: store.currentProviderId, 
            name: store.currentBucket, 
            prefix 
        }, '', newPath);
    }

    await renderExplorerContent();
}

async function renderExplorerContent() {
    console.log(`📂 Rendering Explorer: ${store.currentProviderId}/${store.currentBucket}, prefix: "${store.currentPrefix}"`);
    const prefix = store.currentPrefix;
    selectedObjects.clear();
    updateBulkDeleteUI();
    
    const list = document.getElementById('fileList');
    const bread = document.getElementById('breadcrumbs');
    
    if (!list || !bread) {
        console.error('Explorer elements not found');
        return;
    }

    const parts = prefix.split('/').filter(p => p);
    let path = '';
    bread.innerHTML = '';

    parts.forEach(p => {
        path += p + '/';
        const currentPath = path;
        const span = document.createElement('span');
        span.innerHTML = ` <span class="text-slate-300 dark:text-slate-600">/</span> <span class="cursor-pointer hover:text-rose-500 transition-colors">${p}</span>`;
        span.querySelector('.cursor-pointer').onclick = () => navigateExplorer(currentPath);
        bread.appendChild(span);
    });

    list.innerHTML = '<div class="text-center py-16 flex justify-center text-slate-400"><iconify-icon icon="line-md:loading-twotone-loop" width="40"></iconify-icon></div>';
    
    try {
        const items = await api.listObjects(store.currentProviderId, store.currentBucket, store.currentPrefix);
        
        if (items && items.error) {
            throw new Error(items.error);
        }

        if (!Array.isArray(items)) {
            throw new Error('Invalid response from server');
        }

        list.innerHTML = '';
        const fileCountEl = document.getElementById('fileCount');
        if (fileCountEl) fileCountEl.innerText = `${items.length} items`;
        
        console.log(`UI: Found ${items.length} items in bucket`);

        if(store.currentPrefix !== '') {
            const parentParts = store.currentPrefix.split('/').filter(Boolean);
            parentParts.pop();
            const parentPath = parentParts.length > 0 ? parentParts.join('/') + '/' : '';
            console.log(`UI: Adding back button to prefix: "${parentPath}"`);
            
            const back = document.createElement('div');
            back.className = "flex items-center gap-4 p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl cursor-pointer text-slate-500 mb-1 transition-all group";
            back.innerHTML = `
                <div class="aspect-square w-10 flex items-center justify-center bg-slate-200/50 dark:bg-dark-700/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <iconify-icon icon="ph:arrow-u-up-left-bold" width="20"></iconify-icon>
                </div> 
                <span class="text-sm font-bold font-mono">..</span>
            `;
            back.onclick = () => navigateExplorer(parentPath);
            list.appendChild(back);
        }

        if(!items || items.length === 0) { 
            console.log('UI: Folder is empty');
            list.innerHTML = '<div class="text-center py-20 flex flex-col items-center gap-4 text-slate-400 opacity-60"><iconify-icon icon="ph:folder-dashed-duotone" width="48"></iconify-icon><span class="text-sm font-medium tracking-tight">Empty folder</span></div>'; 
            return; 
        }

        const folders = items.filter(i => i.prefix);
        const files = items.filter(i => !i.prefix);
        
        console.log(`UI: Rendering ${folders.length} folders and ${files.length} files`);

        folders.forEach(f => {
            const el = document.createElement('div');
            el.className = "flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl cursor-pointer group transition-all mb-1";
            el.onclick = () => navigateExplorer(f.prefix);
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="aspect-square w-10 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-xl">
                        <iconify-icon icon="ph:folder-duotone" width="22"></iconify-icon>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight">${f.prefix.split('/').filter(Boolean).pop()}</span>
                </div>
                <iconify-icon icon="ph:caret-right-bold" class="text-slate-300 group-hover:text-slate-500 transition-colors" width="16"></iconify-icon>
            `;
            list.appendChild(el);
        });

        files.forEach(f => {
            const size = (f.size / 1024).toFixed(1) + ' KB';
            const name = f.name.replace(store.currentPrefix, '');
            const icon = getFileIcon(name);
            const styles = getIconStyles(name);
            const el = document.createElement('div');
            el.className = "flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl group transition-all mb-1";
            el.innerHTML = `
                <div class="flex items-center gap-4 overflow-hidden">
                    <input type="checkbox" onchange="window.app.toggleSelect('${f.name}', event)" class="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500">
                    <div class="aspect-square w-10 flex items-center justify-center ${styles} rounded-xl transition-all group-hover:scale-105">
                        <iconify-icon icon="${icon}" width="22"></iconify-icon>
                    </div>
                    <div class="flex flex-col min-w-0 flex-grow cursor-pointer" onclick="window.app.openPreview('${store.currentProviderId}', '${store.currentBucket}', '${f.name}')">
                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate font-mono tracking-tight hover:text-rose-500 transition-colors">${name}</span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${size}</span>
                    </div>
                </div>
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="window.app.openPreview('${store.currentProviderId}', '${store.currentBucket}', '${f.name}')" class="aspect-square w-9 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all">
                        <iconify-icon icon="ph:eye-bold" width="18"></iconify-icon>
                    </button>
                    <button onclick="window.app.openUrlModal('${f.name}')" class="aspect-square w-9 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all">
                        <iconify-icon icon="ph:share-network-bold" width="18"></iconify-icon>
                    </button>
                    <button onclick="window.app.downloadFile('${store.currentProviderId}', '${store.currentBucket}', '${f.name}')" class="aspect-square w-9 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all">
                        <iconify-icon icon="ph:download-simple-bold" width="18"></iconify-icon>
                    </button>
                </div>
            `;
            list.appendChild(el);
        });

    } catch (err) { 
        console.error('Explorer error:', err);
        list.innerHTML = `<div class="text-center py-12 text-rose-500 text-sm font-medium">Error: ${err.message}</div>`; 
    }
}

// --- Helper Functions ---
function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'ph:image-duotone';
    if(['mp4', 'webm', 'mov', 'mkv'].includes(ext)) return 'ph:video-duotone';
    if(['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return 'ph:music-notes-duotone';
    if(ext === 'pdf') return 'ph:file-pdf-duotone';
    if(ext === 'zip' || ext === 'rar' || ext === '7z') return 'ph:archive-duotone';
    if(['js', 'ts', 'html', 'css', 'json', 'py', 'go', 'rs'].includes(ext)) return 'ph:file-code-duotone';
    return 'ph:file-duotone';
}

function getIconStyles(name) {
    const ext = name.split('.').pop().toLowerCase();
    if(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'bg-rose-500/10 text-rose-500';
    if(['mp4', 'webm', 'mov', 'mkv'].includes(ext)) return 'bg-indigo-500/10 text-indigo-500';
    if(['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return 'bg-cyan-500/10 text-cyan-400';
    if(ext === 'pdf') return 'bg-orange-500/10 text-orange-500';
    if(ext === 'zip' || ext === 'rar' || ext === '7z') return 'bg-amber-500/10 text-amber-500';
    if(['js', 'ts', 'html', 'css', 'json', 'py', 'go', 'rs'].includes(ext)) return 'bg-emerald-500/10 text-emerald-500';
    return 'bg-slate-500/10 text-slate-500';
}

function updateBulkDeleteUI() {
    const btn = document.getElementById('bulkDeleteBtn');
    if (btn) {
        if (selectedObjects.size > 0) {
            btn.classList.remove('hidden');
            btn.innerText = `Delete (${selectedObjects.size})`;
        } else {
            btn.classList.add('hidden');
        }
    }
}

// --- Exported Functions ---
export function toggleSelect(name, e) {
    if (e.target.checked) selectedObjects.add(name);
    else selectedObjects.delete(name);
    updateBulkDeleteUI();
}

export async function bulkDelete() {
    if (selectedObjects.size === 0) return;
    if (!confirm(`Delete ${selectedObjects.size} objects?`)) return;
    
    showToast(`Deleting ${selectedObjects.size} items...`, 'info');
    const res = await api.deleteObjects(store.currentProviderId, store.currentBucket, Array.from(selectedObjects));
    
    if (res.error) showToast(res.error, 'error');
    else {
        showToast('Items deleted', 'success');
        selectedObjects.clear();
        await renderExplorerContent();
    }
}

export async function downloadFile(providerId, bucket, name) {
    try {
        const { url } = await api.getUrl(providerId, bucket, name);
        window.open(url, '_blank');
    } catch (err) {
        showToast('Download failed', 'error');
    }
}

export async function handleUpload(files) {
    if (!files.length) return;
    showToast(`Uploading ${files.length} files...`, 'info');
    try {
        const res = await api.upload(store.currentProviderId, store.currentBucket, files, store.currentPrefix);
        if (res.error) showToast(res.error, 'error');
        else {
            showToast('Upload complete', 'success');
            await renderExplorerContent();
        }
    } catch (err) {
        showToast('Upload failed', 'error');
    }
}

export function openUrlModal(name) {
    shareTarget = name;
    document.getElementById('urlModal').classList.remove('hidden');
}

export function closeUrlModal() {
    document.getElementById('urlModal').classList.add('hidden');
    document.getElementById('generatedUrlContainer').classList.add('hidden');
    shareTarget = null;
}

export async function generateShareLink() {
    if (!shareTarget) return;
    const expiry = document.getElementById('urlExpiry').value;
    try {
        const { url } = await api.getUrl(store.currentProviderId, store.currentBucket, shareTarget, expiry);
        const input = document.getElementById('generatedUrl');
        const container = document.getElementById('generatedUrlContainer');
        input.value = url;
        container.classList.remove('hidden');
    } catch (err) {
        showToast('Link generation failed', 'error');
    }
}