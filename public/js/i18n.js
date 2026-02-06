export const flags = { 
    en: 'flagpack:us', 
    es: 'flagpack:es', 
    fr: 'flagpack:fr', 
    pt: 'flagpack:br', 
    ja: 'flagpack:jp', 
    zh: 'flagpack:cn' 
};

export const translations = {
    en: { 
        title: "Storage Buckets", subtitle: "Manage visibility and lifecycle.", create: "Create", logout: "Logout", 
        emptyTitle: "No buckets found", emptyDesc: "Start by creating a new container.", 
        publicAccess: "Public", privateAccess: "Private", 
        deleteTitle: "Delete Bucket", deleteConfirm: "Confirm deletion?", deleteWarning: "Bucket must be empty.", deleteBtn: "Delete", cancelBtn: "Cancel", 
        explore: "Explore", toastCreated: "Bucket created", toastDeleted: "Bucket removed", toastUpdated: "Visibility updated", 
        errorEmpty: "Bucket not empty or error", readOnly: "Secure Access",
        loginTitle: "Atlas Manager", loginSubtitle: "Manage visibility and lifecycle.", loginBtn: "Sign In", username: "Username", password: "Password",
        errBucketExists: "The requested bucket name is not available.",
        errInvalidCredentials: "Invalid credentials.",
        errGeneral: "An unexpected error occurred.",
        supportBtn: "Support"
    },
    es: { 
        title: "Buckets", subtitle: "Gestión de almacenamiento.", create: "Crear", logout: "Salir", 
        emptyTitle: "Sin buckets", emptyDesc: "Crea tu primer contenedor arriba.", 
        publicAccess: "Público", privateAccess: "Privado", 
        deleteTitle: "Eliminar Bucket", deleteConfirm: "¿Eliminar bucket?", deleteWarning: "El bucket debe estar vacío.", deleteBtn: "Eliminar", cancelBtn: "Cerrar", 
        explore: "Explorar", toastCreated: "Bucket creado", toastDeleted: "Bucket eliminado", toastUpdated: "Visibilidad actualizada", 
        errorEmpty: "El bucket no está vacío", readOnly: "Acceso Seguro",
        loginTitle: "Atlas Manager", loginSubtitle: "Gestión de visibilidad y ciclo de vida.", loginBtn: "Entrar", username: "Usuario", password: "Clave",
        errBucketExists: "El nombre del bucket no está disponible.",
        errInvalidCredentials: "Credenciales inválidas.",
        errGeneral: "Ocurrió un error inesperado.",
        supportBtn: "Apoyar"
    },
    pt: { 
        title: "Buckets", subtitle: "Gestão eficiente de almacenamiento.", create: "Criar", logout: "Sair", 
        emptyTitle: "Nenhum bucket", emptyDesc: "Crie o seu primeiro bucket.", 
        publicAccess: "Público", privateAccess: "Privado", 
        deleteTitle: "Excluir Bucket", deleteConfirm: "Confirmar exclusão de", deleteWarning: "O bucket debe estar vazio.", deleteBtn: "Excluir", cancelBtn: "Fechar", 
        explore: "Explorar", toastCreated: "Bucket creado", toastDeleted: "Bucket excluído", toastUpdated: "Visibilidade atualizada", 
        errorEmpty: "O bucket não está vazio", readOnly: "Acesso Seguro",
        loginTitle: "Atlas Manager", loginSubtitle: "Gestão de visibilidad e ciclo de vida.", loginBtn: "Entrar", username: "Usuário", password: "Senha",
        errBucketExists: "O nome do bucket não está disponible.",
        errInvalidCredentials: "Credenciais inválidas.",
        errGeneral: "Ocorreu um erro inesperado.",
        supportBtn: "Apoiar"
    },
    fr: { 
        title: "Buckets", subtitle: "Gestion du stockage.", create: "Créer", logout: "Sortir", 
        emptyTitle: "Aucun bucket", emptyDesc: "Créez votre premier bucket.", 
        publicAccess: "Public", privateAccess: "Privé", 
        deleteTitle: "Supprimer", deleteConfirm: "Supprimer?", deleteWarning: "Le bucket debe estar vacío.", deleteBtn: "Supprimer", cancelBtn: "Fermer", 
        explore: "Explorer", toastCreated: "Bucket créé", toastDeleted: "Bucket supprimé", toastUpdated: "Visibilité mise à jour", 
        errorEmpty: "Bucket non vide", readOnly: "Accès Sécurisé",
        loginTitle: "Atlas Manager", loginSubtitle: "Gérez la visibilité et le ciclo de vie.", loginBtn: "Connexion", username: "Utilisateur", password: "Mot de passe",
        errBucketExists: "Le nom du bucket n'est pas disponible.",
        errInvalidCredentials: "Identifiants invalides.",
        errGeneral: "Une erreur inattendue est survenue.",
        supportBtn: "Soutenir"
    },
    ja: { 
        title: "バケット", subtitle: "ストレージ管理。", create: "作成", logout: "終了", 
        emptyTitle: "バケットなし", emptyDesc: "最初のバケットを作成。", 
        publicAccess: "公開", privateAccess: "非公開", 
        deleteTitle: "削除", deleteConfirm: "削除の確認", deleteWarning: "バケットは空である必要があります。", deleteBtn: "削除", cancelBtn: "閉じる", 
        explore: "探検", toastCreated: "作成完了", toastDeleted: "削除完了", toastUpdated: "更新完了", 
        errorEmpty: "バケットが空ではありません", readOnly: "安全な読み取り専用",
        loginTitle: "Atlas Manager", loginSubtitle: "可視性とライフサイクルの管理。", loginBtn: "ログイン", username: "ユーザー名", password: "パスワード",
        errBucketExists: "リクエストされたバケット名は利用できません。",
        errInvalidCredentials: "資格情報が無効です。",
        errGeneral: "予期しないエラーが発生しました。",
        supportBtn: "支援する"
    },
    zh: { 
        title: "存储桶", subtitle: "存储管理。", create: "创建", logout: "退出", 
        emptyTitle: "无存储桶", emptyDesc: "创建一个新桶。", 
        publicAccess: "公开", privateAccess: "私有", 
        deleteTitle: "删除", deleteConfirm: "确认删除", deleteWarning: "存储桶必须为空。", deleteBtn: "删除", cancelBtn: "关闭", 
        explore: "探索", toastCreated: "创建成功", toastDeleted: "删除成功", toastUpdated: "更新成功", 
        errorEmpty: "存储桶不为空", readOnly: "安全只读访问",
        loginTitle: "Atlas Manager", loginSubtitle: "管理可见性和生命周期。", loginBtn: "登录", username: "用户名", password: "密码",
        errBucketExists: "请求的存储桶名称不可用。",
        errInvalidCredentials: "凭据无效。",
        errGeneral: "发生了意外错误。",
        supportBtn: "支持"
    }
};

