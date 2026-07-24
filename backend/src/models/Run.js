import mongoose from 'mongoose';

const routePointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    // Client-side timestamp (ms since epoch) at capture time.
    t: { type: Number, required: true },
  },
  { _id: false }
);

// courseRef (link to a saved Course) is added once the Course model exists (Phase 3).
const runSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 80, default: 'Footing' },
    date: { type: Date, required: true, default: Date.now },
    distanceKm: { type: Number, required: true, min: 0 },
    durationSec: { type: Number, required: true, min: 1 },
    avgSpeedKmh: { type: Number, required: true, min: 0 },
    avgPaceMinPerKm: { type: Number, required: true, min: 0 },
    calories: { type: Number, required: true, min: 0 },
    route: { type: [routePointSchema], default: [] },
  },
  { timestamps: true }
);

runSchema.index({ user: 1, date: -1 });

export const Run = mongoose.model('Run', runSchema);
