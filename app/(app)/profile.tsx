import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { AvatarPicker } from '@/features/auth/AvatarPicker';
import { ProfileForm } from '@/features/auth/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { logoutRequest } from '@/api/auth';
import { colors, spacing, fontSize, motion } from '@/styles/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

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
      <Text style={styles.title}>Profil</Text>

      <Animated.View entering={FadeIn.duration(motion.base)}>
        <AvatarPicker />
      </Animated.View>

      <GlassCard delay={100}>
        <ProfileForm />
      </GlassCard>

      <Animated.View entering={FadeIn.duration(motion.base).delay(200)}>
        <Button variant="danger" fullWidth onPress={handleLogout}>
          Se déconnecter
        </Button>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing[2] },
});
