
import { Router } from 'express';
import { login, getUsers, register, getSemesterData, getPersonalDetails } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middlewares/jwt.middleware.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', register);
// Public for now to support admin dashboard without login
router.get('/getsemesterdata/:USN', getSemesterData);
// Personal details endpoint (requires student JWT)
router.get('/personal/:USN', authenticateJWT, getPersonalDetails);

export default router;