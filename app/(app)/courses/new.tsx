import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { CourseForm } from '@/features/courses/CourseForm';
import { createCourseRequest, type CourseInput } from '@/api/courses';
import { getErrorMessage } from '@/utils/errors';

export default function NewCourseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CourseInput) => createCourseRequest(data),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.replace(`/courses/${course._id}`);
    },
  });

  return (
    <ScreenContainer scroll>
      <CourseForm
        submitLabel="Créer le parcours"
        submitting={mutation.isPending}
        errorMessage={mutation.isError ? getErrorMessage(mutation.error) : null}
        onSubmit={(data) => mutation.mutate(data)}
      />
    </ScreenContainer>
  );
}
