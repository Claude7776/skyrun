import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { CalendarX, Flame, Gauge, ListChecks, Timer } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/features/dashboard/StatCard';
import { DistanceBarChart } from '@/features/stats/DistanceBarChart';
import { RecordsList } from '@/features/stats/RecordsList';
import { RunCard } from '@/features/history/RunCard';
import {
  getRunSummaryRequest,
  getWeeklyStatsRequest,
  getMonthlyStatsRequest,
  getRunRecordsRequest,
  listRunsRequest,
} from '@/api/runs';
import { formatDistance, formatDuration, formatPace, formatShortDate, formatShortMonth } from '@/utils/format';
import { colors, radius, spacing, fontSize } from '@/styles/theme';
import type { Run, WeeklyPoint, MonthlyPoint } from '@/types/run';

type Section = 'overview' | 'activities' | 'progress';

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'overview', label: 'Aperçu' },
  { value: 'activities', label: 'Activités' },
  { value: 'progress', label: 'Progression' },
];

export default function StatsScreen() {
  const [section, setSection] = useState<Section>('overview');

  const summaryQuery = useQuery({ queryKey: ['runs', 'stats', 'summary'], queryFn: getRunSummaryRequest });
  const weeklyQuery = useQuery<WeeklyPoint[]>({ queryKey: ['runs', 'stats', 'weekly'], queryFn: getWeeklyStatsRequest });
  const monthlyQuery = useQuery<MonthlyPoint[]>({ queryKey: ['runs', 'stats', 'monthly'], queryFn: getMonthlyStatsRequest });
  const recordsQuery = useQuery({ queryKey: ['runs', 'stats', 'records'], queryFn: getRunRecordsRequest });
  const runsQuery = useQuery({ queryKey: ['runs'], queryFn: listRunsRequest });

  const weeklyData: WeeklyPoint[] | undefined = weeklyQuery.data;
  const monthlyData: MonthlyPoint[] | undefined = monthlyQuery.data;
  const lastWeek = weeklyData?.[weeklyData.length - 1];
  const prevWeek = weeklyData?.[weeklyData.length - 2];
  const weekTrendPercent =
    lastWeek && prevWeek && prevWeek.distanceKm > 0
      ? Math.round(((lastWeek.distanceKm - prevWeek.distanceKm) / prevWeek.distanceKm) * 100)
      : null;

  const sortedRuns = useMemo(() => {
    const items: Run[] = runsQuery.data?.items ?? [];
    return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [runsQuery.data]);

  return (
    <ScreenContainer scroll style={{ gap: 0 }}>
      <Text style={styles.pageTitle}>Statistiques</Text>

      <View style={styles.segmented}>
        {SECTIONS.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => setSection(s.value)}
            style={[styles.segment, section === s.value && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, section === s.value && styles.segmentTextActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      {section === 'overview' && (
        <View style={styles.section}>
          {weeklyQuery.isLoading ? (
            <View style={styles.centered}>
              <Spinner />
            </View>
          ) : lastWeek ? (
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Cette semaine</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroValue}>{formatDistance(lastWeek.distanceKm)}</Text>
                {weekTrendPercent !== null && (
                  <Text style={[styles.heroTrend, weekTrendPercent < 0 && styles.heroTrendNegative]}>
                    {weekTrendPercent >= 0 ? '+' : ''}
                    {weekTrendPercent}% vs semaine dernière
                  </Text>
                )}
              </View>
            </View>
          ) : null}

          {weeklyData && weeklyData.length > 1 && (
            <DistanceBarChart
              title="Kilomètres par semaine"
              labels={weeklyData.map((w) => formatShortDate(w.weekStart))}
              data={weeklyData.map((w) => w.distanceKm)}
            />
          )}

          {summaryQuery.data && (
            <View style={styles.overviewGrid}>
              <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
              <View style={styles.statsGrid}>
                <StatCard icon={ListChecks} label="Activités" value={String(summaryQuery.data.totalRuns)} />
                <StatCard icon={Gauge} label="Allure moyenne" value={formatPace(summaryQuery.data.avgPaceMinPerKm)} />
                <StatCard icon={Timer} label="Temps total" value={formatDuration(summaryQuery.data.totalDurationSec)} />
                <StatCard icon={Flame} label="Calories" value={`${summaryQuery.data.totalCalories} kcal`} />
              </View>
            </View>
          )}
        </View>
      )}

      {section === 'activities' && (
        <View style={styles.section}>
          {runsQuery.isLoading ? (
            <View style={styles.centered}>
              <Spinner />
            </View>
          ) : sortedRuns.length === 0 ? (
            <View style={styles.centered}>
              <CalendarX size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>Aucune activité pour l'instant.</Text>
            </View>
          ) : (
            sortedRuns.map((run) => <RunCard key={run._id} run={run} />)
          )}
        </View>
      )}

      {section === 'progress' && (
        <View style={styles.section}>
          {monthlyData && monthlyData.length > 1 && (
            <DistanceBarChart
              title="Progression mensuelle"
              labels={monthlyData.map((m) => formatShortMonth(m.month))}
              data={monthlyData.map((m) => m.distanceKm)}
            />
          )}
          {recordsQuery.data && <RecordsList records={recordsQuery.data} />}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing[4] },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing[5],
  },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing[2], borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  segmentTextActive: { color: colors.onPrimary },
  section: { gap: spacing[4] },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    gap: spacing[2],
  },
  heroLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: spacing[3] },
  heroValue: { color: colors.text, fontSize: fontSize['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  heroTrend: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  heroTrendNegative: { color: colors.danger },
  overviewGrid: { gap: spacing[3] },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
});
