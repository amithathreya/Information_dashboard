import { Router } from 'express';
// JWT auth temporarily disabled for admin dashboard endpoints
import { getStudents, patchUpdateSemesterSubjects, adminLogin, adminRegister, patchCollectionRecord, patchPersonalInfo } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/jwt.middleware.js';

const router = Router();

// GET /admin/students?semester=8 (protected)
router.get('/students', requireAdmin, getStudents);

// Admin auth endpoints
router.post('/login', adminLogin);
router.post('/register', adminRegister);

// PATCH /admin/updateSemesterSubjects/:USN?semester=8 (protected)
router.patch('/updateSemesterSubjects/:USN', requireAdmin, patchUpdateSemesterSubjects);

// Generic PATCH for any collection: semester_1..8 or personal_information
// PATCH /admin/collection/:collection/:identifier
// :collection = semester_1 | semester_2 | ... | semester_8 | personal_information
// :identifier = USN or MongoDB _id
router.patch('/collection/:collection/:identifier', requireAdmin, patchCollectionRecord);

// Convenience PATCH for personal_information by USN
// PATCH /admin/personal/:USN
router.patch('/personal/:USN', requireAdmin, patchPersonalInfo);

export default router;
