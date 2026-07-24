import mongoose from 'mongoose';

// One document per active session/device. Storing a hash of the token's jti
// (never the raw token) lets us revoke individual sessions and detect reuse
// of an already-rotated refresh token (see auth.service.js).
const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgent: { type: String, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically deletes the document once expiresAt is reached.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
