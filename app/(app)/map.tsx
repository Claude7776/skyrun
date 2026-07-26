import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { RunMap } from '@/components/map/RunMap';
import { LiveStatsBar } from '@/features/tracking/LiveStatsBar';
import { CountdownOverlay } from '@/features/tracking/CountdownOverlay';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { ConfettiBurst } from '@/components/ui/ConfettiBurst';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { createRunRequest } from '@/api/runs';
import { planRouteRequest } from '@/api/routing';
import { formatDistance, formatDuration, formatElevation, formatPace } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';
import { colors, spacing, fontSize, radius } from '@/styles/theme';
import type { RoutePoint } from '@/types/run';
import type { PlannedRoute } from '@/types/route';

const MOODS: LucideIcon[] = [Frown, Meh, Smile, Laugh];

export default function MapScreen() {
  const tracking = useLiveTracking();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('Footing');
  const [isCountingDown, setIsCountingDown] = useState(false);

  const [isPlanning, setIsPlanning] = useState(false);
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([]);
  const [plannedRoute, setPlannedRoute] = useState<PlannedRoute | null>(null);
  // Purely a feel-good touch on the completion screen — there's no mood
  // field on the Run model yet, so this is local-only and never sent to the API.
  const [mood, setMood] = useState<number | null>(null);

  const saveMutation = useMutation({
    mutationFn: createRunRequest,
    onSuccess: () => {
      // The dashboard/history screens cache their own queries — without this
      // they keep showing pre-run numbers until something else happens to
      // refetch them.
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['runs', 'stats'] });
      tracking.reset();
      setPlannedRoute(null);
      setMood(null);
      setTitle('Footing');
    },
  });

  const planMutation = useMutation({
    mutationFn: () => planRouteRequest(waypoints),
    onSuccess: (route) => setPlannedRoute(route),
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

  const startPlanning = () => {
    setIsPlanning(true);
    setWaypoints([]);
    setPlannedRoute(null);
  };

  const cancelPlanning = () => {
    setIsPlanning(false);
    setWaypoints([]);
  };

  const beginRunFromPlan = () => {
    setIsPlanning(false);
    setIsCountingDown(true);
  };

  return (
    <View style={styles.wrapper}>
      <RunMap
        route={tracking.points}
        followUser={tracking.status !== 'stopped'}
        rounded={false}
        onMapPress={isPlanning ? (point) => setWaypoints((prev) => [...prev, point]) : undefined}
        waypoints={isPlanning ? waypoints : undefined}
        suggestedRoute={plannedRoute?.points}
        showCheckpoints={!isPlanning}
      />

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

        {tracking.status !== 'stopped' && !isPlanning && (
          <LiveStatsBar
            distanceKm={tracking.distanceKm}
            durationSec={tracking.durationSec}
            currentSpeedKmh={tracking.currentSpeedKmh}
            elevationGainM={tracking.elevationGainM}
            calories={tracking.caloriesEstimate}
            status={tracking.status}
          />
        )}

        {isPlanning && (
          <GlassCard style={styles.planCard} contentStyle={styles.planCardContent}>
            <Text style={styles.summaryTitle}>Planifier un itinéraire</Text>
            <Text style={styles.planHint}>
              Touchez la carte pour ajouter des points ({waypoints.length} sélectionné{waypoints.length > 1 ? 's' : ''}, 2 minimum).
            </Text>

            {plannedRoute && (
              <View style={styles.summaryRow}>
                <SummaryStat label="Distance" value={formatDistance(plannedRoute.distanceKm)} />
                <SummaryStat label="Durée estimée" value={formatDuration(plannedRoute.estimatedDurationSec)} />
              </View>
            )}

            {planMutation.isError && <Text style={styles.errorText}>{getErrorMessage(planMutation.error)}</Text>}

            <View style={styles.controls}>
              <View style={styles.controlItem}>
                <Button variant="glass" fullWidth onPress={cancelPlanning}>
                  Annuler
                </Button>
              </View>
              {plannedRoute ? (
                <View style={styles.controlItem}>
                  <Button variant="primary" fullWidth onPress={beginRunFromPlan}>
                    Démarrer ce parcours
                  </Button>
                </View>
              ) : (
                <View style={styles.controlItem}>
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={waypoints.length < 2}
                    loading={planMutation.isPending}
                    onPress={() => planMutation.mutate()}
                  >
                    Calculer
                  </Button>
                </View>
              )}
            </View>
          </GlassCard>
        )}

        {tracking.status === 'stopped' && (
          <View style={styles.summaryCardOuter}>
            <ConfettiBurst />
            <GlassCard contentStyle={styles.summaryCard}>
              <View style={styles.celebration}>
                <CheckmarkBadge />
                <Text style={styles.congratsTitle}>Félicitations !</Text>
                <Text style={styles.congratsSubtitle}>Tu as terminé ton footing 🎉</Text>
              </View>

              <View style={styles.summaryRow}>
                <SummaryStat label="Distance" value={formatDistance(tracking.distanceKm)} />
                <SummaryStat label="Temps" value={formatDuration(tracking.durationSec)} />
                <SummaryStat label="Allure" value={formatPace(paceMinPerKm)} />
                <SummaryStat label="Calories" value={`${tracking.caloriesEstimate} kcal`} />
                <SummaryStat label="Dénivelé" value={formatElevation(tracking.elevationGainM)} />
              </View>

              <View style={styles.moodSection}>
                <Text style={styles.moodLabel}>Comment te sens-tu ?</Text>
                <View style={styles.moodRow}>
                  {MOODS.map((MoodIcon, i) => (
                    <Pressable
                      key={i}
                      onPress={() => setMood(i)}
                      style={[styles.moodButton, mood === i && styles.moodButtonActive]}
                    >
                      <MoodIcon size={20} color={mood === i ? colors.primary : colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              </View>

              <Input label="Nom du footing" value={title} onChangeText={setTitle} />
              {saveMutation.isError && (
                <Text style={styles.errorText}>{getErrorMessage(saveMutation.error)}</Text>
              )}
            </GlassCard>
          </View>
        )}

        <View style={styles.controls}>
          {tracking.status === 'idle' && !isCountingDown && !isPlanning && (
            <>
              <View style={styles.controlItem}>
                <Button variant="glass" fullWidth onPress={startPlanning}>
                  Planifier un itinéraire
                </Button>
              </View>
              <View style={styles.controlItem}>
                <Button variant="primary" fullWidth onPress={() => setIsCountingDown(true)}>
                  Démarrer
                </Button>
              </View>
            </>
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
                <Button
                  variant="glass"
                  fullWidth
                  onPress={() => {
                    tracking.reset();
                    setPlannedRoute(null);
                    setMood(null);
                  }}
                >
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

function CheckmarkBadge() {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 120 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.checkmarkBadge, animatedStyle]}>
      <Check size={32} color={colors.onPrimary} strokeWidth={3} />
    </Animated.View>
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
    padding: spacing[5],
  },
  errorCard: { marginBottom: spacing[3] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  errorText: { color: colors.danger, fontSize: fontSize.sm, flexShrink: 1 },
  summaryCardOuter: { position: 'relative', marginTop: 'auto', marginBottom: spacing[3] },
  summaryCard: { gap: spacing[5] },
  summaryTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', letterSpacing: -0.3 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: spacing[3] },
  celebration: { alignItems: 'center', gap: spacing[2] },
  checkmarkBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  congratsTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', letterSpacing: -0.3 },
  congratsSubtitle: { color: colors.textMuted, fontSize: fontSize.sm },
  moodSection: { gap: spacing[2], alignItems: 'center' },
  moodLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  moodRow: { flexDirection: 'row', gap: spacing[3] },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  moodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(31, 206, 143, 0.14)',
  },
  planCard: { marginBottom: spacing[3] },
  planCardContent: { gap: spacing[4] },
  planHint: { color: colors.textMuted, fontSize: fontSize.sm },
  controls: { flexDirection: 'row', gap: spacing[3] },
  controlItem: { flex: 1 },
});
