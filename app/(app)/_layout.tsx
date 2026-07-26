import { Platform } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { BarChart3, History, House, Route, UserRound } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { colors, fontSize, shadows } from '@/styles/theme';

// Five-tab bar matching the SkyRun mockup (Accueil/Parcours/Activités/Stats/Profil).
// "Carte" (live tracking) and "Objectifs" (now "Défis") are still real routes —
// just reached by push (from the home CTA / profile menu) instead of a tab button.
export default function AppGroupLayout() {
  const status = useAuthStore((s) => s.status);

  if (status === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.select({ ios: 84, default: 64 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 28, default: 8 }),
          ...shadows.raised,
        },
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <House color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Parcours',
          tabBarIcon: ({ color, size, focused }) => (
            <Route color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Activités',
          tabBarIcon: ({ color, size, focused }) => (
            <History color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size, focused }) => (
            <BarChart3 color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <UserRound color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
