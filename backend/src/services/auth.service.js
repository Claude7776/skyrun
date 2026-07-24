import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import * as tokenService from './token.service.js';

const SALT_ROUNDS = 12;

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Un compte existe déjà avec cet email');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ name, email, passwordHash });
}

export async function validateCredentials(email, password) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Email ou mot de passe invalide');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw ApiError.unauthorized('Email ou mot de passe invalide');

  return user;
}

/** Issues a fresh access + refresh token pair and persists the refresh session. */
export async function issueSession(userId, userAgent) {
  const accessToken = tokenService.signAccessToken(userId.toString());
  const { token: refreshToken, jti, expiresAt } = tokenService.signRefreshToken(userId.toString());

  await RefreshToken.create({
    user: userId,
    tokenHash: tokenService.hashToken(jti),
    userAgent,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

/**
 * Validates + rotates a refresh token: the presented token is consumed (deleted)
 * and a brand new pair is issued. If the JWT is cryptographically valid but has
 * no matching DB record, it has already been rotated once before — a strong
 * signal of token theft/replay — so every session for that user is revoked.
 */
export async function rotateSession(rawRefreshToken, userAgent) {
  let payload;
  try {
    payload = tokenService.verifyRefreshToken(rawRefreshToken);
  } catch {
    throw ApiError.unauthorized('Session expirée, veuillez vous reconnecter');
  }

  const tokenHash = tokenService.hashToken(payload.jti);
  const existing = await RefreshToken.findOne({ tokenHash, user: payload.sub });

  if (!existing) {
    await RefreshToken.deleteMany({ user: payload.sub });
    logger.warn(`Refresh token reuse detected for user ${payload.sub}; all sessions revoked`);
    throw ApiError.unauthorized('Session invalide, veuillez vous reconnecter');
  }

  await existing.deleteOne();

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Utilisateur introuvable');

  const { accessToken, refreshToken } = await issueSession(user._id, userAgent);
  return { accessToken, refreshToken, user };
}

export async function endSession(rawRefreshToken) {
  if (!rawRefreshToken) return;
  try {
    const payload = tokenService.verifyRefreshToken(rawRefreshToken);
    await RefreshToken.deleteOne({ tokenHash: tokenService.hashToken(payload.jti), user: payload.sub });
  } catch {
    // Token already invalid/expired — nothing to revoke, logout still succeeds.
  }
}
