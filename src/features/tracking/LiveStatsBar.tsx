import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDistance, formatDuration, formatPace } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';

interface LiveStatsBarProps {
  distanceKm: number;
  durationSec: number;
}

export function LiveStatsBar({ distanceKm, durationSec }: LiveStatsBarProps) {
  const paceMinPerKm = distanceKm > 0 ? durationSec / 60 / distanceKm : 0;

  return (
    <GlassCard contentStyle={styles.card}>
      <Stat label="Distance" value={formatDistance(distanceKm)} />
      <View style={styles.divider} />
      <Stat label="Temps" value={formatDuration(durationSec)} />
      <View style={styles.divider} />
      <Stat label="Allure" value={formatPace(paceMinPerKm)} />
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  value: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
