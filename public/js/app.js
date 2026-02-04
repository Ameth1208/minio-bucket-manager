import { initTheme, toggleTheme, showToast } from './utils.js';
import { initLanguage, setLanguage, t } from './i18n.js';
import { api } from './api.js';
import { store } from './store.js';
import { renderBuckets } from './components/BucketList.js';
import { openExplorer, closeExplorer, navigateExplorer, downloadFile } from './components/Explorer.js';
import { openDeleteModal, closeDeleteModal, openPreview, closePreview } from './components/Modals.js';
import { initLoginForm } from './components/LoginForm.js';

// --- Main App Logic ---

async function loadData(spinner = true) {
    // Only load data if we are on the manager page (check for bucketList element)
    if (!document.getElementById('bucketList')) return;

    if(spinner) { 
        document.getElementById('loader').classList.remove('hidden'); 
        document.getElementById('bucketList').classList.add('hidden'); 
    }
    try { 
        const res = await api.list(); 
        store.buckets = res;
        renderBuckets(res); 
    } catch (e) { 
        if(e.toString().includes('401')) window.location.href = '/login'; 
    }
}

async function confirmDelete() {
    const res = await api.delete(store.bucketToDelete);
    const currentLang = localStorage.getItem('lang') || 'en';
    if (res.error) showToast("Error deleting bucket", 'error'); 
    else { 
        showToast("Bucket deleted successfully"); 
        loadData(); 
    } 
    closeDeleteModal();
}

async function createBucket(e) {
    e.preventDefault();
    const input = document.getElementById('newBucketName');
    const name = input.value.trim();
    if(!name) return;
    
    const res = await api.create(name);
    if (res.error) showToast(res.error, 'error'); 
    else { 
        input.value = ''; 
        showToast("Bucket created"); 
        loadData(); 
    }
}

// --- Expose to Window (for HTML onclicks) ---
window.app = {
    loadData,
    openExplorer,
    closeExplorer,
    navigateExplorer,
    downloadFile,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    openPreview,
    closePreview,
    setLanguage,
    toggleTheme,
    api // expose api logout
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    
    // Check if we are on Login Page or Manager Page
    if (document.getElementById('loginForm')) {
        initLoginForm();
    } else {
        loadData();
    }

    // Common Event Listeners
    const themeToggle = document.getElementById('themeToggle');
    if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', api.logout);

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if(confirmBtn) confirmBtn.addEventListener('click', confirmDelete);

    const createForm = document.getElementById('createBucketForm');
    if(createForm) createForm.addEventListener('submit', createBucket);
    
    // Listen for language changes to re-render
    window.addEventListener('languageChanged', () => {
        if(store.buckets.length > 0) renderBuckets(store.buckets);
    });
});
