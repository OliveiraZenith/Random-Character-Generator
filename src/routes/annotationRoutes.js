import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createAnnotation,
  deleteAnnotation,
  getAnnotation,
  listAnnotationsByWorld,
  updateAnnotation
} from '../controllers/annotationController.js';

const router = Router();

router.get('/worlds/:worldId/notes', authMiddleware, listAnnotationsByWorld);
router.post('/worlds/:worldId/notes', authMiddleware, createAnnotation);
router.get('/notes/:id', authMiddleware, getAnnotation);
router.put('/notes/:id', authMiddleware, updateAnnotation);
router.delete('/notes/:id', authMiddleware, deleteAnnotation);

export default router;
