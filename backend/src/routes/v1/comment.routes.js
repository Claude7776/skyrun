import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as socialController from '../../controllers/social.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /comments/{commentId}:
 *   delete:
 *     summary: Supprime son propre commentaire
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Commentaire supprimé }
 *       404: { description: Commentaire introuvable }
 */
router.delete('/:commentId', socialController.deleteComment);

export default router;
