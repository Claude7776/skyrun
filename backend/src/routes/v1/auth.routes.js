import { Router } from 'express';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { registerSchema, loginSchema } from '../../validators/auth.validators.js';
import * as authController from '../../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Créer un compte
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Compte créé }
 *       409: { description: Email déjà utilisé }
 */
router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Connexion réussie }
 *       401: { description: Identifiants invalides }
 */
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rafraîchit l'access token à partir du refresh token
 *     description: >
 *       Accepte le refresh token soit via le cookie httpOnly (client web),
 *       soit via `refreshToken` dans le corps JSON (client mobile, qui n'a
 *       pas de jar de cookies persistant).
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: 'Requis pour les clients mobiles' }
 *     responses:
 *       200: { description: Session rafraîchie }
 *       401: { description: Session invalide ou expirée }
 */
router.post('/refresh', authRateLimiter, authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Déconnexion (révoque le refresh token courant)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: 'Requis pour les clients mobiles' }
 *     responses:
 *       200: { description: Déconnecté }
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Profil de l'utilisateur authentifié
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Utilisateur courant }
 *       401: { description: Non authentifié }
 */
router.get('/me', requireAuth, authController.me);

export default router;
