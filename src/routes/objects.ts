import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { minioManager } from '../minioClient';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const getParams = (req: Request) => ({
    providerId: (req.params.providerId || '') as string,
    name: (req.params.name || req.params.bucket || '') as string,
    objectName: (req.params.objectName || req.query.file || '') as string
});

router.get('/buckets/:providerId/:name/objects', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const prefix = (req.query.prefix as string) || '';
        const objects = await minioManager.listObjects(providerId, name, prefix);
        res.json(objects);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/buckets/:providerId/:name/stats', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const stats = await minioManager.getBucketStats(providerId, name);
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/buckets/:providerId/:name/objects/:objectName/url', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name, objectName } = getParams(req);
        const expiry = parseInt(req.query.expiry as string) || 3600;
        const url = await minioManager.getPresignedUrl(providerId, name, objectName, expiry);
        res.json({ url });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/buckets/:providerId/:name/upload', requireAuth, upload.array('files'), async (req: Request, res: Response) => {
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

router.delete('/buckets/:providerId/:name/objects', requireAuth, async (req: Request, res: Response) => {
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

router.get('/view/:providerId/:bucket', requireAuth, async (req: Request, res: Response) => {
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

router.get('/search', requireAuth, async (req: Request, res: Response) => {
    try {
        const query = (req.query.q as string) || '';
        const results = await minioManager.searchObjects(query);
        res.json(results);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
