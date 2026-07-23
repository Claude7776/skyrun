import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DifficultySelector } from './DifficultySelector';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { CourseDifficulty } from '@/types/course';
import type { CourseInput } from '@/api/courses';

interface CourseFormProps {
  initialValues?: Partial<CourseInput>;
  submitLabel: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (data: CourseInput) => void;
}

export function CourseForm({ initialValues, submitLabel, submitting, errorMessage, onSubmit }: CourseFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>(initialValues?.difficulty ?? 'medium');
  const [distanceKm, setDistanceKm] = useState(initialValues?.distanceKm?.toString() ?? '');
  const [estimatedTimeMin, setEstimatedTimeMin] = useState(initialValues?.estimatedTimeMin?.toString() ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = () => {
    const distance = Number(distanceKm.replace(',', '.'));
    const time = Number(estimatedTimeMin.replace(',', '.'));

    if (!name.trim()) return setLocalError('Le nom est requis');
    if (!Number.isFinite(distance) || distance <= 0) return setLocalError('Distance invalide');
    if (!Number.isFinite(time) || time <= 0) return setLocalError('Temps estimé invalide');

    setLocalError(null);
    onSubmit({ name: name.trim(), description: description.trim(), difficulty, distanceKm: distance, estimatedTimeMin: time });
  };

  const error = localError ?? errorMessage;

  return (
    <View style={styles.form}>
      <Input label="Nom du parcours" value={name} onChangeText={setName} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />
      <DifficultySelector value={difficulty} onChange={setDifficulty} />
      <Input
        label="Distance (km)"
        value={distanceKm}
        onChangeText={setDistanceKm}
        keyboardType="decimal-pad"
        placeholder="ex: 7.5"
      />
      <Input
        label="Temps estimé (minutes)"
        value={estimatedTimeMin}
        onChangeText={setEstimatedTimeMin}
        keyboardType="number-pad"
        placeholder="ex: 45"
      />

      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button variant="primary" fullWidth loading={submitting} onPress={handleSubmit}>
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
});
