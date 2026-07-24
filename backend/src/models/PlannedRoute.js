import mongoose from 'mongoose';

const routePointSchema = new mongoose.Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true }, t: { type: Number, required: true } },
  { _id: false }
);

const plannedRouteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Both `waypoints` (the points the user tapped, 2-25, validated) and
    // `points` (OSRM's returned polyline) reuse Run/Course's routePointSchema
    // shape for consistency with the map's RoutePoint type, but `t` here is
    // just a synthetic sequence index (0, 1, 2, ...), never a real timestamp.
    waypoints: { type: [routePointSchema], required: true },
    points: { type: [routePointSchema], default: [] },
    distanceKm: { type: Number, required: true, min: 0 },
    estimatedDurationSec: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

plannedRouteSchema.index({ user: 1, createdAt: -1 });

export const PlannedRoute = mongoose.model('PlannedRoute', plannedRouteSchema);
