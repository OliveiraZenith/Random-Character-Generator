import { Router } from 'express';
import { createWorld, deleteWorld, listWorlds, updateWorld } from '../controllers/worldController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, createWorld);
router.get('/', authMiddleware, listWorlds);
router.put('/:id', authMiddleware, updateWorld);
router.delete('/:id', authMiddleware, deleteWorld);

export default router;
