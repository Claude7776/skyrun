import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Global limiter applied to all API routes to blunt basic abuse/DoS attempts.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/**
 * Stricter limiter for auth endpoints (login/register/refresh) to slow down
 * credential stuffing and brute-force attempts.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
