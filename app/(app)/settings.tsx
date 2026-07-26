import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { logoutRequest } from '@/api/auth';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      await clearSession();
      router.replace('/login');
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Paramètres</Text>
        <View style={{ width: 22 }} />
      </View>

      <GlassCard contentStyle={styles.accountCard}>
        <Text style={styles.sectionLabel}>Compte</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </GlassCard>

      <Button variant="danger" fullWidth onPress={handleLogout}>
        Se déconnecter
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  accountCard: { gap: spacing[1] },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  email: { color: colors.textMuted, fontSize: fontSize.sm },
});
