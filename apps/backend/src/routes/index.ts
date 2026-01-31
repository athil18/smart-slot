import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import taskRoutes from './tasks.js';
import adminRoutes from './admin.js';
import resourcesRoutes from './resources.js';
import slotsRoutes from './slots.js';
import appointmentsRoutes from './appointments.js';
import aiRoutes from './ai.js';
import docsRoutes from './docs.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/admin', adminRoutes);
router.use('/resources', resourcesRoutes);
router.use('/slots', slotsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/ai', aiRoutes);
router.use('/docs', docsRoutes);

export default router;
