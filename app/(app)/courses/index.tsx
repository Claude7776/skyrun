import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Compass, Plus } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spinner } from '@/components/ui/Spinner';
import { CourseCard } from '@/features/courses/CourseCard';
import { FeedCourseCard } from '@/features/social/FeedCourseCard';
import { listCoursesRequest } from '@/api/courses';
import { getFeedRequest } from '@/api/social';
import { useFavoritesStore } from '@/store/favoritesStore';
import { colors, radius, spacing, fontSize, shadows } from '@/styles/theme';

type Mode = 'mine' | 'feed';

export default function CoursesListScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('mine');
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const hydrateFavorites = useFavoritesStore((s) => s.hydrate);

  useEffect(() => {
    hydrateFavorites();
  }, [hydrateFavorites]);

  const ownQuery = useQuery({ queryKey: ['courses'], queryFn: listCoursesRequest, enabled: mode === 'mine' });
  const feedQuery = useQuery({ queryKey: ['feed'], queryFn: getFeedRequest, enabled: mode === 'feed' });

  const isLoading = mode === 'mine' ? ownQuery.isLoading : feedQuery.isLoading;

  const ownCourses = ownQuery.data?.items ?? [];
  const sortedOwnCourses = [...ownCourses].sort((a, b) => {
    const aFav = favoriteIds.includes(a._id) ? 1 : 0;
    const bFav = favoriteIds.includes(b._id) ? 1 : 0;
    return bFav - aFav;
  });

  return (
    <ScreenContainer style={{ gap: 0 }}>
      <View style={styles.tabs}>
        <Tab label="Mes parcours" active={mode === 'mine'} onPress={() => setMode('mine')} />
        <Tab label="Découvrir" active={mode === 'feed'} onPress={() => setMode('feed')} />
      </View>

      {mode === 'mine' ? (
        <FlatList
          data={sortedOwnCourses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CourseCard course={item} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.centered}>
                <Spinner />
              </View>
            ) : (
              <View style={styles.centered}>
                <Plus size={28} color={colors.textFaint} />
                <Text style={styles.emptyText}>Aucun parcours pour l'instant.</Text>
              </View>
            )
          }
        />
      ) : (
        <FlatList
          data={feedQuery.data?.items ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <FeedCourseCard course={item} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.centered}>
                <Spinner />
              </View>
            ) : (
              <View style={styles.centered}>
                <Compass size={28} color={colors.textFaint} />
                <Text style={styles.emptyText}>Aucun parcours partagé pour l'instant.</Text>
              </View>
            )
          }
        />
      )}

      {mode === 'mine' && (
        <Pressable style={styles.fab} onPress={() => router.push('/courses/new')} hitSlop={4}>
          <Plus size={26} color={colors.onPrimary} />
        </Pressable>
      )}
    </ScreenContainer>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing[1],
    bottom: spacing[5],
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing[4],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.pill,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  tabTextActive: { color: colors.onPrimary },
  listContent: { flexGrow: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm },
});
