import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { planRouteSchema } from '../../validators/routing.validators.js';
import * as routingController from '../../controllers/routing.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /routes/plan:
 *   post:
 *     summary: Calcule un itinéraire piéton à partir de points de passage
 *     tags: [Routing]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [waypoints]
 *             properties:
 *               waypoints:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   required: [lat, lng]
 *                   properties:
 *                     lat: { type: number }
 *                     lng: { type: number }
 *     responses:
 *       201: { description: Itinéraire calculé }
 *       400: { description: Aucun itinéraire trouvé ou service indisponible }
 */
router.post('/plan', validate({ body: planRouteSchema }), routingController.plan);

export default router;
