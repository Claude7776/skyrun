import { StyleSheet, Text, View } from 'react-native';
import { Gauge, Route as RouteIcon, Timer, Trophy } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatDistance, formatDuration, formatPace } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { RunRecords } from '@/types/run';

export function RecordsList({ records }: { records: RunRecords }) {
  const rows = [
    {
      icon: RouteIcon,
      label: 'Plus longue distance',
      value: records.longestDistance ? formatDistance(records.longestDistance.distanceKm) : '—',
    },
    {
      icon: Timer,
      label: 'Plus longue durée',
      value: records.longestDuration ? formatDuration(records.longestDuration.durationSec) : '—',
    },
    {
      icon: Gauge,
      label: 'Meilleure allure',
      value: records.bestPace ? formatPace(records.bestPace.avgPaceMinPerKm) : '—',
    },
  ];

  return (
    <GlassCard contentStyle={styles.content}>
      <View style={styles.header}>
        <Trophy size={18} color={colors.warning} />
        <Text style={styles.title}>Records personnels</Text>
      </View>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <row.icon size={16} color={colors.textMuted} />
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  label: { color: colors.textMuted, fontSize: fontSize.sm, flex: 1 },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
});
