import { store } from '../store.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

// --- Delete Modal ---
export function openDeleteModal(providerId, name) {
    store.bucketToDelete = { providerId, name };
    document.getElementById('deleteModal').classList.remove('hidden');
}

export function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    store.bucketToDelete = null;
}

// --- Preview Modal ---
export async function openPreview(providerId, bucket, file) {
    try {
        const url = `/api/view/${providerId}/${bucket}?file=${encodeURIComponent(file)}`;
        const ext = file.split('.').pop().toLowerCase();
        const content = document.getElementById('previewContent');
        const name = document.getElementById('previewName');
        const btn = document.getElementById('previewDownloadBtn');
        
        name.innerText = file;
        const { url: directUrl } = await api.getUrl(providerId, bucket, file);
        btn.href = directUrl;
        
        content.innerHTML = '<iconify-icon icon="line-md:loading-twotone-loop" width="48" class="text-white/50"></iconify-icon>';
        document.getElementById('previewModal').classList.remove('hidden');

        if(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            const img = new Image();
            img.onload = () => { content.innerHTML = `<img src="${url}" class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-fade-in">`; };
            img.src = url;
        } else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
            content.innerHTML = `<video src="${url}" controls autoplay class="max-w-full max-h-[75vh] rounded-lg shadow-2xl focus:outline-none"></video>`;
        } else if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
            content.innerHTML = `
                <div class="flex flex-col items-center gap-8 p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl animate-fade-in w-full max-w-lg">
                    <div class="p-6 bg-cyan-500/20 rounded-full text-cyan-400">
                        <iconify-icon icon="ph:music-notes-fill" width="64"></iconify-icon>
                    </div>
                    <div class="w-full">
                        <audio src="${url}" controls autoplay class="w-full h-12"></audio>
                    </div>
                    <p class="text-white/70 text-sm font-medium">Playing audio file</p>
                </div>`;
        } else if (ext === 'pdf') {
            content.innerHTML = `<iframe src="${url}" class="w-full h-[75vh] rounded-lg border-0 shadow-2xl bg-white"></iframe>`;
        } else if (ext === 'apk') {
            content.innerHTML = `
                <div class="flex flex-col items-center gap-6 p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
                    <div class="p-6 bg-green-500/20 rounded-full text-green-400">
                        <iconify-icon icon="ph:android-logo-fill" width="64"></iconify-icon>
                    </div>
                    <div class="text-center">
                        <h3 class="text-white text-xl font-bold">Android Package (APK)</h3>
                        <p class="text-white/50 text-sm mt-2">Preview not available for binaries.</p>
                    </div>
                </div>`;
        } else {
            content.innerHTML = `<div class="text-center text-white/50 p-12"><iconify-icon icon="ph:file-dashed-duotone" width="64"></iconify-icon><p class="mt-4">No preview available</p></div>`;
        }
    } catch(e) { 
        showToast('Preview failed', 'error'); 
        closePreview();
    }
}

export function closePreview() {
    document.getElementById('previewModal').classList.add('hidden');
    setTimeout(() => { document.getElementById('previewContent').innerHTML = ''; }, 200);
}