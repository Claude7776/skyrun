import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Route as RouteIcon, Share2 } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { DifficultyBadge } from './DifficultyBadge';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { Course } from '@/types/course';

export function CourseCard({ course }: { course: Course }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/courses/${course._id}`)}>
      <GlassCard contentStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {course.name}
          </Text>
          {course.isPublic && <Share2 size={16} color={colors.primary} />}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[2] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '800', flexShrink: 1 },
  description: { color: colors.textMuted, fontSize: fontSize.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], marginTop: spacing[1] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
});
