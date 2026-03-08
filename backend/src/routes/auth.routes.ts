import { Router } from 'express';
import { register, login, me, googleSignIn } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.get('/me', authenticate, me);

export default router;
