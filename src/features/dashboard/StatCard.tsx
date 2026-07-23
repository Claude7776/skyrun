import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing, fontSize } from '@/styles/theme';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <GlassCard style={styles.card} contentStyle={styles.content}>
      <Icon size={18} color={colors.primary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: '47%', flexGrow: 1 },
  content: { gap: spacing[1] },
  value: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: fontSize.xs },
});
