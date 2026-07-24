import mongoose from 'mongoose';

const routePointSchema = new mongoose.Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true }, t: { type: Number, required: true } },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    distanceKm: { type: Number, required: true, min: 0 },
    estimatedTimeMin: { type: Number, required: true, min: 0 },
    isPublic: { type: Boolean, default: false },
    // Optional GPS trace (e.g. attached from a recorded Run in a future iteration).
    route: { type: [routePointSchema], default: [] },
    // Populated once the social phase (likes on a public course) lands.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

courseSchema.index({ user: 1, createdAt: -1 });

export const Course = mongoose.model('Course', courseSchema);
