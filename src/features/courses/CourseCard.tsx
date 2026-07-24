import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Route as RouteIcon, Share2, Star } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { DifficultyBadge } from './DifficultyBadge';
import { useFavoritesStore } from '@/store/favoritesStore';
import { colors, spacing, fontSize, motion } from '@/styles/theme';
import type { Course } from '@/types/course';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(course._id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={() => router.push(`/courses/${course._id}`)}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: motion.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.fast });
      }}
    >
      <GlassCard contentStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {course.name}
          </Text>
          <View style={styles.headerIcons}>
            {course.isPublic && <Share2 size={16} color={colors.primary} />}
            <Pressable onPress={() => toggleFavorite(course._id)} hitSlop={8}>
              <Star
                size={18}
                color={isFavorite ? colors.warning : colors.textFaint}
                fill={isFavorite ? colors.warning : 'transparent'}
              />
            </Pressable>
          </View>
        </View>

        {course.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <DifficultyBadge difficulty={course.difficulty} />
          <View style={styles.metaRow}>
            <RouteIcon size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{course.distanceKm} km</Text>
          </View>
          <View style={styles.metaRow}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{course.estimatedTimeMin} min</Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', flexShrink: 1, letterSpacing: -0.3 },
  description: { color: colors.textMuted, fontSize: fontSize.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing[5], marginTop: spacing[1] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
});
