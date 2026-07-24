import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness/readiness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API and database status
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  new ApiResponse(200, { status: 'ok', database: dbState, uptime: process.uptime() }).send(res);
});

export default router;
