import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Gauge, Pencil, Route as RouteIcon, Timer, Zap } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { RunMap } from '@/components/map/RunMap';
import { getRunRequest, renameRunRequest, deleteRunRequest } from '@/api/runs';
import { exportRunAsGpx, exportRunAsPdf } from '@/utils/exportRun';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatDistance, formatDuration, formatPace } from '@/utils/format';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const { data: run, isLoading } = useQuery({
    queryKey: ['run', id],
    queryFn: () => getRunRequest(id),
  });

  const renameMutation = useMutation({
    mutationFn: (title: string) => renameRunRequest(id, title),
    onSuccess: (updated) => {
      queryClient.setQueryData(['run', id], updated);
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      setEditingTitle(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRunRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['runs', 'stats'] });
      router.back();
    },
  });

  const confirmDelete = () => {
    Alert.alert('Supprimer ce footing ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const gpxMutation = useMutation({
    mutationFn: () => exportRunAsGpx(run!),
    onError: (error) => Alert.alert('Export GPX impossible', getErrorMessage(error)),
  });

  const pdfMutation = useMutation({
    mutationFn: () => exportRunAsPdf(run!),
    onError: (error) => Alert.alert('Export PDF impossible', getErrorMessage(error)),
  });

  if (isLoading || !run) {
    return (
      <ScreenContainer style={styles.centered}>
        <Spinner />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View>
        {editingTitle ? (
          <View style={styles.editRow}>
            <View style={{ flex: 1 }}>
              <Input label="Nom" value={titleDraft} onChangeText={setTitleDraft} autoFocus />
            </View>
            <Button variant="glass" onPress={() => renameMutation.mutate(titleDraft)} loading={renameMutation.isPending}>
              OK
            </Button>
          </View>
        ) : (
          <View style={styles.titleRow}>
            <Text style={styles.title}>{run.title}</Text>
            <Pressable
              onPress={() => {
                setTitleDraft(run.title);
                setEditingTitle(true);
              }}
              hitSlop={8}
            >
              <Pencil size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
        <Text style={styles.date}>{formatDate(run.date)}</Text>
      </View>

      <View style={styles.mapWrapper}>
        <RunMap route={run.route} followUser={false} fitToRoute />
      </View>

      <View style={styles.statsList}>
        <StatRow icon={RouteIcon} label="Distance" value={formatDistance(run.distanceKm)} />
        <StatRow icon={Timer} label="Temps" value={formatDuration(run.durationSec)} />
        <StatRow icon={Gauge} label="Allure moyenne" value={formatPace(run.avgPaceMinPerKm)} />
        <StatRow icon={Zap} label="Vitesse moyenne" value={`${run.avgSpeedKmh} km/h`} />
        <StatRow icon={Flame} label="Calories" value={`${run.calories} kcal`} last />
      </View>

      <View style={styles.exportRow}>
        <View style={styles.exportItem}>
          <Button variant="glass" fullWidth loading={gpxMutation.isPending} onPress={() => gpxMutation.mutate()}>
            Exporter GPX
          </Button>
        </View>
        <View style={styles.exportItem}>
          <Button variant="glass" fullWidth loading={pdfMutation.isPending} onPress={() => pdfMutation.mutate()}>
            Exporter PDF
          </Button>
        </View>
      </View>

      <Button variant="danger" fullWidth loading={deleteMutation.isPending} onPress={confirmDelete}>
        Supprimer ce footing
      </Button>
    </ScreenContainer>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: typeof RouteIcon;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.statRow, !last && styles.statRowDivider]}>
      <View style={styles.statRowLeft}>
        <Icon size={16} color={colors.primary} />
        <Text style={styles.statRowLabel}>{label}</Text>
      </View>
      <Text style={styles.statRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  editRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  date: { color: colors.textFaint, fontSize: fontSize.sm, marginTop: spacing[1] },
  mapWrapper: { height: 240, borderRadius: radius.lg, overflow: 'hidden' },
  exportRow: { flexDirection: 'row', gap: spacing[3] },
  exportItem: { flex: 1 },
  statsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[5],
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
  },
  statRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  statRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  statRowLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  statRowValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
});
