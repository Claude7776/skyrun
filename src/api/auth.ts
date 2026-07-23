import { apiClient } from './client';
import { getStoredRefreshToken } from '@/store/authStore';
import type { User } from '@/types/user';

interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function registerRequest(data: { name: string; email: string; password: string }) {
  const res = await apiClient.post<{ data: AuthPayload }>('/auth/register', data);
  return res.data.data;
}

export async function loginRequest(data: { email: string; password: string }) {
  const res = await apiClient.post<{ data: AuthPayload }>('/auth/login', data);
  return res.data.data;
}

export async function refreshRequest(refreshToken: string) {
  const res = await apiClient.post<{ data: AuthPayload }>('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function logoutRequest() {
  const refreshToken = await getStoredRefreshToken();
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function updateProfileRequest(data: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const res = await apiClient.patch<{ data: User }>('/users/me', data);
  return res.data.data;
}

export async function uploadAvatarRequest(file: { uri: string; name: string; mimeType: string }) {
  const formData = new FormData();
  // React Native's FormData expects this {uri, name, type} shape rather than a web File/Blob.
  formData.append('avatar', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const res = await apiClient.post<{ data: User }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
