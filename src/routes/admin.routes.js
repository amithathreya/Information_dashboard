import { Router } from 'express';
// JWT auth temporarily disabled for admin dashboard endpoints
import { getStudents, patchUpdateSemesterSubjects } from '../controllers/admin.controller.js';

const router = Router();

// GET /admin/students?semester=8 (public)
router.get('/students', getStudents);

// PATCH /admin/updateSemesterSubjects/:USN?semester=8 (public for now)
router.patch('/updateSemesterSubjects/:USN', patchUpdateSemesterSubjects);

export default router;
