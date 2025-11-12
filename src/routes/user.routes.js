
import { Router } from 'express';
import { login, getUsers, register, getSemesterData } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', register);
// Public for now to support admin dashboard without login
router.get('/getsemesterdata/:USN', getSemesterData);

export default router;