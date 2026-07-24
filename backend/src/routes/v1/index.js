import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import runRoutes from './run.routes.js';
import courseRoutes from './course.routes.js';
import goalRoutes from './goal.routes.js';
import socialRoutes from './social.routes.js';
import commentRoutes from './comment.routes.js';
import notificationRoutes from './notification.routes.js';
import routingRoutes from './routing.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/runs', runRoutes);
router.use('/courses', courseRoutes);
router.use('/goals', goalRoutes);
router.use('/social', socialRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/routes', routingRoutes);

export default router;
