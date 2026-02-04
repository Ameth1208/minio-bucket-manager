import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { requireAuth } from './middleware/auth';
import { minioManager } from './minioClient';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// --- Routes ---

// Serve HTML pages
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/manager', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/manager.html'));
});

// API Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === config.adminUser && password === config.adminPass) {
        const token = jwt.sign({ user: username }, config.jwtSecret, { expiresIn: '1h' });
        res.cookie('auth_token', token, { httpOnly: true });
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});

// API Buckets
app.get('/api/buckets', requireAuth, async (req, res) => {
    try {
        const buckets = await minioManager.listBucketsWithStatus();
        res.json(buckets);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/buckets/:name/objects', requireAuth, async (req, res) => {
    try {
        const name = req.params.name as string;
        const prefix = req.query.prefix as string || '';
        const objects = await minioManager.listObjects(name, prefix);
        res.json(objects);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/buckets/:name/objects/:objectName/url', requireAuth, async (req, res) => {
    try {
        const name = req.params.name as string;
        const objectName = req.params.objectName as string;
        const url = await minioManager.getPresignedUrl(name, objectName);
        res.json({ url });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/buckets', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) throw new Error("Bucket name required");
        await minioManager.createBucket(name);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/buckets/:name/policy', requireAuth, async (req, res) => {
    try {
        const name = req.params.name as string;
        const { public: isPublic } = req.body; // true or false
        if (!name) throw new Error("Bucket name required");
        await minioManager.setBucketVisibility(name, isPublic);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/buckets/:name', requireAuth, async (req, res) => {
    try {
        const name = req.params.name as string;
        await minioManager.deleteBucket(name);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Start
app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
});
