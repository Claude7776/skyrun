import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import * as tokenService from '../services/token.service.js';

/** Requires a valid `Authorization: Bearer <accessToken>` header; attaches req.user. */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentification requise');
  }

  let payload;
  try {
    payload = tokenService.verifyAccessToken(header.slice(7));
  } catch {
    throw ApiError.unauthorized('Token invalide ou expiré');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Utilisateur introuvable');

  req.user = user;
  next();
});
