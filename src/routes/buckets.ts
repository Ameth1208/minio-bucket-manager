import { Router, Request, Response } from 'express';
import { minioManager } from '../minioClient';
import { requireAuth } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// Helper to safely get params
const getParams = (req: Request) => ({
    providerId: (req.params.providerId || '') as string,
    name: (req.params.name || req.params.bucket || '') as string
});

router.get('/providers', requireAuth, (req, res) => {
    res.json(config.providers.map(p => ({ id: p.id, name: p.name })));
});

router.get('/buckets', requireAuth, async (req: Request, res: Response) => {
    try {
        const buckets = await minioManager.listBucketsWithStatus();
        res.json(buckets);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/buckets', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = req.body;
        if (!providerId || !name) throw new Error("Provider and name required");
        await minioManager.createBucket(providerId, name);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/buckets/:providerId/:name/policy', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        const { public: isPublic } = req.body;
        await minioManager.setBucketVisibility(providerId, name, isPublic);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/buckets/:providerId/:name', requireAuth, async (req: Request, res: Response) => {
    try {
        const { providerId, name } = getParams(req);
        await minioManager.deleteBucket(providerId, name);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
