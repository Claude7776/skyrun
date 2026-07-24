import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Normalizes known error types (Mongoose validation/cast/duplicate-key,
 * JWT errors, our own ApiError) into a consistent JSON shape. Anything
 * unrecognized is logged with its stack and returned as a generic 500,
 * without leaking internals to the client in production.
 */
export function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((e) => e.message);
      error = ApiError.badRequest('Validation failed', details);
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid identifier: ${error.value}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = ApiError.conflict(`${field} already in use`);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Invalid or expired token');
    } else if (error.type === 'entity.too.large') {
      error = ApiError.badRequest('Payload too large');
    } else if (error.name === 'MulterError') {
      error = ApiError.badRequest(error.message);
    } else {
      error = ApiError.internal(env.isProduction ? 'Internal server error' : error.message);
    }
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${error.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${error.statusCode} ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(!env.isProduction && error.stack ? { stack: error.stack } : {}),
  });
}
