import { apiClient } from './client';
import type { Course, CourseDifficulty } from '@/types/course';

export interface CourseInput {
  name: string;
  description?: string;
  difficulty: CourseDifficulty;
  distanceKm: number;
  estimatedTimeMin: number;
}

interface PaginatedCourses {
  items: Course[];
  total: number;
  page: number;
  limit: number;
}

export async function createCourseRequest(data: CourseInput) {
  const res = await apiClient.post<{ data: Course }>('/courses', data);
  return res.data.data;
}

export async function listCoursesRequest() {
  const res = await apiClient.get<{ data: PaginatedCourses }>('/courses', { params: { limit: 100 } });
  return res.data.data;
}

export async function getCourseRequest(id: string) {
  const res = await apiClient.get<{ data: Course }>(`/courses/${id}`);
  return res.data.data;
}

export async function updateCourseRequest(id: string, data: Partial<CourseInput>) {
  const res = await apiClient.patch<{ data: Course }>(`/courses/${id}`, data);
  return res.data.data;
}

export async function shareCourseRequest(id: string) {
  const res = await apiClient.post<{ data: Course }>(`/courses/${id}/share`);
  return res.data.data;
}

export async function deleteCourseRequest(id: string) {
  await apiClient.delete(`/courses/${id}`);
}
