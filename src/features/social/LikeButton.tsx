import { Pressable, StyleSheet, Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react-native';
import { likeCourseRequest, unlikeCourseRequest } from '@/api/social';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

interface LikeButtonProps {
  courseId: string;
  likesCount: number;
  likedByMe: boolean;
  queryKey: unknown[];
}

export function LikeButton({ courseId, likesCount, likedByMe, queryKey }: LikeButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => (likedByMe ? unlikeCourseRequest(courseId) : likeCourseRequest(courseId)),
    // Simple invalidate-and-refetch: `queryKey` may point at a single course
    // or a feed list containing many, so a generic optimistic patch isn't
    // safe across both shapes — correctness over a marginally snappier UI.
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <Pressable
      onPress={() => mutation.mutate()}
      disabled={mutation.isPending}
      style={[styles.wrapper, likedByMe && styles.wrapperActive]}
    >
      <Heart size={16} color={likedByMe ? colors.danger : colors.textMuted} fill={likedByMe ? colors.danger : 'transparent'} />
      <Text style={[styles.count, likedByMe && styles.countActive]}>{likesCount}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wrapperActive: {
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  count: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  countActive: { color: colors.danger },
});
