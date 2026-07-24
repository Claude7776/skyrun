import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, delay }: StatCardProps) {
  return (
    <GlassCard style={styles.card} contentStyle={styles.content} delay={delay}>
      <View style={styles.iconBadge}>
        <Icon size={18} color={colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: '47%', flexGrow: 1 },
  content: { gap: spacing[2] },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
  },
  value: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: fontSize.xs },
});
