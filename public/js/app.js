import { initTheme, toggleTheme, showToast } from './utils.js';
import { initLanguage, setLanguage, renderLanguageSelector, t } from './i18n.js';
import { api } from './api.js';
import { store } from './store.js';
import { renderBuckets } from './components/BucketList.js';
import { openExplorer, closeExplorer, navigateExplorer, downloadFile, handleUpload, toggleSelect, bulkDelete, openUrlModal, closeUrlModal, generateShareLink } from './components/Explorer.js';
import { openDeleteModal, closeDeleteModal, openPreview, closePreview } from './components/Modals.js';
import { initLoginForm } from './components/LoginForm.js';

// 1. Error Mapping
function translateError(errorMsg) {
    if (!errorMsg) return t('errGeneral');
    if (errorMsg.includes('bucket name is not available') || errorMsg.includes('BucketAlreadyExists')) return t('errBucketExists');
    if (errorMsg.includes('Invalid credentials') || errorMsg.includes('Invalid')) return t('errInvalidCredentials');
    return errorMsg;
}

// 2. Data Loading
async function loadData(spinner = true) {
    const list = document.getElementById('bucketList');
    const loader = document.getElementById('loader');
    const empty = document.getElementById('emptyState');
    if (!list) return;

    if(spinner) { 
        loader.classList.remove('hidden'); 
        list.classList.add('hidden'); 
        empty.classList.add('hidden');
    }

    try { 
        const res = await api.list(); 
        if (res && res.error) {
            showToast(translateError(res.error), 'error');
            loader.classList.add('hidden');
            empty.classList.remove('hidden');
            return;
        }
        store.buckets = Array.isArray(res) ? res : [];
        renderBuckets(store.buckets); 
        renderFilters(store.buckets);
        loadProviders();
    } catch (e) { 
        showToast("Connection failed", 'error');
        loader.classList.add('hidden');
        empty.classList.remove('hidden');
    }
}

// 3. Filters
function renderFilters(buckets) {
    const container = document.getElementById('filterContainer');
    if(!container) return;
    const providers = Array.from(new Set(buckets.map(b => b.providerId)));
    if(providers.length <= 1) {
        container.innerHTML = '';
        return;
    }
    let html = `<button onclick="window.app.setFilter('all')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all ${store.currentFilter === 'all' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-dark-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-700'}">All Accounts</button>`;
    providers.forEach(pId => {
        const pObj = buckets.find(b => b.providerId === pId);
        html += `<button onclick="window.app.setFilter('${pId}')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all ${store.currentFilter === pId ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-dark-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-700'}">${pObj ? pObj.providerName : pId}</button>`;
    });
    container.innerHTML = html;
}

function setFilter(filterId) {
    store.currentFilter = filterId;
    renderBuckets(store.buckets);
    renderFilters(store.buckets);
}

// 4. Providers & Creation
async function loadProviders() {
    const select = document.getElementById('createProviderId');
    if(!select) return;
    try {
        const providers = await api.listProviders();
        if(providers && providers.length > 1) {
            select.classList.remove('hidden');
            select.innerHTML = providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        } else if (providers && providers[0]) {
            select.innerHTML = `<option value="${providers[0].id}">${providers[0].name}</option>`;
            select.classList.add('hidden');
        }
    } catch (err) {}
}

async function createBucket(e) {
    e.preventDefault();
    const input = document.getElementById('newBucketName');
    const providerSelect = document.getElementById('createProviderId');
    const name = input.value.trim();
    const providerId = providerSelect.value;
    if(!name || !providerId) return;
    showToast(t('create') + "...", 'info');
    const res = await api.create(providerId, name);
    if (res && res.error) showToast(translateError(res.error), 'error');
    else { input.value = ''; showToast(t('toastCreated'), 'success'); loadData(); }
}

// 5. Deletion & Stats
async function confirmDelete() {
    if (!store.bucketToDelete) return;
    const { providerId, name } = store.bucketToDelete;
    const res = await api.delete(providerId, name);
    if (res.error) showToast(translateError(res.error), 'error'); 
    else { showToast(t('toastDeleted'), 'success'); loadData(); } 
    closeDeleteModal();
}

async function refreshStats(providerId, name) {
    const el = document.getElementById(`stats-${providerId}-${name}`);
    if(!el) return;
    el.innerHTML = '<iconify-icon icon="line-md:loading-twotone-loop"></iconify-icon>';
    el.classList.remove('hidden');
    try {
        const res = await api.getStats(providerId, name);
        if (res && !res.error) {
            const { size, count } = res;
            const sizeStr = size > 1024 * 1024 ? (size / (1024 * 1024)).toFixed(2) + ' MB' : (size / 1024).toFixed(2) + ' KB';
            el.innerText = `${count} objects | ${sizeStr}`;
        } else el.innerText = 'Error';
    } catch (err) { el.innerText = 'Error'; }
}

// 6. Search
let searchTimeout;
function initSearch() {
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('searchResults');
    if(!input) return;
    input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        if(query.length < 2) { results.classList.add('hidden'); return; }
        searchTimeout = setTimeout(async () => {
            const data = await api.search(query);
            if (!data || data.error) return;
            results.innerHTML = '';
            results.classList.remove('hidden');
            data.forEach(item => {
                const el = document.createElement('div');
                el.className = "flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-dark-700 cursor-pointer rounded-xl border-b border-slate-100 dark:border-dark-700 last:border-0 group";
                el.innerHTML = `<div class="bg-rose-500/10 text-rose-500 p-2 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-all"><iconify-icon icon="ph:file-bold" width="18"></iconify-icon></div><div class="flex flex-col min-w-0"><span class="text-xs font-bold truncate text-slate-700 dark:text-slate-200">${item.name}</span><span class="text-[9px] text-slate-400 font-mono uppercase tracking-tighter">${item.providerId} / ${item.bucket}</span></div>`;
                el.onclick = () => { results.classList.add('hidden'); input.value = ''; openExplorer(item.providerId, item.bucket); openPreview(item.providerId, item.bucket, item.name); };
                results.appendChild(el);
            });
        }, 300);
    });
}

// 7. Expose & Init
window.app = {
    loadData, openExplorer, closeExplorer, navigateExplorer, downloadFile, handleUpload,
    toggleSelect, bulkDelete, openUrlModal, closeUrlModal, generateShareLink,
    openDeleteModal, closeDeleteModal, confirmDelete, openPreview, closePreview,
    setLanguage, toggleTheme, refreshStats, translateError, setFilter, api
};

initTheme();
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    renderLanguageSelector('langSelectorContainer');
    initSearch();
    if (document.getElementById('loginForm')) initLoginForm(); else loadData();
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('logoutBtn')?.addEventListener('click', api.logout);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('createBucketForm')?.addEventListener('submit', createBucket);
    window.addEventListener('languageChanged', () => {
        if(store.buckets.length > 0) renderBuckets(store.buckets);
    });
});
