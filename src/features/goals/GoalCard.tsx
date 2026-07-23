import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Trash2 } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { goalLabel } from './constants';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { Goal } from '@/types/goal';

interface GoalCardProps {
  goal: Goal;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const confirmDelete = () => {
    Alert.alert('Supprimer cet objectif ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(goal._id) },
    ]);
  };

  return (
    <GlassCard contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {goal.achieved && <CheckCircle2 size={18} color={colors.success} />}
          <Text style={styles.title}>{goalLabel(goal.type, goal.targetDistanceKm)}</Text>
        </View>
        <Pressable onPress={confirmDelete} hitSlop={8}>
          <Trash2 size={16} color={colors.textFaint} />
        </Pressable>
      </View>

      <ProgressBar percent={goal.progressPercent} color={goal.achieved ? colors.success : colors.primary} />

      <Text style={styles.progressText}>
        {goal.achieved
          ? `Atteint — meilleur footing : ${goal.bestDistanceKm.toFixed(1)} km`
          : `${goal.bestDistanceKm.toFixed(1)} / ${goal.targetDistanceKm} km (${goal.progressPercent}%)`}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  progressText: { color: colors.textMuted, fontSize: fontSize.xs },
});
