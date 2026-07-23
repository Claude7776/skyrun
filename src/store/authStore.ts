import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types/user';

const REFRESH_TOKEN_KEY = 'skyrun_refresh_token';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  setSession: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearSession: () => Promise<void>;
  setStatus: (status: AuthStatus) => void;
  updateUser: (user: User) => void;
}

// The access token only ever lives in memory (short-lived, re-derived on
// boot). The refresh token is persisted in the encrypted Keychain/Keystore
// via expo-secure-store so the user stays logged in across app restarts.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'idle',

  setSession: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, accessToken, status: 'authenticated' });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null, status: 'unauthenticated' });
  },

  setStatus: (status) => set({ status }),

  updateUser: (user) => set((state) => ({ ...state, user })),
}));

export function getStoredRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}
