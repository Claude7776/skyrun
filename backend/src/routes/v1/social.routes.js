import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { listFeedQuerySchema } from '../../validators/social.validators.js';
import * as socialController from '../../controllers/social.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /social/feed:
 *   get:
 *     summary: Fil des parcours publics (tous utilisateurs), paginé
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des parcours publics }
 */
router.get('/feed', validate({ query: listFeedQuerySchema }), socialController.feed);

export default router;
