import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { httpLogStream } from './config/logger.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { swaggerSpec } from './docs/swagger.js';
import apiV1Router from './routes/v1/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Behind a reverse proxy (nginx in Docker) so req.ip / rate limiting see the real client IP.
  app.set('trust proxy', 1);

  // ---- Security headers ----
  app.use(helmet());

  // ---- CORS ----
  // Irrelevant to the native mobile app (CORS only applies to browsers), kept
  // for any future web client. `credentials` allows a browser client to use
  // the refresh-token cookie; the mobile app uses body-based tokens instead.
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );

  // ---- Body parsing ----
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // ---- Compression & perf ----
  app.use(compression());

  // ---- NoSQL injection protection ----
  app.use(mongoSanitize());

  // ---- HTTP request logging ----
  app.use(morgan(env.isProduction ? 'combined' : 'dev', { stream: httpLogStream }));

  // ---- Global rate limiting (auth routes apply a stricter limiter of their own) ----
  app.use(env.apiPrefix, globalRateLimiter);

  // ---- Static file serving for uploaded avatars ----
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // ---- API routes ----
  app.use(env.apiPrefix, apiV1Router);

  // ---- API documentation ----
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ---- 404 + centralized error handling ----
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
