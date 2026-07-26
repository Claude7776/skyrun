import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Play, Route as RouteIcon, Timer, Gauge } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/features/dashboard/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { listRunsRequest } from '@/api/runs';
import { listGoalsRequest } from '@/api/goals';
import { goalLabel } from '@/features/goals/constants';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useAuthStore } from '@/store/authStore';
import type { Run } from '@/types/run';
import type { Goal } from '@/types/goal';
import { formatDistance, formatDuration, formatPace } from '@/utils/format';
import { colors, spacing, fontSize, radius, gradientBrand, shadows } from '@/styles/theme';

function isThisWeek(dateIso: string): boolean {
  const diffDays = (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < 7;
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const runsQuery = useQuery({ queryKey: ['runs'], queryFn: listRunsRequest });
  const goalsQuery = useQuery<Goal[]>({ queryKey: ['goals'], queryFn: listGoalsRequest });

  const weekRuns = useMemo(() => {
    const items: Run[] = runsQuery.data?.items ?? [];
    return items.filter((r) => isThisWeek(r.date));
  }, [runsQuery.data]);

  const weekDistanceKm = weekRuns.reduce((sum, r) => sum + r.distanceKm, 0);
  const weekDurationSec = weekRuns.reduce((sum, r) => sum + r.durationSec, 0);
  const weekCalories = weekRuns.reduce((sum, r) => sum + r.calories, 0);
  const weekPaceMinPerKm = weekDistanceKm > 0 ? weekDurationSec / 60 / weekDistanceKm : 0;

  const runsItems = runsQuery.data?.items;
  const lastRun: Run | undefined =
    runsItems && runsItems.length > 0
      ? [...runsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : undefined;

  const goalsData: Goal[] | undefined = goalsQuery.data;
  const activeGoal = goalsData?.find((g) => !g.achieved);

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Prêt pour ton prochain défi ?</Text>
        </View>
        <NotificationBell />
      </View>

      <Pressable onPress={() => router.push('/map')}>
        <LinearGradient colors={gradientBrand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cta, shadows.glow]}>
          <View style={styles.ctaIconWrap}>
            <RouteIcon size={22} color={colors.primary} />
          </View>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>Commencer{'\n'}un footing</Text>
          </View>
          <View style={styles.ctaPlayWrap}>
            <Play size={20} color={colors.onPrimary} fill={colors.onPrimary} />
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Résumé de la semaine</Text>
          <Text style={styles.sectionMeta}>
            {weekRuns.length} activité{weekRuns.length > 1 ? 's' : ''}
          </Text>
        </View>

        {runsQuery.isLoading ? (
          <View style={styles.centered}>
            <Spinner />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard icon={RouteIcon} label="Distance totale" value={formatDistance(weekDistanceKm)} />
            <StatCard icon={Timer} label="Temps total" value={formatDuration(weekDurationSec)} />
            <StatCard icon={Gauge} label="Allure moyenne" value={formatPace(weekPaceMinPerKm)} />
            <StatCard icon={Flame} label="Calories brûlées" value={`${Math.round(weekCalories)} kcal`} />
          </View>
        )}
      </View>

      {activeGoal && (
        <Pressable onPress={() => router.push('/goals')}>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Objectif en cours</Text>
              <Text style={styles.goalPercent}>{activeGoal.progressPercent}%</Text>
            </View>
            <ProgressBar percent={activeGoal.progressPercent} />
            <Text style={styles.goalMeta}>
              {goalLabel(activeGoal.type, activeGoal.targetDistanceKm)} · {activeGoal.bestDistanceKm.toFixed(1)} /{' '}
              {activeGoal.targetDistanceKm} km
            </Text>
          </View>
        </Pressable>
      )}

      {lastRun && (
        <Pressable onPress={() => router.push(`/history/${lastRun._id}`)}>
          <View style={styles.lastRunCard}>
            <Text style={styles.lastRunTitle}>Dernière activité</Text>
            <Text style={styles.lastRunName} numberOfLines={1}>
              {lastRun.title}
            </Text>
            <View style={styles.lastRunMetaRow}>
              <Text style={styles.lastRunMeta}>{formatDistance(lastRun.distanceKm)}</Text>
              <Text style={styles.lastRunMeta}>{formatDuration(lastRun.durationSec)}</Text>
              <Text style={styles.lastRunMeta}>{formatPace(lastRun.avgPaceMinPerKm)}</Text>
            </View>
          </View>
        </Pressable>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { color: colors.text, fontSize: fontSize['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing[2] },
  centered: { alignItems: 'center', paddingVertical: spacing[6] },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing[4],
    gap: spacing[3],
  },
  ctaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextWrap: { flex: 1 },
  ctaTitle: { color: colors.onPrimary, fontSize: fontSize.md, fontWeight: '800', lineHeight: 20 },
  ctaPlayWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(4, 20, 13, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionMeta: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    gap: spacing[3],
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  goalPercent: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  goalMeta: { color: colors.textMuted, fontSize: fontSize.xs },
  lastRunCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    gap: spacing[2],
  },
  lastRunTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  lastRunName: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  lastRunMetaRow: { flexDirection: 'row', gap: spacing[4] },
  lastRunMeta: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
});
