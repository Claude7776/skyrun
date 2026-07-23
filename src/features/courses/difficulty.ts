import { colors } from '@/styles/theme';
import type { CourseDifficulty } from '@/types/course';

export const DIFFICULTY_OPTIONS: { value: CourseDifficulty; label: string }[] = [
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
];

export const DIFFICULTY_LABELS: Record<CourseDifficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

export const DIFFICULTY_COLORS: Record<CourseDifficulty, string> = {
  easy: colors.success,
  medium: colors.warning,
  hard: colors.danger,
};
