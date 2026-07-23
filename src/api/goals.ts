import { apiClient } from './client';
import type { Goal, GoalType } from '@/types/goal';

export interface CreateGoalInput {
  type: GoalType;
  targetDistanceKm?: number;
}

export async function createGoalRequest(data: CreateGoalInput) {
  const res = await apiClient.post<{ data: Goal }>('/goals', data);
  return res.data.data;
}

export async function listGoalsRequest() {
  const res = await apiClient.get<{ data: Goal[] }>('/goals');
  return res.data.data;
}

export async function deleteGoalRequest(id: string) {
  await apiClient.delete(`/goals/${id}`);
}
