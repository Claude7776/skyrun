import { StyleSheet, Text, View } from 'react-native';
import { Flame, Gauge, Mountain, Route as RouteIcon, Timer, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDistance, formatDuration, formatElevation, formatPace, formatSpeed } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';

interface LiveStatsBarProps {
  distanceKm: number;
  durationSec: number;
  currentSpeedKmh?: number;
  elevationGainM?: number;
  calories?: number;
}

export function LiveStatsBar({
  distanceKm,
  durationSec,
  currentSpeedKmh = 0,
  elevationGainM = 0,
  calories = 0,
}: LiveStatsBarProps) {
  const paceMinPerKm = distanceKm > 0 ? durationSec / 60 / distanceKm : 0;

  return (
    <GlassCard contentStyle={styles.card}>
      <View style={styles.row}>
        <Stat icon={RouteIcon} label="Distance" value={formatDistance(distanceKm)} />
        <View style={styles.divider} />
        <Stat icon={Timer} label="Temps" value={formatDuration(durationSec)} />
        <View style={styles.divider} />
        <Stat icon={Gauge} label="Allure" value={formatPace(paceMinPerKm)} />
      </View>
      <View style={styles.rowDivider} />
      <View style={styles.row}>
        <Stat icon={Zap} label="Vitesse" value={formatSpeed(currentSpeedKmh)} />
        <View style={styles.divider} />
        <Stat icon={Mountain} label="Dénivelé" value={formatElevation(elevationGainM)} />
        <View style={styles.divider} />
        <Stat icon={Flame} label="Calories" value={`${calories} kcal`} />
      </View>
    </GlassCard>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statHeader}>
        <Icon size={12} color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  rowDivider: {
    height: 1,
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
