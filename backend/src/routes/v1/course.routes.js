import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createCourseSchema, updateCourseSchema, listCoursesQuerySchema } from '../../validators/course.validators.js';
import { addCommentSchema } from '../../validators/social.validators.js';
import * as courseController from '../../controllers/course.controller.js';
import * as socialController from '../../controllers/social.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /courses:
 *   post:
 *     summary: Crée un parcours
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, difficulty, distanceKm, estimatedTimeMin]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               difficulty: { type: string, enum: [easy, medium, hard] }
 *               distanceKm: { type: number }
 *               estimatedTimeMin: { type: number }
 *     responses:
 *       201: { description: Parcours créé }
 *   get:
 *     summary: Liste les parcours de l'utilisateur (paginé)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des parcours }
 */
router.post('/', validate({ body: createCourseSchema }), courseController.create);
router.get('/', validate({ query: listCoursesQuerySchema }), courseController.list);

/**
 * @openapi
 * /courses/{id}:
 *   get:
 *     summary: Détail d'un parcours
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Détail du parcours }
 *       404: { description: Parcours introuvable }
 *   patch:
 *     summary: Modifie un parcours
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               difficulty: { type: string, enum: [easy, medium, hard] }
 *               distanceKm: { type: number }
 *               estimatedTimeMin: { type: number }
 *               isPublic: { type: boolean }
 *     responses:
 *       200: { description: Parcours mis à jour }
 *   delete:
 *     summary: Supprime un parcours
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Parcours supprimé }
 */
router.get('/:id', courseController.getOne);
router.patch('/:id', validate({ body: updateCourseSchema }), courseController.update);
router.delete('/:id', courseController.remove);

/**
 * @openapi
 * /courses/{id}/share:
 *   post:
 *     summary: Marque le parcours comme public (partagé)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Parcours partagé }
 */
router.post('/:id/share', courseController.share);

/**
 * @openapi
 * /courses/{id}/like:
 *   post:
 *     summary: Aime un parcours (visible si propriétaire ou public)
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Parcours aimé }
 *   delete:
 *     summary: Retire son like
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Like retiré }
 */
router.post('/:id/like', socialController.like);
router.delete('/:id/like', socialController.unlike);

/**
 * @openapi
 * /courses/{id}/comments:
 *   get:
 *     summary: Liste les commentaires d'un parcours
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des commentaires }
 *   post:
 *     summary: Ajoute un commentaire
 *     tags: [Social]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       201: { description: Commentaire ajouté }
 */
router.get('/:id/comments', socialController.listComments);
router.post('/:id/comments', validate({ body: addCommentSchema }), socialController.addComment);

export default router;
