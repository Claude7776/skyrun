import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, History, ListChecks, Route as RouteIcon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AvatarPicker } from '@/features/auth/AvatarPicker';
import { ProfileForm } from '@/features/auth/ProfileForm';
import { BadgesRow } from '@/features/dashboard/BadgesRow';
import { deriveBadges } from '@/features/dashboard/deriveBadges';
import { useAuthStore } from '@/store/authStore';
import { logoutRequest } from '@/api/auth';
import { getRunRecordsRequest, getRunSummaryRequest } from '@/api/runs';
import { listGoalsRequest } from '@/api/goals';
import { formatDistance, formatDuration } from '@/utils/format';
import { colors, spacing, fontSize, motion } from '@/styles/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);

  // Same query keys already used on the dashboard — react-query serves this
  // from cache if already fetched there, no extra network round-trip.
  const summaryQuery = useQuery({ queryKey: ['runs', 'stats', 'summary'], queryFn: getRunSummaryRequest });
  const recordsQuery = useQuery({ queryKey: ['runs', 'stats', 'records'], queryFn: getRunRecordsRequest });
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: listGoalsRequest });
  const badges = deriveBadges(summaryQuery.data, recordsQuery.data, goalsQuery.data);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      await clearSession();
      router.replace('/login');
    }
  };

  return (
    <ScreenContainer scroll>
      <Animated.View entering={FadeIn.duration(motion.base)} style={styles.identity}>
        <AvatarPicker />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </Animated.View>

      {summaryQuery.data && (
        <GlassCard contentStyle={styles.statsRow} delay={60}>
          <Stat
            icon={ListChecks}
            value={summaryQuery.data.totalRuns}
            formatter={(n) => String(Math.round(n))}
            label="Activités"
          />
          <View style={styles.statDivider} />
          <Stat
            icon={RouteIcon}
            value={summaryQuery.data.totalDistanceKm}
            formatter={formatDistance}
            label="Distance totale"
          />
          <View style={styles.statDivider} />
          <Stat
            icon={History}
            value={summaryQuery.data.totalDurationSec}
            formatter={formatDuration}
            label="Temps total"
          />
        </GlassCard>
      )}

      <BadgesRow badges={badges} delay={120} />

      <GlassCard delay={180}>
        <ProfileForm />
      </GlassCard>

      <Animated.View entering={FadeIn.duration(motion.base).delay(240)} style={styles.navList}>
        <NavRow icon={RouteIcon} label="Mes parcours" onPress={() => router.push('/courses')} />
        <NavRow icon={History} label="Mon historique" onPress={() => router.push('/history')} />
        <NavRow icon={ListChecks} label="Mes objectifs" onPress={() => router.push('/goals')} />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(motion.base).delay(300)}>
        <Button variant="danger" fullWidth onPress={handleLogout}>
          Se déconnecter
        </Button>
      </Animated.View>
    </ScreenContainer>
  );
}

function Stat({
  icon: Icon,
  value,
  formatter,
  label,
}: {
  icon: typeof RouteIcon;
  value: number;
  formatter: (n: number) => string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Icon size={16} color={colors.primary} />
      <AnimatedNumber value={value} formatter={formatter} style={styles.statValue} />
      <Text style={styles.statLabel}>{label}</Text>
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
  identity: { alignItems: 'center', gap: spacing[2] },
  name: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginTop: spacing[2] },
  email: { color: colors.textMuted, fontSize: fontSize.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statDivider: { width: 1, height: 36, backgroundColor: colors.border },
  stat: { alignItems: 'center', gap: spacing[1] },
  statValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  navList: { gap: spacing[3] },
  navRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  navRowLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
});
