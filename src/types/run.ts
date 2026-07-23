export interface RoutePoint {
  lat: number;
  lng: number;
  /** Client-side capture timestamp, ms since epoch. */
  t: number;
}

export interface Run {
  _id: string;
  user: string;
  title: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  avgSpeedKmh: number;
  avgPaceMinPerKm: number;
  calories: number;
  route: RoutePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface RunSummary {
  totalDistanceKm: number;
  totalDurationSec: number;
  totalRuns: number;
  totalCalories: number;
  avgPaceMinPerKm: number;
  avgDurationSec: number;
}

export interface WeeklyPoint {
  weekStart: string;
  distanceKm: number;
}

export interface MonthlyPoint {
  month: string;
  distanceKm: number;
}

export interface RunRecords {
  longestDistance: Run | null;
  longestDuration: Run | null;
  bestPace: Run | null;
}
