import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Award, Medal, Target, Trash2, Trophy } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { goalLabel } from './constants';
import { colors, radius, spacing, fontSize } from '@/styles/theme';
import type { Goal } from '@/types/goal';

interface ChallengeCardProps {
  goal: Goal;
  onDelete: (id: string) => void;
  delay?: number;
}

const BADGE_STYLES: { icon: LucideIcon; tint: string }[] = [
  { icon: Target, tint: colors.primary },
  { icon: Medal, tint: colors.warning },
  { icon: Award, tint: colors.accent },
];

function daysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
}

export function ChallengeCard({ goal, onDelete, delay }: ChallengeCardProps) {
  const badge = BADGE_STYLES[Math.abs(hashCode(goal._id)) % BADGE_STYLES.length];
  const remaining = daysRemaining(goal.targetDate);

  const confirmDelete = () => {
    Alert.alert('Supprimer ce défi ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(goal._id) },
    ]);
  };

  return (
    <GlassCard contentStyle={styles.content} delay={delay}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: `${badge.tint}22` }]}>
          {goal.achieved ? (
            <Trophy size={20} color={colors.warning} />
          ) : (
            <badge.icon size={20} color={badge.tint} />
          )}
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Défi {goalLabel(goal.type, goal.targetDistanceKm)}</Text>
          <Text style={styles.subtitle}>
            {goal.achieved
              ? `Meilleur footing : ${goal.bestDistanceKm.toFixed(1)} km`
              : `${goal.bestDistanceKm.toFixed(1)} / ${goal.targetDistanceKm} km`}
          </Text>
        </View>
        <Pressable onPress={confirmDelete} hitSlop={8}>
          <Trash2 size={16} color={colors.textFaint} />
        </Pressable>
      </View>

      <ProgressBar percent={goal.progressPercent} color={goal.achieved ? colors.success : colors.primary} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {goal.bestDistanceKm.toFixed(1)} / {goal.targetDistanceKm} km
        </Text>
        {remaining !== null && <Text style={styles.footerText}>{remaining} jour{remaining !== 1 ? 's' : ''} restant{remaining !== 1 ? 's' : ''}</Text>}
      </View>
    </GlassCard>
  );
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerText: { color: colors.textFaint, fontSize: fontSize.xs, fontWeight: '600' },
});
