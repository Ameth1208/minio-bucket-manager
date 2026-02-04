export const api = {
    login: async (username, password) => 
        (await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })).json(),

    list: async () => (await fetch('/api/buckets')).json(),
    
    listObjects: async (name, prefix = '') => 
        (await fetch(`/api/buckets/${name}/objects?prefix=${encodeURIComponent(prefix)}`)).json(),
    
    getUrl: async (bucket, file) => 
        (await fetch(`/api/buckets/${bucket}/objects/${encodeURIComponent(file)}/url`)).json(),
    
    create: async (name) => 
        (await fetch('/api/buckets', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ name }) 
        })).json(),
    
    updatePolicy: async (name, pub) => 
        (await fetch(`/api/buckets/${name}/policy`, { 
            method: 'PUT', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ public: pub }) 
        })).json(),
    
    delete: async (name) => 
        (await fetch(`/api/buckets/${name}`, { method: 'DELETE' })).json(),
    
    logout: async () => { 
        await fetch('/api/logout', { method: 'POST' }); 
        window.location.href = '/login'; 
    }
};
