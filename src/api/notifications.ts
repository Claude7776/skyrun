import { apiClient } from './client';
import type { AppNotification } from '@/types/notification';

interface NotificationsPayload {
  items: AppNotification[];
  unreadCount: number;
}

export async function listNotificationsRequest() {
  const res = await apiClient.get<{ data: NotificationsPayload }>('/notifications');
  return res.data.data;
}

export async function markNotificationReadRequest(id: string) {
  const res = await apiClient.patch<{ data: AppNotification }>(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsReadRequest() {
  await apiClient.patch('/notifications/read-all');
}
