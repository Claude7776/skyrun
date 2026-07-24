import { apiClient } from './client';
import type { RoutePoint } from '@/types/run';
import type { PlannedRoute } from '@/types/route';

export async function planRouteRequest(waypoints: RoutePoint[]) {
  const res = await apiClient.post<{ data: PlannedRoute }>('/routes/plan', { waypoints });
  return res.data.data;
}
