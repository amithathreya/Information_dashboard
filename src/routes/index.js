import { Router } from 'express';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import subjectsRoutes from './subjects.routes.js';

const router = Router();
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/subjects', subjectsRoutes);

export default router;