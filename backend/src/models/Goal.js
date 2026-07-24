import mongoose from 'mongoose';

// Semantics: "complete a single run of at least targetDistanceKm" (like a
// Couch-to-5K / NRC-style distance challenge), not a cumulative distance —
// this matches the race-distance presets (5k/10k/half/marathon) far better
// than summing multiple runs together.
const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['5k', '10k', 'half_marathon', 'marathon', 'custom'], required: true },
    targetDistanceKm: { type: Number, required: true, min: 0.1 },
    targetDate: { type: Date, default: null },
    achieved: { type: Boolean, default: false },
    achievedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, createdAt: -1 });

export const Goal = mongoose.model('Goal', goalSchema);
