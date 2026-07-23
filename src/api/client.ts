import axios from 'axios';
import { useAuthStore, getStoredRefreshToken } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Coalesces concurrent 401s into a single refresh call instead of firing one
// per failed request.
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = typeof original?.url === 'string' && original.url.includes('/auth/');

    if (error.response?.status !== 401 || original?._retry || isAuthRoute) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = await getStoredRefreshToken();
          if (!refreshToken) throw error;

          const res = await apiClient.post('/auth/refresh', { refreshToken });
          const { user, accessToken, refreshToken: newRefreshToken } = res.data.data;
          await useAuthStore.getState().setSession(user, accessToken, newRefreshToken);
          return accessToken as string;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      await useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  }
);
