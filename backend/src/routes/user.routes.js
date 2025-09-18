import { Router } from 'express';
import { login, getUsers, register } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', register);

export default router;