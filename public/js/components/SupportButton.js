export function renderSupportButton() {
    const containerId = 'support-button-container';
    let container = document.getElementById(containerId);
    
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <a href="https://buymeacoffee.com/amethgmc" target="_blank" class="fixed bottom-6 right-6 z-50 group flex items-center bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 p-2.5 rounded-2xl shadow-2xl hover:shadow-rose-500/10 hover:border-rose-500/30 transition-all active:scale-95">
            <div class="bg-amber-400 text-black p-2 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                <iconify-icon icon="ph:coffee-bold" width="20"></iconify-icon>
            </div>
            <span class="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out text-sm font-bold text-slate-700 dark:text-slate-200" data-i18n="supportBtn">
                Support
            </span>
        </a>
    `;

    // Re-run i18n for the new element if needed
    if (window.app && window.app.setLanguage) {
        const lang = localStorage.getItem('lang') || 'en';
        // This is a bit hacky, but since setLanguage re-scans the whole DOM, it works.
        // However, we only want to translate the new element.
        document.querySelectorAll(`#${containerId} [data-i18n]`).forEach(el => {
            const key = el.getAttribute('data-i18n');
            // We need to access translations but it's not exported in a way we can use easily without importing i18n.js
        });
    }
}
