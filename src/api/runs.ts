import { apiClient } from './client';
import type { Run, RoutePoint, RunSummary, WeeklyPoint, MonthlyPoint, RunRecords } from '@/types/run';

export interface CreateRunInput {
  title?: string;
  distanceKm: number;
  durationSec: number;
  route: RoutePoint[];
}

interface PaginatedRuns {
  items: Run[];
  total: number;
  page: number;
  limit: number;
}

export async function createRunRequest(data: CreateRunInput) {
  const res = await apiClient.post<{ data: Run }>('/runs', data);
  return res.data.data;
}

export async function listRunsRequest() {
  const res = await apiClient.get<{ data: PaginatedRuns }>('/runs', { params: { limit: 100 } });
  return res.data.data;
}

export async function getRunRequest(id: string) {
  const res = await apiClient.get<{ data: Run }>(`/runs/${id}`);
  return res.data.data;
}

export async function renameRunRequest(id: string, title: string) {
  const res = await apiClient.patch<{ data: Run }>(`/runs/${id}`, { title });
  return res.data.data;
}

export async function deleteRunRequest(id: string) {
  await apiClient.delete(`/runs/${id}`);
}

export async function getRunSummaryRequest() {
  const res = await apiClient.get<{ data: RunSummary }>('/runs/stats/summary');
  return res.data.data;
}

export async function getWeeklyStatsRequest() {
  const res = await apiClient.get<{ data: WeeklyPoint[] }>('/runs/stats/weekly');
  return res.data.data;
}

export async function getMonthlyStatsRequest() {
  const res = await apiClient.get<{ data: MonthlyPoint[] }>('/runs/stats/monthly');
  return res.data.data;
}

export async function getRunRecordsRequest() {
  const res = await apiClient.get<{ data: RunRecords }>('/runs/stats/records');
  return res.data.data;
}
