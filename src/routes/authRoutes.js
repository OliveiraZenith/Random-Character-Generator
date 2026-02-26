import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, validateResetToken } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/validate-token', validateResetToken);

export default router;
