import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Activity } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { colors, spacing, fontSize } from '@/styles/theme';

/** Centered card shell shared by the login and register screens. */
export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.brand}>
        <Activity size={26} color={colors.primary} />
        <Text style={styles.brandText}>SkyRun</Text>
      </View>
      <GlassCard style={styles.card}>{children}</GlassCard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[5],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  brandText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  card: {
    width: '100%',
    maxWidth: 420,
  },
});
