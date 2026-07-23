import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { CalendarX } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spinner } from '@/components/ui/Spinner';
import { RunCard } from '@/features/history/RunCard';
import { listRunsRequest } from '@/api/runs';
import { colors, spacing, fontSize } from '@/styles/theme';

export default function HistoryListScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: listRunsRequest,
  });

  return (
    <ScreenContainer style={{ gap: 0 }}>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <RunCard run={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <Spinner />
            </View>
          ) : (
            <View style={styles.centered}>
              <CalendarX size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>Aucun footing enregistré pour l'instant.</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { flexGrow: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm, textAlign: 'center' },
});
