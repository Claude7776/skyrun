import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Gauge, Route as RouteIcon } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDate, formatDistance, formatDuration, formatPace } from '@/utils/format';
import { colors, spacing, fontSize, motion } from '@/styles/theme';
import type { Run } from '@/types/run';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RunCard({ run }: { run: Run }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={() => router.push(`/history/${run._id}`)}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: motion.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.fast });
      }}
    >
      <GlassCard contentStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {run.title}
          </Text>
          <Text style={styles.date}>{formatDate(run.date)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <RouteIcon size={14} color={colors.primary} />
            <Text style={styles.metaText}>{formatDistance(run.distanceKm)}</Text>
          </View>
          <Text style={styles.metaText}>{formatDuration(run.durationSec)}</Text>
          <View style={styles.metaRow}>
            <Gauge size={14} color={colors.primary} />
            <Text style={styles.metaText}>{formatPace(run.avgPaceMinPerKm)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Flame size={14} color={colors.primary} />
            <Text style={styles.metaText}>{run.calories} kcal</Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', flexShrink: 1, letterSpacing: -0.3 },
  date: { color: colors.textFaint, fontSize: fontSize.xs },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing[5] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
});
