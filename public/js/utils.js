// --- Theme Logic ---
export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// --- Toast Logic ---
export function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const message = document.getElementById('toastMessage');
    
    if (!toast || !icon || !message) return;

    icon.innerHTML = type === 'success' 
        ? `<iconify-icon icon="solar:check-circle-bold" class="text-green-500" width="22"></iconify-icon>`
        : `<iconify-icon icon="solar:danger-bold" class="text-rose-500" width="22"></iconify-icon>`;

    message.innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}