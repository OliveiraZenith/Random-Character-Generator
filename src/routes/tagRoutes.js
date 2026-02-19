import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { listTags } from '../controllers/tagController.js';

const router = Router();

router.get('/tags', authMiddleware, listTags);

export default router;
