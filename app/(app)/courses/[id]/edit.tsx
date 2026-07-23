import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spinner } from '@/components/ui/Spinner';
import { CourseForm } from '@/features/courses/CourseForm';
import { getCourseRequest, updateCourseRequest, type CourseInput } from '@/api/courses';
import { getErrorMessage } from '@/utils/errors';
import { colors } from '@/styles/theme';

export default function EditCourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseRequest(id),
  });

  const mutation = useMutation({
    mutationFn: (data: CourseInput) => updateCourseRequest(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['course', id], updated);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.back();
    },
  });

  if (isLoading || !course) {
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <CourseForm
        initialValues={course}
        submitLabel="Enregistrer les modifications"
        submitting={mutation.isPending}
        errorMessage={mutation.isError ? getErrorMessage(mutation.error) : null}
        onSubmit={(data) => mutation.mutate(data)}
      />
    </ScreenContainer>
  );
}
