import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore, getStoredRefreshToken } from '@/store/authStore';
import { refreshRequest } from '@/api/auth';
import { colors } from '@/styles/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

/**
 * Runs once on app start: tries to silently restore a session from the
 * refresh token persisted in expo-secure-store (mobile equivalent of the web
 * app's cookie-based silent refresh on page load).
 */
function useAuthBootstrap() {
  const status = useAuthStore((s) => s.status);
  const setStatus = useAuthStore((s) => s.setStatus);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    (async () => {
      setStatus('loading');
      const storedRefreshToken = await getStoredRefreshToken();

      if (!storedRefreshToken) {
        await clearSession();
        await SplashScreen.hideAsync();
        return;
      }

      try {
        const { user, accessToken, refreshToken } = await refreshRequest(storedRefreshToken);
        await setSession(user, accessToken, refreshToken);
      } catch {
        await clearSession();
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
    // Runs once at mount; auth actions themselves are stable zustand setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
}

export default function RootLayout() {
  const status = useAuthBootstrap();

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
