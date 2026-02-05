const handleResponse = async (res) => {
    if (res.status === 401) {
        window.location.href = '/login';
        return { error: 'Unauthorized' };
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
        return { error: err.error || `Error ${res.status}` };
    }
    return res.json();
};

export const api = {
    login: async (username, password) => 
        handleResponse(await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })),

    listProviders: async () => handleResponse(await fetch('/api/providers')),

    list: async () => handleResponse(await fetch('/api/buckets')),
    
    listObjects: async (providerId, name, prefix = '') => 
        handleResponse(await fetch(`/api/buckets/${providerId}/${name}/objects?prefix=${encodeURIComponent(prefix)}`)),
    
    getStats: async (providerId, name) => handleResponse(await fetch(`/api/buckets/${providerId}/${name}/stats`)),

    getUrl: async (providerId, bucket, file, expiry = 3600) => 
        handleResponse(await fetch(`/api/buckets/${providerId}/${bucket}/objects/${encodeURIComponent(file)}/url?expiry=${expiry}`)),
    
    upload: async (providerId, bucket, files, prefix = '') => {
        const formData = new FormData();
        formData.append('prefix', prefix);
        for (const file of files) formData.append('files', file);
        return handleResponse(await fetch(`/api/buckets/${providerId}/${bucket}/upload`, {
            method: 'POST',
            body: formData
        }));
    },

    deleteObjects: async (providerId, bucket, objects) => 
        handleResponse(await fetch(`/api/buckets/${providerId}/${bucket}/objects`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objects })
        })),

    search: async (query) => handleResponse(await fetch(`/api/search?q=${encodeURIComponent(query)}`)),

    updatePolicy: async (providerId, name, pub) => 
        handleResponse(await fetch(`/api/buckets/${providerId}/${name}/policy`, { 
            method: 'PUT', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ public: pub }) 
        })),
    
    delete: async (providerId, name) => 
        handleResponse(await fetch(`/api/buckets/${providerId}/${name}`, { method: 'DELETE' })),
    
    logout: async () => { 
        await fetch('/api/logout', { method: 'POST' }); 
        window.location.href = '/login'; 
    }
};
