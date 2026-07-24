import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadAvatar } from '../../middlewares/upload.middleware.js';
import { updateProfileSchema } from '../../validators/user.validators.js';
import * as userController from '../../controllers/user.controller.js';

const router = Router();

/**
 * @openapi
 * /users/me:
 *   patch:
 *     summary: Met à jour le profil (nom, email, mot de passe)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Profil mis à jour }
 */
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), userController.updateProfile);

/**
 * @openapi
 * /users/me/avatar:
 *   post:
 *     summary: Upload de l'avatar (jpeg/png/webp)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar mis à jour }
 */
router.post('/me/avatar', requireAuth, uploadAvatar, userController.uploadAvatar);

export default router;
