import { store } from '../store.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';
import { translations } from '../i18n.js';
import { openExplorer } from './Explorer.js';
import { openDeleteModal } from './Modals.js';

export function renderBuckets(buckets) {
    const lang = localStorage.getItem('lang') || 'en';
    const t = translations[lang];
    const list = document.getElementById('bucketList');
    const loader = document.getElementById('loader');
    const empty = document.getElementById('emptyState');
    
    loader.classList.add('hidden');
    list.innerHTML = '';
    
    // Apply Filter
    let filteredBuckets = buckets;
    if (store.currentFilter !== 'all') {
        filteredBuckets = buckets.filter(b => b.providerId === store.currentFilter);
    }

    if (!Array.isArray(filteredBuckets) || filteredBuckets.length === 0) { 
        empty.classList.remove('hidden'); 
        list.classList.add('hidden'); 
        return; 
    }

    empty.classList.add('hidden');
    list.classList.remove('hidden');

    filteredBuckets.forEach(b => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-dark-900 rounded-xl p-5 border border-slate-200 dark:border-dark-800 transition-all hover:border-rose-500/30 group shadow-sm hover:shadow-md animate-fade-in";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <div class="flex flex-col gap-1">
                    <div class="aspect-square w-12 flex items-center justify-center bg-slate-50 dark:bg-dark-800 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                        <iconify-icon icon="ph:package-duotone" width="26"></iconify-icon>
                    </div>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">${b.providerName}</span>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="console.log('Click Open:', '${b.providerId}', '${b.name}'); window.app.openExplorer('${b.providerId}', '${b.name}')" class="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-500 transition-colors" title="Open Explorer">
                        <iconify-icon icon="ph:folder-open-bold" width="20"></iconify-icon>
                        <span class="text-[10px] font-bold uppercase">Open</span>
                    </button>
                    <button onclick="window.open('/explorer/${b.providerId}/${b.name}', '_blank')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Open in new window">
                        <iconify-icon icon="ph:arrow-square-out-bold" width="20"></iconify-icon>
                    </button>
                    <button onclick="window.app.openDeleteModal('${b.providerId}', '${b.name}')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Delete Bucket">
                        <iconify-icon icon="ph:trash-simple-bold" width="20"></iconify-icon>
                    </button>
                </div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-slate-900 dark:text-white truncate font-mono text-sm tracking-tight">${b.name}</h3>
                <div class="flex items-center gap-3 mt-1">
                    <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest opacity-60">${new Date(b.creationDate).toLocaleDateString(lang)}</p>
                    <span id="stats-${b.providerId}-${b.name}" class="text-[10px] text-indigo-500 font-bold hidden"></span>
                    <button onclick="window.app.refreshStats('${b.providerId}', '${b.name}')" class="text-[10px] text-slate-400 hover:text-rose-500 transition-colors" title="Calculate Stats">
                        <iconify-icon icon="ph:arrows-clockwise-bold"></iconify-icon>
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-dark-800">
                <span class="text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded bg-slate-50 dark:bg-dark-800 ${b.isPublic ? 'text-green-500' : 'text-amber-500'}">
                    ${b.isPublic ? t.publicAccess : t.privateAccess}
                </span>
                
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="toggle-${b.providerId}-${b.name}" class="sr-only peer" ${b.isPublic ? 'checked' : ''}>
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
            </div>
        `;
        list.appendChild(card);
        
        const toggle = card.querySelector(`#toggle-${b.providerId}-${b.name}`);
        if (toggle) {
            toggle.addEventListener('change', async (e) => {
                const newState = e.target.checked;
                try {
                    await api.updatePolicy(b.providerId, b.name, newState);
                    showToast(t.toastUpdated);
                    window.app.loadData(false); 
                } catch (err) {
                    showToast('Update failed', 'error');
                    e.target.checked = !newState;
                }
            });
        }
    });
}
