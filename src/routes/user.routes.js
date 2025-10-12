
import { Router } from 'express';
import { login, getUsers, register, getInfo, getGrades, getAttendance, getAcademic } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middlewares/jwt.middleware.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', register);
router.get('/getinfo/:USN', authenticateJWT, getInfo);
router.get('/getgrades/:USN', authenticateJWT, getGrades);
router.get('/getattendance/:USN', authenticateJWT, getAttendance);
router.get('/getacademic/:USN', authenticateJWT, getAcademic);
export default router;