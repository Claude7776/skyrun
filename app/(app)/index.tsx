import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Flame, Gauge, ListChecks, Route as RouteIcon, Target, Timer } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatCard } from '@/features/dashboard/StatCard';
import { DistanceBarChart } from '@/features/stats/DistanceBarChart';
import { RecordsList } from '@/features/stats/RecordsList';
import { Spinner } from '@/components/ui/Spinner';
import {
  getRunSummaryRequest,
  getWeeklyStatsRequest,
  getMonthlyStatsRequest,
  getRunRecordsRequest,
} from '@/api/runs';
import { listGoalsRequest } from '@/api/goals';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useAuthStore } from '@/store/authStore';
import type { WeeklyPoint, MonthlyPoint } from '@/types/run';
import type { Goal } from '@/types/goal';
import { formatDistance, formatDuration, formatPace, formatShortDate, formatShortMonth } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);

  const summaryQuery = useQuery({ queryKey: ['runs', 'stats', 'summary'], queryFn: getRunSummaryRequest });
  const weeklyQuery = useQuery<WeeklyPoint[]>({ queryKey: ['runs', 'stats', 'weekly'], queryFn: getWeeklyStatsRequest });
  const monthlyQuery = useQuery<MonthlyPoint[]>({
    queryKey: ['runs', 'stats', 'monthly'],
    queryFn: getMonthlyStatsRequest,
  });
  const recordsQuery = useQuery({ queryKey: ['runs', 'stats', 'records'], queryFn: getRunRecordsRequest });
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: listGoalsRequest });

  const summary = summaryQuery.data;
  const goalsData: Goal[] | undefined = goalsQuery.data;
  const achievedGoalsCount = goalsData?.filter((g) => g.achieved).length;
  const weeklyData: WeeklyPoint[] | undefined = weeklyQuery.data;
  const monthlyData: MonthlyPoint[] | undefined = monthlyQuery.data;

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Voici votre activité récente.</Text>
        </View>
        <NotificationBell />
      </View>

      {summaryQuery.isLoading && (
        <View style={styles.centered}>
          <Spinner />
        </View>
      )}

      {summary && (
        <View style={styles.statsGrid}>
          <StatCard icon={RouteIcon} label="Distance totale" value={formatDistance(summary.totalDistanceKm)} />
          <StatCard icon={Timer} label="Temps total" value={formatDuration(summary.totalDurationSec)} />
          <StatCard icon={ListChecks} label="Footings" value={String(summary.totalRuns)} />
          <StatCard icon={Flame} label="Calories" value={`${summary.totalCalories} kcal`} />
          <StatCard icon={Gauge} label="Allure moyenne" value={formatPace(summary.avgPaceMinPerKm)} />
          <StatCard icon={Timer} label="Temps moyen" value={formatDuration(summary.avgDurationSec)} />
          {goalsData && (
            <StatCard icon={Target} label="Objectifs atteints" value={`${achievedGoalsCount}/${goalsData.length}`} />
          )}
        </View>
      )}

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
});
