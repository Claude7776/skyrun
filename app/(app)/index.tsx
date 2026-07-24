import { StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Gauge, ListChecks, Route as RouteIcon, Target, Timer } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/features/dashboard/StatCard';
import { BadgesRow } from '@/features/dashboard/BadgesRow';
import { deriveBadges } from '@/features/dashboard/deriveBadges';
import { DistanceBarChart } from '@/features/stats/DistanceBarChart';
import { RecordsList } from '@/features/stats/RecordsList';
import { RunCard } from '@/features/history/RunCard';
import { GoalCard } from '@/features/goals/GoalCard';
import { Spinner } from '@/components/ui/Spinner';
import {
  getRunSummaryRequest,
  getWeeklyStatsRequest,
  getMonthlyStatsRequest,
  getRunRecordsRequest,
  listRunsRequest,
} from '@/api/runs';
import { deleteGoalRequest, listGoalsRequest } from '@/api/goals';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useAuthStore } from '@/store/authStore';
import type { Run, WeeklyPoint, MonthlyPoint } from '@/types/run';
import type { Goal } from '@/types/goal';
import { formatDistance, formatDuration, formatPace, formatShortDate, formatShortMonth } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const summaryQuery = useQuery({ queryKey: ['runs', 'stats', 'summary'], queryFn: getRunSummaryRequest });
  const weeklyQuery = useQuery<WeeklyPoint[]>({ queryKey: ['runs', 'stats', 'weekly'], queryFn: getWeeklyStatsRequest });
  const monthlyQuery = useQuery<MonthlyPoint[]>({
    queryKey: ['runs', 'stats', 'monthly'],
    queryFn: getMonthlyStatsRequest,
  });
  const recordsQuery = useQuery({ queryKey: ['runs', 'stats', 'records'], queryFn: getRunRecordsRequest });
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: listGoalsRequest });
  const runsQuery = useQuery({ queryKey: ['runs'], queryFn: listRunsRequest });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoalRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const summary = summaryQuery.data;
  const goalsData: Goal[] | undefined = goalsQuery.data;
  const achievedGoalsCount = goalsData?.filter((g) => g.achieved).length;
  const activeGoals = goalsData?.filter((g) => !g.achieved).slice(0, 2);
  const weeklyData: WeeklyPoint[] | undefined = weeklyQuery.data;
  const monthlyData: MonthlyPoint[] | undefined = monthlyQuery.data;

  const runsItems = runsQuery.data?.items;
  const lastRun: Run | undefined =
    runsItems && runsItems.length > 0
      ? [...runsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : undefined;

  const badges = deriveBadges(summary, recordsQuery.data, goalsData);

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Voici votre activité récente.</Text>
        </View>
        <NotificationBell />
      </View>

      <Button variant="primary" fullWidth onPress={() => router.push('/map')}>
        Commencer un footing
      </Button>

      {summaryQuery.isLoading && (
        <View style={styles.centered}>
          <Spinner />
        </View>
      )}

      {summary && (
        <View style={styles.statsGrid}>
          <StatCard
            icon={RouteIcon}
            label="Distance totale"
            value={formatDistance(summary.totalDistanceKm)}
            delay={0}
          />
          <StatCard icon={Timer} label="Temps total" value={formatDuration(summary.totalDurationSec)} delay={60} />
          <StatCard icon={ListChecks} label="Footings" value={String(summary.totalRuns)} delay={120} />
          <StatCard icon={Flame} label="Calories" value={`${summary.totalCalories} kcal`} delay={180} />
          <StatCard icon={Gauge} label="Allure moyenne" value={formatPace(summary.avgPaceMinPerKm)} delay={240} />
          <StatCard icon={Timer} label="Temps moyen" value={formatDuration(summary.avgDurationSec)} delay={300} />
          {goalsData && (
            <StatCard
              icon={Target}
              label="Objectifs atteints"
              value={`${achievedGoalsCount}/${goalsData.length}`}
              delay={360}
            />
          )}
        </View>
      )}

      {lastRun && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dernière activité</Text>
            <Link href="/history" style={styles.sectionLink}>
              Voir tout
            </Link>
          </View>
          <RunCard run={lastRun} />
        </View>
      )}

      {activeGoals && activeGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs en cours</Text>
          {activeGoals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onDelete={(id) => deleteGoalMutation.mutate(id)} />
          ))}
        </View>
      )}

      <BadgesRow badges={badges} delay={420} />

      {weeklyData && (
        <DistanceBarChart
          title="Kilomètres par semaine"
          labels={weeklyData.map((w) => formatShortDate(w.weekStart))}
          data={weeklyData.map((w) => w.distanceKm)}
        />
      )}

      {monthlyData && (
        <DistanceBarChart
          title="Progression mensuelle"
          labels={monthlyData.map((m) => formatShortMonth(m.month))}
          data={monthlyData.map((m) => m.distanceKm)}
        />
      )}

      {recordsQuery.data && <RecordsList records={recordsQuery.data} />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing[1] },
  centered: { alignItems: 'center', paddingVertical: spacing[6] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
});
