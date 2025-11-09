
import { Router } from 'express';
import { login, getUsers, register, getSemesterData } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middlewares/jwt.middleware.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', register);
router.get('/getsemesterdata/:USN', authenticateJWT, getSemesterData);

export default router;