import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, Target, Trophy } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ChallengeCard } from '@/features/goals/ChallengeCard';
import { GoalTypeSelector } from '@/features/goals/GoalTypeSelector';
import { createGoalRequest, deleteGoalRequest, listGoalsRequest } from '@/api/goals';
import { getErrorMessage } from '@/utils/errors';
import { colors, radius, spacing, fontSize } from '@/styles/theme';
import type { Goal, GoalType } from '@/types/goal';

type Section = 'active' | 'done';

export default function GoalsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>('active');
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState<GoalType>('5k');
  const [customDistance, setCustomDistance] = useState('');

  const { data: goalsRaw, isLoading } = useQuery<Goal[]>({ queryKey: ['goals'], queryFn: listGoalsRequest });
  const goals: Goal[] | undefined = goalsRaw;

  const createMutation = useMutation({
    mutationFn: createGoalRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setCreating(false);
      setCustomDistance('');
      setType('5k');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoalRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const handleCreate = () => {
    if (type === 'custom') {
      const distance = Number(customDistance.replace(',', '.'));
      if (!Number.isFinite(distance) || distance <= 0) return;
      createMutation.mutate({ type, targetDistanceKm: distance });
    } else {
      createMutation.mutate({ type });
    }
  };

  const filteredGoals: Goal[] = (goals ?? []).filter((g) => (section === 'active' ? !g.achieved : g.achieved));

  return (
    <ScreenContainer style={{ gap: 0 }} scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Défis</Text>
        <Pressable onPress={() => setCreating((v) => !v)} hitSlop={10}>
          <Text style={styles.newLink}>{creating ? 'Annuler' : '+ Nouveau'}</Text>
        </Pressable>
      </View>

      <View style={styles.segmented}>
        <Pressable
          onPress={() => setSection('active')}
          style={[styles.segment, section === 'active' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, section === 'active' && styles.segmentTextActive]}>En cours</Text>
        </Pressable>
        <Pressable
          onPress={() => setSection('done')}
          style={[styles.segment, section === 'done' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, section === 'done' && styles.segmentTextActive]}>Terminés</Text>
        </Pressable>
      </View>

      {creating && (
        <GlassCard style={styles.createCard} contentStyle={styles.createCardContent}>
          <GoalTypeSelector value={type} onChange={setType} />
          {type === 'custom' && (
            <Input
              label="Distance cible (km)"
              value={customDistance}
              onChangeText={setCustomDistance}
              keyboardType="decimal-pad"
              placeholder="ex: 15"
            />
          )}
          {createMutation.isError && (
            <View style={styles.errorRow}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={styles.errorText}>{getErrorMessage(createMutation.error)}</Text>
            </View>
          )}
          <Button variant="primary" fullWidth loading={createMutation.isPending} onPress={handleCreate}>
            Créer le défi
          </Button>
        </GlassCard>
      )}

      <View style={styles.list}>
        {isLoading ? (
          <View style={styles.centered}>
            <Spinner />
          </View>
        ) : filteredGoals.length === 0 ? (
          <View style={styles.centered}>
            {section === 'active' ? (
              <Target size={28} color={colors.textFaint} />
            ) : (
              <Trophy size={28} color={colors.textFaint} />
            )}
            <Text style={styles.emptyText}>
              {section === 'active' ? 'Aucun défi en cours.' : 'Aucun défi terminé pour l\'instant.'}
            </Text>
          </View>
        ) : (
          filteredGoals.map((goal, index) => (
            <ChallengeCard
              key={goal._id}
              goal={goal}
              onDelete={(id) => deleteMutation.mutate(id)}
              delay={Math.min(index * 60, 300)}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  newLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing[4],
  },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing[2], borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  segmentTextActive: { color: colors.onPrimary },
  createCard: { marginBottom: spacing[4] },
  createCardContent: { gap: spacing[4] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
  list: { gap: spacing[3] },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm },
});
