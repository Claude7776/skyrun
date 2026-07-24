import { StyleSheet, Text, View } from 'react-native';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from './difficulty';
import { radius, spacing, fontSize } from '@/styles/theme';
import type { CourseDifficulty } from '@/types/course';

export function DifficultyBadge({ difficulty }: { difficulty: CourseDifficulty }) {
  const color = DIFFICULTY_COLORS[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.text, { color }]}>{DIFFICULTY_LABELS[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