export function initLanguage(defaultLang = 'en') {
    const saved = localStorage.getItem('lang') || defaultLang;
    setLanguage(saved);
    return saved;
}

export function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    const flagIcon = document.getElementById('currentFlag');
    const langLabel = document.getElementById('currentLangLabel');
    const dropdown = document.getElementById('langDropdown');

    if (flagIcon) flagIcon.setAttribute('icon', flags[lang]);
    if (langLabel) langLabel.innerText = lang.toUpperCase();
    if (dropdown) dropdown.classList.add('hidden');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const langData = translations[lang] || translations['en'];
        if (langData[key]) {
            if (el.tagName === 'INPUT') el.placeholder = langData[key];
            else el.innerText = langData[key];
        }
    });
    
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

export function renderLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentLang = localStorage.getItem('lang') || 'en';
    const flag = flags[currentLang];

    container.innerHTML = `
        <div class="relative" id="langMenu">
            <button id="langToggleBtn" class="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg px-2.5 py-1.5 transition-all text-xs font-bold border border-transparent hover:border-slate-200 dark:hover:border-dark-700">
                <iconify-icon id="currentFlag" icon="${flag}" width="18"></iconify-icon>
                <span id="currentLangLabel">${currentLang.toUpperCase()}</span>
            </button>
            <div id="langDropdown" class="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-200 dark:border-dark-700 hidden py-1.5 z-50">
                ${Object.keys(flags).map(lang => `
                    <button onclick="window.app.setLanguage('${lang}')" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-dark-700 text-sm transition-colors text-left">
                        <iconify-icon icon="${flags[lang]}" width="18"></iconify-icon> 
                        <span class="capitalize">${new Intl.DisplayNames([lang], {type: 'language'}).of(lang)}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('langToggleBtn').onclick = (e) => {
        e.stopPropagation();
        document.getElementById('langDropdown').classList.toggle('hidden');
    };

    document.addEventListener('click', () => {
        const dropdown = document.getElementById('langDropdown');
        if (dropdown) dropdown.classList.add('hidden');
    });
}

export function t(key) {
    const lang = localStorage.getItem('lang') || 'en';
    return (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || key;
}