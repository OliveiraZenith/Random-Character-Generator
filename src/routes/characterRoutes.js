import { Router } from 'express';
import {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  listCharactersByWorld,
  updateCharacter,
  reorderCharacters
} from '../controllers/characterController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.post('/worlds/:worldId/characters', authMiddleware, createCharacter);
router.get('/worlds/:id/characters', authMiddleware, listCharactersByWorld);
router.get('/characters/:id', authMiddleware, getCharacterById);
router.put('/characters/:id', authMiddleware, updateCharacter);
router.put('/worlds/:worldId/characters/reorder', authMiddleware, reorderCharacters);
router.delete('/characters/:id', authMiddleware, deleteCharacter);

export default router;
