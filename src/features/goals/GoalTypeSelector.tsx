import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GOAL_PRESETS } from './constants';
import { colors, radius, spacing, fontSize } from '@/styles/theme';
import type { GoalType } from '@/types/goal';

interface GoalTypeSelectorProps {
  value: GoalType;
  onChange: (value: GoalType) => void;
}

export function GoalTypeSelector({ value, onChange }: GoalTypeSelectorProps) {
  return (
    <View style={styles.wrap}>
      {GOAL_PRESETS.map((option) => {
        const selected = option.type === value;
        return (
          <Pressable
            key={option.type}
            onPress={() => onChange(option.type)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(31, 206, 143, 0.14)',
  },
  chipText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  chipTextSelected: { color: colors.primary },
});
