import { PlannedRoute } from '../models/PlannedRoute.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Asks the self-hosted OSRM instance (foot profile) for a route through the
 * given waypoints, then persists it. Uses the global `fetch` built into
 * Node 20+ — no HTTP client dependency needed for this one call.
 */
export async function planRoute(userId, waypoints) {
  const coords = waypoints.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `${env.osrm.url}/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw ApiError.badRequest("Le service d'itinéraire est actuellement indisponible");
  }

  if (!response.ok) {
    throw ApiError.badRequest("Impossible de calculer un itinéraire pour ces points");
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw ApiError.badRequest('Aucun itinéraire trouvé entre ces points');
  }

  const [route] = data.routes;
  const points = route.geometry.coordinates.map(([lng, lat], t) => ({ lat, lng, t }));
  // Validated input waypoints are just { lat, lng } (tap order, not real
  // timestamps) — the schema's `t` field is required, so synthesize the
  // same kind of sequence index used for `points`.
  const indexedWaypoints = waypoints.map((p, t) => ({ lat: p.lat, lng: p.lng, t }));

  return PlannedRoute.create({
    user: userId,
    waypoints: indexedWaypoints,
    points,
    distanceKm: route.distance / 1000,
    estimatedDurationSec: route.duration,
  });
}
