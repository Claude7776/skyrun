import type { RoutePoint } from './run';

export interface PlannedRoute {
  _id: string;
  user: string;
  waypoints: RoutePoint[];
  points: RoutePoint[];
  distanceKm: number;
  estimatedDurationSec: number;
  createdAt: string;
  updatedAt: string;
}
