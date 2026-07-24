import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createGoalSchema } from '../../validators/goal.validators.js';
import * as goalController from '../../controllers/goal.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /goals:
 *   post:
 *     summary: Crée un objectif (atteint dès qu'un footing couvre la distance cible)
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [5k, 10k, half_marathon, marathon, custom] }
 *               targetDistanceKm: { type: number, description: 'Requis si type=custom' }
 *               targetDate: { type: string, format: date-time }
 *     responses:
 *       201: { description: Objectif créé }
 *   get:
 *     summary: Liste les objectifs de l'utilisateur, avec progression calculée en direct
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des objectifs }
 */
router.post('/', validate({ body: createGoalSchema }), goalController.create);
router.get('/', goalController.list);

/**
 * @openapi
 * /goals/{id}:
 *   get:
 *     summary: Détail d'un objectif
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Détail de l'objectif }
 *       404: { description: Objectif introuvable }
 *   delete:
 *     summary: Supprime un objectif
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Objectif supprimé }
 */
router.get('/:id', goalController.getOne);
router.delete('/:id', goalController.remove);

export default router;
