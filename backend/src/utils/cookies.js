import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'skyrun_refresh_token';

// Scoped to the auth routes only — the cookie is never sent on other requests.
const COOKIE_PATH = `${env.apiPrefix}/auth`;

export function setRefreshCookie(res, refreshToken) {
  const { exp } = jwt.decode(refreshToken);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: COOKIE_PATH,
    expires: new Date(exp * 1000),
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: COOKIE_PATH,
  });
}
