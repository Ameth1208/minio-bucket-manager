import { api } from '../api.js';
import { t } from '../i18n.js';

export function initLoginForm() {
    console.log('initLoginForm called');
    const form = document.getElementById('loginForm');
    if (!form) {
        console.warn('loginForm not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorContainer = document.getElementById('errorMsg');
        const errorText = document.getElementById('errorText');
        const btn = form.querySelector('button');
        const originalBtnText = btn.innerText;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        console.log('Attempting login for:', username);

        // Reset UI
        errorContainer.classList.add('hidden');
        btn.innerHTML = `<iconify-icon icon="line-md:loading-twotone-loop" width="24"></iconify-icon>`;
        btn.disabled = true;

        try {
            const res = await api.login(username, password);
            console.log('Login response:', res);

            if (res.success) {
                console.log('Login success, redirecting...');
                window.location.href = '/manager';
            } else {
                throw new Error(res.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            errorText.innerText = err.message || 'Invalid credentials';
            errorContainer.classList.remove('hidden');
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });

    // Toggle Password Visibility
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const toggleIcon = document.getElementById('togglePassword');
    const passInput = document.getElementById('password');
    
    if (toggleBtn && passInput && toggleIcon) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            toggleIcon.setAttribute('icon', isPass ? 'solar:eye-bold' : 'solar:eye-closed-bold');
            toggleIcon.classList.toggle('text-rose-500');
        });
    }
}
