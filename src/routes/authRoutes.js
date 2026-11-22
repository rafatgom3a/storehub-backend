import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);

export default router;
