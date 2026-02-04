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
    
    if (!Array.isArray(buckets) || buckets.length === 0) { 
        empty.classList.remove('hidden'); 
        list.classList.add('hidden'); 
        return; 
    }

    empty.classList.add('hidden');
    list.classList.remove('hidden');

    buckets.forEach(b => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-dark-900 rounded-xl p-5 border border-slate-200 dark:border-dark-800 transition-all hover:border-rose-500/30 group shadow-sm hover:shadow-md";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <div class="aspect-square w-12 flex items-center justify-center bg-slate-50 dark:bg-dark-800 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    <iconify-icon icon="ph:package-duotone" width="26"></iconify-icon>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="window.app.openExplorer('${b.name}')" class="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><iconify-icon icon="ph:magnifying-glass-bold" width="20"></iconify-icon></button>
                    <button onclick="window.app.openDeleteModal('${b.name}')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors"><iconify-icon icon="ph:trash-simple-bold" width="20"></iconify-icon></button>
                </div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-slate-900 dark:text-white truncate font-mono text-sm tracking-tight">${b.name}</h3>
                <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 opacity-60">${new Date(b.creationDate).toLocaleDateString(lang)}</p>
            </div>
                        <div class="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-dark-800">
                            <span class="text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded bg-slate-50 dark:bg-dark-800 ${b.isPublic ? 'text-green-500' : 'text-amber-500'}">
                                ${b.isPublic ? t.publicAccess : t.privateAccess}
                            </span>
                            
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="toggle-${b.name}" class="sr-only peer" ${b.isPublic ? 'checked' : ''}>
                                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-rose-500"></div>
                            </label>
                        </div>
                    `;
                    list.appendChild(card);
                    
                    // Robust Switch Logic
                    const toggle = card.querySelector(`#toggle-${b.name}`);
        if (toggle) {
            toggle.addEventListener('change', async (e) => {
                const checkbox = e.target;
                const newState = checkbox.checked;
                const originalState = !newState; // To revert if fails
                
                // Optimistic UI: disable input while processing
                checkbox.disabled = true;
                checkbox.parentElement.classList.add('opacity-50');

                try {
                    console.log(`Switching bucket ${b.name} to ${newState ? 'Public' : 'Private'}`);
                    const res = await api.updatePolicy(b.name, newState);
                    
                    if (res.error) {
                        throw new Error(res.error);
                    }
                    
                    showToast(t.toastUpdated);
                    // Update global store state to match
                    const bucketInStore = store.buckets.find(bucket => bucket.name === b.name);
                    if (bucketInStore) bucketInStore.isPublic = newState;
                    
                    // Re-render to update UI text (Public/Private label)
                    // We call renderBuckets again but we don't want to lose focus/scroll, 
                    // so ideally we just update the text in this card.
                    // For simplicity in this modular arch, we can re-render or just update DOM classes locally.
                    // Let's re-render to ensure consistency.
                    window.app.loadData(false); 

                } catch (err) {
                    console.error('Switch error:', err);
                    showToast(err.message || 'Update failed', 'error');
                    checkbox.checked = originalState; // Revert visual state
                } finally {
                    checkbox.disabled = false;
                    checkbox.parentElement.classList.remove('opacity-50');
                }
            });
        }
    });
}
