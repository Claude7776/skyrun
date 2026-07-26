import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { CalendarX } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { RunCard } from '@/features/history/RunCard';
import { listRunsRequest } from '@/api/runs';
import { colors, radius, spacing, fontSize } from '@/styles/theme';
import type { Run } from '@/types/run';

type Period = 'all' | 'week' | 'month';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

function isWithinPeriod(dateIso: string, period: Period): boolean {
  if (period === 'all') return true;
  const date = new Date(dateIso);
  const now = new Date();
  if (period === 'week') {
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 7;
  }
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function HistoryListScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: listRunsRequest,
  });

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('all');

  // Client-side only: the full list is already loaded (limit: 100), so
  // search/period filtering doesn't need a new API call or backend support.
  const filteredRuns = useMemo(() => {
    const items: Run[] = data?.items ?? [];
    const query = search.trim().toLowerCase();
    return items
      .filter((run) => run.title.toLowerCase().includes(query))
      .filter((run) => isWithinPeriod(run.date, period))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, search, period]);

  return (
    <ScreenContainer style={{ gap: 0 }}>
      <FlatList
        data={filteredRuns}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <RunCard run={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Input
              placeholder="Rechercher un footing..."
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />

            <View style={styles.filterRow}>
              {PERIOD_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setPeriod(option.value)}
                  style={[styles.filterChip, period === option.value && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, period === option.value && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <Spinner />
            </View>
          ) : (
            <View style={styles.centered}>
              <CalendarX size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>
                {search || period !== 'all'
                  ? 'Aucun footing ne correspond.'
                  : "Aucun footing enregistré pour l'instant."}
              </Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: { gap: spacing[4], marginBottom: spacing[4] },
  filterRow: { flexDirection: 'row', gap: spacing[2] },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: colors.onPrimary },
  listContent: { flexGrow: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm, textAlign: 'center' },
});
