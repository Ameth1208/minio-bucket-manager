import { api } from '../api.js';
import { t } from '../i18n.js';

export function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorContainer = document.getElementById('errorMsg');
        const errorText = document.getElementById('errorText');
        const btn = form.querySelector('button');
        const originalBtnText = btn.innerText;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Reset UI
        errorContainer.classList.add('hidden');
        btn.innerHTML = `<iconify-icon icon="line-md:loading-twotone-loop" width="24"></iconify-icon>`;
        btn.disabled = true;

        try {
            const res = await api.login(username, password);

            if (res.success) {
                window.location.href = '/manager';
            } else {
                throw new Error(res.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            errorText.innerText = t('error') || 'Invalid credentials';
            errorContainer.classList.remove('hidden');
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });

    // Toggle Password Visibility
    const toggleIcon = document.getElementById('togglePassword');
    const passInput = document.getElementById('password');
    
    if (toggleIcon && passInput) {
        // Attach click to the icon element itself for precision
        toggleIcon.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent focus loss issues
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            toggleIcon.setAttribute('icon', isPass ? 'solar:eye-bold' : 'solar:eye-closed-bold');
            toggleIcon.classList.toggle('text-rose-500');
        });
    }
}
