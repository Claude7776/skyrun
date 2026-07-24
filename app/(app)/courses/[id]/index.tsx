import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Route as RouteIcon, Share2 } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { DifficultyBadge } from '@/features/courses/DifficultyBadge';
import { LikeButton } from '@/features/social/LikeButton';
import { CommentSection } from '@/features/social/CommentSection';
import { getCourseRequest, shareCourseRequest, deleteCourseRequest, createCourseRequest } from '@/api/courses';
import { getErrorMessage } from '@/utils/errors';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseRequest(id),
  });

  const shareMutation = useMutation({
    mutationFn: () => shareCourseRequest(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(['course', id], updated);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourseRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.back();
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () =>
      createCourseRequest({
        name: `${course!.name} (copie)`,
        description: course!.description,
        difficulty: course!.difficulty,
        distanceKm: course!.distanceKm,
        estimatedTimeMin: course!.estimatedTimeMin,
      }),
    onSuccess: (duplicated) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.replace(`/courses/${duplicated._id}`);
    },
  });

  const confirmDelete = () => {
    Alert.alert('Supprimer ce parcours ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (isLoading || !course) {
    return (
      <ScreenContainer style={styles.centered}>
        <Spinner />
      </ScreenContainer>
    );
  }

  const isOwner = course.user === currentUserId;

  return (
    <ScreenContainer scroll>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{course.name}</Text>
          {course.description ? <Text style={styles.description}>{course.description}</Text> : null}
        </View>
        <LikeButton
          courseId={id}
          likesCount={course.likesCount ?? 0}
          likedByMe={course.likedByMe ?? false}
          queryKey={['course', id]}
        />
      </View>

      <GlassCard contentStyle={styles.statsGrid}>
        <DifficultyBadge difficulty={course.difficulty} />
        <View style={styles.metaRow}>
          <RouteIcon size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{course.distanceKm} km</Text>
        </View>
        <View style={styles.metaRow}>
          <Clock size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{course.estimatedTimeMin} min</Text>
        </View>
        {course.isPublic && (
          <View style={styles.metaRow}>
            <Share2 size={16} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.primary }]}>Partagé</Text>
          </View>
        )}
      </GlassCard>

      <View style={styles.actions}>
        {isOwner && (
          <>
            <Button variant="glass" onPress={() => router.push(`/courses/${id}/edit`)}>
              Modifier
            </Button>
            {!course.isPublic && (
              <Button variant="glass" loading={shareMutation.isPending} onPress={() => shareMutation.mutate()}>
                Partager
              </Button>
            )}
          </>
        )}
        <Button variant="glass" loading={duplicateMutation.isPending} onPress={() => duplicateMutation.mutate()}>
          Dupliquer
        </Button>
        {isOwner && (
          <Button variant="danger" loading={deleteMutation.isPending} onPress={confirmDelete}>
            Supprimer
          </Button>
        )}
      </View>

      {duplicateMutation.isError && (
        <Text style={styles.errorText}>{getErrorMessage(duplicateMutation.error)}</Text>
      )}

      <CommentSection courseId={id} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  name: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  description: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing[2] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4], alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  metaText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  errorText: { color: colors.danger, fontSize: fontSize.sm },
});
