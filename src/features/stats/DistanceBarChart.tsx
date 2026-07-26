import { Text, View, useWindowDimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing, fontSize } from '@/styles/theme';

interface DistanceBarChartProps {
  title: string;
  labels: string[];
  data: number[];
}

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(31, 206, 143, ${opacity})`,
  labelColor: () => colors.textMuted,
  propsForBackgroundLines: { stroke: colors.border },
  barPercentage: 0.55,
  barRadius: 6,
  fillShadowGradientFrom: '#16a673',
  fillShadowGradientTo: '#1fce8f',
  fillShadowGradientFromOpacity: 1,
  fillShadowGradientToOpacity: 1,
};

export function DistanceBarChart({ title, labels, data }: DistanceBarChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing[5] * 2 - spacing[5] * 2; // screen padding + card padding

  return (
    <GlassCard>
      <Text style={styles.title}>{title}</Text>
      {data.every((v) => v === 0) ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Pas encore de données</Text>
        </View>
      ) : (
        <BarChart
          data={{ labels, datasets: [{ data }] }}
          width={chartWidth}
          height={180}
          fromZero
          withInnerLines
          yAxisLabel=""
          yAxisSuffix=" km"
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing[3] },
  chart: { borderRadius: 12, marginLeft: -spacing[5] },
  empty: { paddingVertical: spacing[6], alignItems: 'center' },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm },
});
