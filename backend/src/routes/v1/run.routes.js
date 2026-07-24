import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createRunSchema, updateRunSchema, listRunsQuerySchema } from '../../validators/run.validators.js';
import * as runController from '../../controllers/run.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /runs:
 *   post:
 *     summary: Enregistre un footing (distance/allure/calories calculées côté serveur)
 *     tags: [Runs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [distanceKm, durationSec, route]
 *             properties:
 *               title: { type: string }
 *               date: { type: string, format: date-time }
 *               distanceKm: { type: number }
 *               durationSec: { type: number }
 *               route:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat: { type: number }
 *                     lng: { type: number }
 *                     t: { type: number }
 *     responses:
 *       201: { description: Footing enregistré }
 *   get:
 *     summary: Liste les footings de l'utilisateur (paginé)
 *     tags: [Runs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des footings }
 */
router.post('/', validate({ body: createRunSchema }), runController.create);
router.get('/', validate({ query: listRunsQuerySchema }), runController.list);

/**
 * @openapi
 * /runs/stats/summary:
 *   get:
 *     summary: Totaux du tableau de bord (distance, temps, footings, calories, allure/temps moyens)
 *     tags: [Stats]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Totaux agrégés }
 */
router.get('/stats/summary', runController.summary);

/**
 * @openapi
 * /runs/stats/weekly:
 *   get:
 *     summary: Distance cumulée par semaine (8 dernières semaines, zero-filled)
 *     tags: [Stats]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Série hebdomadaire }
 */
router.get('/stats/weekly', runController.weekly);

/**
 * @openapi
 * /runs/stats/monthly:
 *   get:
 *     summary: Distance cumulée par mois (6 derniers mois, zero-filled)
 *     tags: [Stats]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Série mensuelle }
 */
router.get('/stats/monthly', runController.monthly);

/**
 * @openapi
 * /runs/stats/records:
 *   get:
 *     summary: Records personnels (plus longue distance, plus longue durée, meilleure allure)
 *     tags: [Stats]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Records personnels }
 */
router.get('/stats/records', runController.records);

/**
 * @openapi
 * /runs/{id}:
 *   get:
 *     summary: Détail d'un footing
 *     tags: [Runs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Détail du footing }
 *       404: { description: Footing introuvable }
 *   patch:
 *     summary: Renomme un footing (seul le titre est modifiable)
 *     tags: [Runs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *     responses:
 *       200: { description: Footing mis à jour }
 *   delete:
 *     summary: Supprime un footing
 *     tags: [Runs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Footing supprimé }
 */
router.get('/:id', runController.getOne);
router.patch('/:id', validate({ body: updateRunSchema }), runController.update);
router.delete('/:id', runController.remove);

export default router;
