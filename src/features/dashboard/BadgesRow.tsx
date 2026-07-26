import { StyleSheet, Text, View } from 'react-native';
import { Award } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing, fontSize, radius } from '@/styles/theme';
import type { Badge } from './deriveBadges';

export function BadgesRow({ badges, delay }: { badges: Badge[]; delay?: number }) {
  return (
    <GlassCard contentStyle={styles.content} delay={delay}>
      <View style={styles.header}>
        <Award size={18} color={colors.accent} />
        <Text style={styles.title}>Badges récents</Text>
      </View>

      {badges.length === 0 ? (
        <Text style={styles.empty}>Continuez à courir pour débloquer vos premiers badges 🏅</Text>
      ) : (
        <View style={styles.row}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.chip}>
              <Text style={styles.chipEmoji}>{badge.emoji}</Text>
              <Text style={styles.chipLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  empty: { color: colors.textFaint, fontSize: fontSize.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: 'rgba(56, 217, 169, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 217, 169, 0.3)',
  },
  chipEmoji: { fontSize: fontSize.sm },
  chipLabel: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
});
