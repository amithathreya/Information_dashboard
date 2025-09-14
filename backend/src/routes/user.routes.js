import { Router } from 'express';
import { login, getUsers } from '../controllers/user.controller.js';

const router = Router();
router.get('/', getUsers);
router.post('/login', login);

export default router;