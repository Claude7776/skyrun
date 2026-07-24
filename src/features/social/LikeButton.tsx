import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { likeCourseRequest, unlikeCourseRequest } from '@/api/social';
import { colors, radius, spacing, fontSize, motion } from '@/styles/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LikeButtonProps {
  courseId: string;
  likesCount: number;
  likedByMe: boolean;
  queryKey: unknown[];
}

export function LikeButton({ courseId, likesCount, likedByMe, queryKey }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const scale = useSharedValue(1);
  const wasLikedRef = useRef(likedByMe);

  const mutation = useMutation({
    mutationFn: () => (likedByMe ? unlikeCourseRequest(courseId) : likeCourseRequest(courseId)),
    // Simple invalidate-and-refetch: `queryKey` may point at a single course
    // or a feed list containing many, so a generic optimistic patch isn't
    // safe across both shapes — correctness over a marginally snappier UI.
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // Pop the heart once the like actually lands (after the refetch flips
  // `likedByMe`), not on tap — the mutation is fire-and-refetch, not optimistic.
  useEffect(() => {
    if (likedByMe && !wasLikedRef.current) {
      scale.value = withSequence(withTiming(1.35, { duration: motion.fast }), withTiming(1, { duration: motion.fast }));
    }
    wasLikedRef.current = likedByMe;
  }, [likedByMe, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={() => mutation.mutate()}
      disabled={mutation.isPending}
      style={[styles.wrapper, likedByMe && styles.wrapperActive]}
      onPressIn={() => {
        scale.value = withTiming(0.9, { duration: motion.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.fast });
      }}
    >
      <Animated.View style={animatedStyle}>
        <Heart
          size={16}
          color={likedByMe ? colors.danger : colors.textMuted}
          fill={likedByMe ? colors.danger : 'transparent'}
        />
      </Animated.View>
      <Text style={[styles.count, likedByMe && styles.countActive]}>{likesCount}</Text>
    </AnimatedPressable>
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
