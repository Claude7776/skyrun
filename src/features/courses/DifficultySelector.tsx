import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DIFFICULTY_OPTIONS, DIFFICULTY_COLORS } from './difficulty';
import { colors, radius, spacing, fontSize } from '@/styles/theme';
import type { CourseDifficulty } from '@/types/course';

interface DifficultySelectorProps {
  value: CourseDifficulty;
  onChange: (value: CourseDifficulty) => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Difficulté</Text>
      <View style={styles.row}>
        {DIFFICULTY_OPTIONS.map((option) => {
          const selected = option.value === value;
          const color = DIFFICULTY_COLORS[option.value];
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                { borderColor: selected ? color : colors.border },
                selected && { backgroundColor: `${color}22` },
              ]}
            >
              <Text style={[styles.optionText, selected && { color }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing[2] },
  label: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing[2] },
  option: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  optionText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
});
