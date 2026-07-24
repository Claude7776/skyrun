import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as notificationController from '../../controllers/notification.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Liste les notifications (50 dernières) + nombre non lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Notifications et compteur non lu }
 */
router.get('/', notificationController.list);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Marque toutes les notifications comme lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Notifications marquées comme lues }
 */
router.patch('/read-all', notificationController.markAllRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marque une notification comme lue
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Notification mise à jour }
 */
router.patch('/:id/read', notificationController.markRead);

export default router;
