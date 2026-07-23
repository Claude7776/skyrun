import { Stack } from 'expo-router';
import { colors } from '@/styles/theme';

export default function CoursesStackLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Parcours' }} />
      <Stack.Screen name="new" options={{ title: 'Nouveau parcours', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Détail du parcours' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Modifier le parcours', presentation: 'modal' }} />
    </Stack>
  );
}
