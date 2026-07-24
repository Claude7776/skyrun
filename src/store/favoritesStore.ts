import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'skyrun_favorite_courses';

interface FavoritesState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  isFavorite: (courseId: string) => boolean;
  toggleFavorite: (courseId: string) => Promise<void>;
}

// Favorites are a purely local, device-side preference — the backend has no
// endpoint for them, so they're persisted with expo-secure-store (already a
// dependency, no new native module / rebuild required) instead of synced.
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await SecureStore.getItemAsync(FAVORITES_KEY);
    set({ ids: raw ? (JSON.parse(raw) as string[]) : [], hydrated: true });
  },

  isFavorite: (courseId) => get().ids.includes(courseId),

  toggleFavorite: async (courseId) => {
    const current = get().ids;
    const next = current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId];
    set({ ids: next });
    await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(next));
  },
}));
