import path from 'node:path';
import fs from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  if (email && email !== req.user.email) {
    const exists = await User.findOne({ email });
    if (exists) throw ApiError.conflict('Cet email est déjà utilisé');
    req.user.email = email;
  }
  if (name) req.user.name = name;

  if (newPassword) {
    const userWithPassword = await User.findById(req.user._id).select('+passwordHash');
    const match = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
    if (!match) throw ApiError.unauthorized('Mot de passe actuel incorrect');
    req.user.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await req.user.save();
  new ApiResponse(200, req.user, 'Profil mis à jour').send(res);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Aucun fichier reçu');

  const previousUrl = req.user.avatarUrl;
  req.user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await req.user.save();

  // Best-effort cleanup of the previous avatar file; failure here shouldn't fail the request.
  if (previousUrl) {
    const previousPath = path.join(process.cwd(), previousUrl.replace(/^\//, ''));
    fs.unlink(previousPath).catch(() => {});
  }

  new ApiResponse(200, req.user, 'Avatar mis à jour').send(res);
});
