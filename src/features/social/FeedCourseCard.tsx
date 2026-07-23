import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { DifficultyBadge } from '@/features/courses/DifficultyBadge';
import { LikeButton } from './LikeButton';
import { resolveAssetUrl } from '@/utils/url';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { FeedCourse } from '@/types/social';

export function FeedCourseCard({ course }: { course: FeedCourse }) {
  const router = useRouter();
  const avatarUrl = resolveAssetUrl(course.user.avatarUrl);

  return (
    <Pressable onPress={() => router.push(`/courses/${course._id}`)}>
      <GlassCard contentStyle={styles.card}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <UserRound size={14} color={colors.textMuted} />
            )}
          </View>
          <Text style={styles.authorName}>{course.user.name}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {course.name}
        </Text>
        {course.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <DifficultyBadge difficulty={course.difficulty} />
          <Text style={styles.metaText}>{course.distanceKm} km</Text>
          <View style={{ flex: 1 }} />
          <LikeButton
            courseId={course._id}
            likesCount={course.likesCount}
            likedByMe={course.likedByMe}
            queryKey={['feed']}
          />
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[2] },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  authorName: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  description: { color: colors.textMuted, fontSize: fontSize.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[1] },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
});
