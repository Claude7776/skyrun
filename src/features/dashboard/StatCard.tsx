import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  /** Static display value — used as-is unless `numericValue` is also given. */
  value: string;
  /**
   * Raw number to count up from 0 on mount. When set, `formatter` turns each
   * in-between frame into the displayed string (units included, e.g. "12 km").
   * Falls back to the plain `value` string when omitted.
   */
  numericValue?: number;
  formatter?: (n: number) => string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, numericValue, formatter, delay }: StatCardProps) {
  return (
    <GlassCard style={styles.card} contentStyle={styles.content} delay={delay}>
      <View style={styles.iconBadge}>
        <Icon size={18} color={colors.primary} />
      </View>
      {numericValue !== undefined && formatter ? (
        <AnimatedNumber value={numericValue} formatter={formatter} style={styles.value} />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
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
