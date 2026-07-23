import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RunMap } from '@/components/map/RunMap';
import { LiveStatsBar } from '@/features/tracking/LiveStatsBar';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { createRunRequest } from '@/api/runs';
import { formatDistance, formatDuration, formatPace } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function MapScreen() {
  const tracking = useLiveTracking();
  const [title, setTitle] = useState('Footing');

  const saveMutation = useMutation({
    mutationFn: createRunRequest,
    onSuccess: () => {
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
      <RunMap route={tracking.points} followUser={tracking.status !== 'stopped'} />

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
          <LiveStatsBar distanceKm={tracking.distanceKm} durationSec={tracking.durationSec} />
        )}

        {tracking.status === 'stopped' && (
          <GlassCard style={styles.summaryCardOuter} contentStyle={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Footing terminé</Text>
            <View style={styles.summaryRow}>
              <SummaryStat label="Distance" value={formatDistance(tracking.distanceKm)} />
              <SummaryStat label="Temps" value={formatDuration(tracking.durationSec)} />
              <SummaryStat label="Allure" value={formatPace(paceMinPerKm)} />
            </View>
            <Input label="Nom du footing" value={title} onChangeText={setTitle} />
            {saveMutation.isError && (
              <Text style={styles.errorText}>{getErrorMessage(saveMutation.error)}</Text>
            )}
          </GlassCard>
        )}

        <View style={styles.controls}>
          {tracking.status === 'idle' && (
            <Button variant="primary" fullWidth onPress={tracking.start}>
              Démarrer
            </Button>
          )}
          {tracking.status === 'tracking' && (
            <>
              <Button variant="glass" onPress={tracking.pause}>
                Pause
              </Button>
              <Button variant="danger" onPress={tracking.stop}>
                Arrêter
              </Button>
            </>
          )}
          {tracking.status === 'paused' && (
            <>
              <Button variant="primary" onPress={tracking.resume}>
                Reprendre
              </Button>
              <Button variant="danger" onPress={tracking.stop}>
                Arrêter
              </Button>
            </>
          )}
          {tracking.status === 'stopped' && (
            <>
              <Button variant="glass" onPress={tracking.reset}>
                Ignorer
              </Button>
              <Button variant="primary" loading={saveMutation.isPending} onPress={handleSave}>
                Enregistrer
              </Button>
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  controls: { flexDirection: 'row', gap: spacing[3] },
});
