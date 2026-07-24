import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RunMap } from '@/components/map/RunMap';
import { LiveStatsBar } from '@/features/tracking/LiveStatsBar';
import { CountdownOverlay } from '@/features/tracking/CountdownOverlay';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { createRunRequest } from '@/api/runs';
import { formatDistance, formatDuration, formatElevation, formatPace } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function MapScreen() {
  const tracking = useLiveTracking();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('Footing');
  const [isCountingDown, setIsCountingDown] = useState(false);

  const saveMutation = useMutation({
    mutationFn: createRunRequest,
    onSuccess: () => {
      // The dashboard/history screens cache their own queries — without this
      // they keep showing pre-run numbers until something else happens to
      // refetch them.
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['runs', 'stats'] });
      tracking.reset();
      setTitle('Footing');
    },
  });

  const paceMinPerKm = tracking.distanceKm > 0 ? tracking.durationSec / 60 / tracking.distanceKm : 0;

  const handleSave = () => {
    saveMutation.mutate({
      title,
      distanceKm: Number(tracking.distanceKm.toFixed(3)),
      durationSec: tracking.durationSec,
      route: tracking.points,
    });
  };

  return (
    <View style={styles.wrapper}>
      <RunMap route={tracking.points} followUser={tracking.status !== 'stopped'} rounded={false} />

      {isCountingDown && (
        <CountdownOverlay
          onComplete={() => {
            setIsCountingDown(false);
            tracking.start();
          }}
        />
      )}

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        {tracking.error && (
          <GlassCard style={styles.errorCard}>
            <View style={styles.errorRow}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={styles.errorText}>{tracking.error}</Text>
            </View>
          </GlassCard>
        )}

        {tracking.status !== 'stopped' && (
          <LiveStatsBar
            distanceKm={tracking.distanceKm}
            durationSec={tracking.durationSec}
            currentSpeedKmh={tracking.currentSpeedKmh}
            elevationGainM={tracking.elevationGainM}
            calories={tracking.caloriesEstimate}
            status={tracking.status}
          />
        )}

        {tracking.status === 'stopped' && (
          <GlassCard style={styles.summaryCardOuter} contentStyle={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Footing terminé</Text>
            <View style={styles.summaryRow}>
              <SummaryStat label="Distance" value={formatDistance(tracking.distanceKm)} />
              <SummaryStat label="Temps" value={formatDuration(tracking.durationSec)} />
              <SummaryStat label="Allure" value={formatPace(paceMinPerKm)} />
              <SummaryStat label="Calories" value={`${tracking.caloriesEstimate} kcal`} />
              <SummaryStat label="Dénivelé" value={formatElevation(tracking.elevationGainM)} />
            </View>
            <Input label="Nom du footing" value={title} onChangeText={setTitle} />
            {saveMutation.isError && (
              <Text style={styles.errorText}>{getErrorMessage(saveMutation.error)}</Text>
            )}
          </GlassCard>
        )}

        <View style={styles.controls}>
          {tracking.status === 'idle' && !isCountingDown && (
            <Button variant="primary" fullWidth onPress={() => setIsCountingDown(true)}>
              Démarrer
            </Button>
          )}
          {tracking.status === 'tracking' && (
            <>
              <View style={styles.controlItem}>
                <Button variant="glass" fullWidth onPress={tracking.pause}>
                  Pause
                </Button>
              </View>
              <View style={styles.controlItem}>
                <Button variant="danger" fullWidth onPress={tracking.stop}>
                  Arrêter
                </Button>
              </View>
            </>
          )}
          {tracking.status === 'paused' && (
            <>
              <View style={styles.controlItem}>
                <Button variant="primary" fullWidth onPress={tracking.resume}>
                  Reprendre
                </Button>
              </View>
              <View style={styles.controlItem}>
                <Button variant="danger" fullWidth onPress={tracking.stop}>
                  Arrêter
                </Button>
              </View>
            </>
          )}
          {tracking.status === 'stopped' && (
            <>
              <View style={styles.controlItem}>
                <Button variant="glass" fullWidth onPress={tracking.reset}>
                  Ignorer
                </Button>
              </View>
              <View style={styles.controlItem}>
                <Button variant="primary" fullWidth loading={saveMutation.isPending} onPress={handleSave}>
                  Enregistrer
                </Button>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', gap: spacing[1] }}>
      <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  errorCard: { marginBottom: spacing[3] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
  summaryCardOuter: { marginTop: 'auto', marginBottom: spacing[3] },
  summaryCard: { gap: spacing[4] },
  summaryTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: spacing[3] },
  controls: { flexDirection: 'row', gap: spacing[3] },
  controlItem: { flex: 1 },
});
