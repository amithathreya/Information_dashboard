import { Router } from 'express';
import { authenticateJWT, optionalAuthenticateJWT } from '../middlewares/jwt.middleware.js';
import { getStudents, patchUpdateSemesterSubjects } from '../controllers/admin.controller.js';

const router = Router();

// GET /admin/students?semester=8 (public read; optional auth)
router.get('/students', optionalAuthenticateJWT, getStudents);

// PATCH /admin/updateSemesterSubjects/:USN?semester=8
router.patch('/updateSemesterSubjects/:USN', authenticateJWT, patchUpdateSemesterSubjects);

export default router;
