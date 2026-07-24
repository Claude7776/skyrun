import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Target } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { GoalCard } from '@/features/goals/GoalCard';
import { GoalTypeSelector } from '@/features/goals/GoalTypeSelector';
import { createGoalRequest, deleteGoalRequest, listGoalsRequest } from '@/api/goals';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { GoalType } from '@/types/goal';

export default function GoalsScreen() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState<GoalType>('5k');
  const [customDistance, setCustomDistance] = useState('');

  const { data: goals, isLoading } = useQuery({ queryKey: ['goals'], queryFn: listGoalsRequest });

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

  return (
    <ScreenContainer style={{ gap: 0 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Objectifs</Text>
        <Button variant="glass" onPress={() => setCreating((v) => !v)}>
          {creating ? 'Annuler' : '+ Nouvel objectif'}
        </Button>
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
            Créer l'objectif
          </Button>
        </GlassCard>
      )}

      <FlatList
        data={goals ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <GoalCard goal={item} onDelete={(id) => deleteMutation.mutate(id)} delay={Math.min(index * 60, 300)} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <Spinner />
            </View>
          ) : (
            <View style={styles.centered}>
              <Target size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>Aucun objectif pour l'instant.</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  createCard: { marginTop: spacing[4] },
  createCardContent: { gap: spacing[4] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
  listContent: { flexGrow: 1, paddingTop: spacing[4] },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm },
});
