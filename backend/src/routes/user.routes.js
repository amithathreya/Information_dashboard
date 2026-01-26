import { Router } from 'express';
import { login, getUsers, register } from '../controllers/user.controller.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);

export default router;