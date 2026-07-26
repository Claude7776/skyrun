import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Info, ListChecks, Route as RouteIcon, Settings, Target } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarPicker } from '@/features/auth/AvatarPicker';
import { ProfileForm } from '@/features/auth/ProfileForm';
import { BadgesRow } from '@/features/dashboard/BadgesRow';
import { deriveBadges } from '@/features/dashboard/deriveBadges';
import { useAuthStore } from '@/store/authStore';
import { getRunRecordsRequest, getRunSummaryRequest } from '@/api/runs';
import { listGoalsRequest } from '@/api/goals';
import { formatDistance, formatDuration } from '@/utils/format';
import { colors, spacing, fontSize, radius, motion } from '@/styles/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);

  const summaryQuery = useQuery({ queryKey: ['runs', 'stats', 'summary'], queryFn: getRunSummaryRequest });
  const recordsQuery = useQuery({ queryKey: ['runs', 'stats', 'records'], queryFn: getRunRecordsRequest });
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: listGoalsRequest });
  const badges = deriveBadges(summaryQuery.data, recordsQuery.data, goalsQuery.data);

  return (
    <ScreenContainer scroll>
      <View style={styles.topRow}>
        <Text style={styles.pageTitle}>Profil</Text>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10}>
          <Settings size={22} color={colors.text} />
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.duration(motion.base)} style={styles.identity}>
        <View style={styles.identityRow}>
          <AvatarPicker />
          <View style={styles.identityText}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.tagline}>Coureur passionné</Text>
          </View>
          <Pressable onPress={() => setEditing((v) => !v)} style={styles.editButton}>
            <Text style={styles.editButtonText}>{editing ? 'Fermer' : 'Éditer'}</Text>
          </Pressable>
        </View>
      </Animated.View>

      {summaryQuery.data && (
        <View style={styles.statsRow}>
          <StatBox value={String(summaryQuery.data.totalRuns)} label="Activités" />
          <StatBox value={formatDistance(summaryQuery.data.totalDistanceKm)} label="Distance totale" />
          <StatBox value={formatDuration(summaryQuery.data.totalDurationSec)} label="Temps total" />
        </View>
      )}

      <View style={styles.badgesHeader}>
        <Text style={styles.sectionTitle}>Badges</Text>
        {badges.length > 0 && (
          <Pressable onPress={() => router.push('/goals')} hitSlop={8}>
            <Text style={styles.seeAllLink}>Voir tout</Text>
          </Pressable>
        )}
      </View>
      <BadgesRow badges={badges} delay={120} />

      {editing && (
        <GlassCard delay={180}>
          <ProfileForm />
        </GlassCard>
      )}

      <Animated.View entering={FadeIn.duration(motion.base).delay(240)} style={styles.navList}>
        <NavRow icon={RouteIcon} label="Mes parcours" onPress={() => router.push('/courses')} />
        <NavRow icon={ListChecks} label="Mes statistiques" onPress={() => router.push('/stats')} />
        <NavRow icon={Target} label="Défis" onPress={() => router.push('/goals')} />
        <NavRow icon={Settings} label="Paramètres" onPress={() => router.push('/settings')} />
        <NavRow icon={Info} label="À propos" onPress={() => router.push('/about')} />
      </Animated.View>
    </ScreenContainer>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxValue}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

function NavRow({ icon: Icon, label, onPress }: { icon: typeof RouteIcon; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard contentStyle={styles.navRowContent}>
        <View style={styles.navRowLeft}>
          <Icon size={18} color={colors.primary} />
          <Text style={styles.navRowLabel}>{label}</Text>
        </View>
        <ChevronRight size={18} color={colors.textFaint} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  identity: { gap: spacing[2] },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  identityText: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  tagline: { color: colors.textMuted, fontSize: fontSize.sm },
  editButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  editButtonText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing[3] },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  statBoxValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  statBoxLabel: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  badgesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  seeAllLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  navList: { gap: spacing[3] },
  navRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  navRowLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
});
