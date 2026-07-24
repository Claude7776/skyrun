// Rough estimate for an average adult runner at a moderate pace, absent
// per-user weight/MET data (the app doesn't collect body weight). Good enough
// for a dashboard-level figure; not a substitute for a real MET calculation.
const AVERAGE_KCAL_PER_KM = 62;

export function estimateCalories(distanceKm) {
  return Math.round(distanceKm * AVERAGE_KCAL_PER_KM);
}
