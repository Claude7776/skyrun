import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Flame, Gauge, Mountain, Route as RouteIcon, Timer, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDistance, formatDuration, formatElevation, formatPace, formatSpeed } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { TrackingStatus } from '@/hooks/useLiveTracking';

interface LiveStatsBarProps {
  distanceKm: number;
  durationSec: number;
  currentSpeedKmh?: number;
  elevationGainM?: number;
  calories?: number;
  status?: TrackingStatus;
}

export function LiveStatsBar({
  distanceKm,
  durationSec,
  currentSpeedKmh = 0,
  elevationGainM = 0,
  calories = 0,
  status,
}: LiveStatsBarProps) {
  const paceMinPerKm = distanceKm > 0 ? durationSec / 60 / distanceKm : 0;

  return (
    <GlassCard contentStyle={styles.card}>
      {status && (
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <RecordingDot active={status === 'tracking'} />
            <Text style={styles.statusText}>{status === 'tracking' ? 'Enregistrement' : 'En pause'}</Text>
          </View>
          <GpsIndicator active={status === 'tracking'} />
        </View>
      )}
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

function RecordingDot({ active }: { active: boolean }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [active, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.4 + pulse.value * 0.6 : 1,
    transform: [{ scale: active ? 0.85 + pulse.value * 0.3 : 1 }],
  }));

  return <Animated.View style={[styles.dot, !active && styles.dotPaused, animatedStyle]} />;
}

// Bar count reflects whether the GPS watch is actively receiving fixes
// (tracking) vs paused — not a real signal-strength reading (useLiveTracking
// doesn't expose fix accuracy), so this is an honest on/off signal rendered
// as bars rather than a fabricated precision indicator.
function GpsIndicator({ active }: { active: boolean }) {
  return (
    <View style={styles.gpsRow}>
      <Text style={styles.gpsLabel}>GPS</Text>
      <View style={styles.gpsBars}>
        {[6, 9, 12, 15].map((height, i) => (
          <View
            key={i}
            style={[styles.gpsBar, { height }, active ? styles.gpsBarActive : styles.gpsBarInactive]}
          />
        ))}
      </View>
    </View>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  gpsLabel: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginRight: spacing[1],
  },
  gpsBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  gpsBar: {
    width: 3,
    borderRadius: 1.5,
  },
  gpsBarActive: {
    backgroundColor: colors.primary,
  },
  gpsBarInactive: {
    backgroundColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  dotPaused: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
