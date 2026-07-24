import dotenv from 'dotenv';

dotenv.config();

/**
 * Fails fast at boot if a required environment variable is missing,
 * instead of surfacing a confusing error deep inside the request cycle.
 */
function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 5000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/skyrun'),

  // CORS is a browser-only mechanism (the mobile app isn't subject to it), but
  // the setting is kept generic in case a web client/admin panel is added later.
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8081',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads/avatars',
    maxSizeMb: Number(process.env.MAX_AVATAR_SIZE_MB || 3),
  },

  osrm: {
    url: process.env.OSRM_URL || 'http://localhost:5000',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};
