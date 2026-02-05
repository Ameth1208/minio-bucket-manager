import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import { config } from './config';
import { requireAuth } from './middleware/auth';
import { minioManager } from './minioClient';

const app = express();
const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/');
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// --- Helper to safely get params ---
const getParams = (req: Request) => {
    return {
        providerId: (req.params.providerId || '') as string,
        name: (req.params.name || req.params.bucket || '') as string,
        objectName: (req.params.objectName || req.query.file || '') as string
    };
};

// --- API ---

// NEW: List active providers for the UI selector
app.get('/api/providers', requireAuth, (req, res) => {
    res.json(config.providers.map(p => ({ id: p.id, name: p.name })));
});

app.get('/api/buckets', requireAuth, async (req: Request, res: Response) => {
    try {
        const buckets = await minioManager.listBucketsWithStatus();
        res.json(buckets);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/buckets/:providerId/:name/objects', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const prefix = (req.query.prefix as string) || '';
        const objects = await minioManager.listObjects(providerId, name, prefix);
        res.json(objects);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/buckets/:providerId/:name/stats', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const stats = await minioManager.getBucketStats(providerId, name);
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/buckets/:providerId/:name/objects/:objectName/url', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name, objectName } = getParams(req);
        const expiry = parseInt(req.query.expiry as string) || 3600;
        const url = await minioManager.getPresignedUrl(providerId, name, objectName, expiry);
        res.json({ url });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/buckets/:providerId/:name/upload', requireAuth, upload.array('files'), async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const prefix = (req.body.prefix as string) || '';
        const files = req.files as Express.Multer.File[];

        if (files) {
            for (const file of files) {
                const objectName = prefix ? `${prefix}${file.originalname}` : file.originalname;
                await minioManager.uploadFile(providerId, name, objectName, file.path);
                fs.unlinkSync(file.path);
            }
        }
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/buckets/:providerId/:name/objects', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const { objects } = req.body;
        if (Array.isArray(objects)) {
            await minioManager.deleteObjects(providerId, name, objects);
        }
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/view/:providerId/:bucket', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name: bucket } = getParams(req);
        const objectName = req.query.file as string;
        if (!objectName) throw new Error("File parameter required");
        const stream = await minioManager.getObjectStream(providerId, bucket, objectName);
        const ext = objectName.split('.').pop()?.toLowerCase();
        const mimeMap: any = { 
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
            'mp4': 'video/mp4', 'webm': 'video/webm', 'mov': 'video/quicktime', 'mkv': 'video/x-matroska',
            'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg', 'flac': 'audio/flac', 'm4a': 'audio/mp4',
            'pdf': 'application/pdf', 'apk': 'application/vnd.android.package-archive'
        };
        if (ext && mimeMap[ext]) res.setHeader('Content-Type', mimeMap[ext]);
        stream.pipe(res);
    } catch (err: any) { res.status(404).send("File not found"); }
});

app.get('/api/search', requireAuth, async (req: Request, res: Response) => {
    try {
        const query = (req.query.q as string) || '';
        const results = await minioManager.searchObjects(query);
        res.json(results);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/buckets', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = req.body;
        if (!providerId || !name) throw new Error("Provider and name required");
        await minioManager.createBucket(providerId, name);
        res.json({ success: true });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
});

app.put('/api/buckets/:providerId/:name/policy', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const { public: isPublic } = req.body;
        await minioManager.setBucketVisibility(providerId, name, isPublic);
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/buckets/:providerId/:name', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        await minioManager.deleteBucket(providerId, name);
        res.json({ success: true });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
});

// Auth
app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === config.adminUser && password === config.adminPass) {
        const token = jwt.sign({ user: username }, config.jwtSecret, { expiresIn: '1h' });
        res.cookie('auth_token', token, { 
            httpOnly: true, 
            secure: false, // Set to false for local testing without HTTPS
            sameSite: 'lax'
        });
        res.json({ success: true });
    } else { res.status(401).json({ error: 'Invalid credentials' }); }
});

app.post('/api/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});

app.get('/', (req: Request, res: Response) => res.redirect('/login'));
app.get('/login', (req: Request, res: Response) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/manager', requireAuth, (req: Request, res: Response) => res.sendFile(path.join(__dirname, '../public/manager.html')));

app.listen(config.port, () => console.log(`Server running at http://localhost:${config.port}`));
