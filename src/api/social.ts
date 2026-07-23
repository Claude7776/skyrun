import { apiClient } from './client';
import type { FeedCourse, Comment } from '@/types/social';

interface PaginatedFeed {
  items: FeedCourse[];
  total: number;
  page: number;
  limit: number;
}

interface LikeResult {
  likesCount: number;
  likedByMe: boolean;
}

export async function getFeedRequest() {
  const res = await apiClient.get<{ data: PaginatedFeed }>('/social/feed', { params: { limit: 50 } });
  return res.data.data;
}

export async function likeCourseRequest(courseId: string) {
  const res = await apiClient.post<{ data: LikeResult }>(`/courses/${courseId}/like`);
  return res.data.data;
}

export async function unlikeCourseRequest(courseId: string) {
  const res = await apiClient.delete<{ data: LikeResult }>(`/courses/${courseId}/like`);
  return res.data.data;
}

export async function listCommentsRequest(courseId: string) {
  const res = await apiClient.get<{ data: Comment[] }>(`/courses/${courseId}/comments`);
  return res.data.data;
}

export async function addCommentRequest(courseId: string, text: string) {
  const res = await apiClient.post<{ data: Comment }>(`/courses/${courseId}/comments`, { text });
  return res.data.data;
}

export async function deleteCommentRequest(commentId: string) {
  await apiClient.delete(`/comments/${commentId}`);
}
