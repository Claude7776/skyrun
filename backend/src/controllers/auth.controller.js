import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { REFRESH_COOKIE_NAME, setRefreshCookie, clearRefreshCookie } from '../utils/cookies.js';
import * as authService from '../services/auth.service.js';

// The refresh token is set as an httpOnly cookie (web) AND returned in the
// JSON body (mobile, which persists it in expo-secure-store and has no
// reliable cross-restart cookie jar). `getIncomingRefreshToken` mirrors that
// on the way in: accept whichever transport the client used.
function getIncomingRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken ?? null;
}

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  const { accessToken, refreshToken } = await authService.issueSession(user._id, req.headers['user-agent']);
  setRefreshCookie(res, refreshToken);
  new ApiResponse(201, { user, accessToken, refreshToken }, 'Compte créé avec succès').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.validateCredentials(email, password);
  const { accessToken, refreshToken } = await authService.issueSession(user._id, req.headers['user-agent']);
  setRefreshCookie(res, refreshToken);
  new ApiResponse(200, { user, accessToken, refreshToken }, 'Connexion réussie').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  const rawToken = getIncomingRefreshToken(req);
  if (!rawToken) throw ApiError.unauthorized('Aucune session active');

  const { accessToken, refreshToken, user } = await authService.rotateSession(
    rawToken,
    req.headers['user-agent']
  );
  setRefreshCookie(res, refreshToken);
  new ApiResponse(200, { user, accessToken, refreshToken }, 'Session rafraîchie').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  const rawToken = getIncomingRefreshToken(req);
  await authService.endSession(rawToken);
  clearRefreshCookie(res);
  new ApiResponse(200, null, 'Déconnecté').send(res);
});

export const me = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user).send(res);
});
