import { Stack } from 'expo-router';
import { colors } from '@/styles/theme';

export default function HistoryStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Activités' }} />
      <Stack.Screen name="[id]" options={{ title: 'Détail du footing' }} />
    </Stack>
  );
}
