import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, X } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { NotificationItem } from '@/features/notifications/NotificationItem';
import {
  listNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '@/api/notifications';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { AppNotification } from '@/types/notification';

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotificationsRequest,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handlePress = (notification: AppNotification) => {
    if (!notification.isRead) markReadMutation.mutate(notification._id);
  };

  return (
    <ScreenContainer style={{ gap: 0 }}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <X size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
        </View>
        {!!data?.unreadCount && (
          <Button variant="glass" loading={markAllReadMutation.isPending} onPress={() => markAllReadMutation.mutate()}>
            Tout marquer lu
          </Button>
        )}
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotificationItem notification={item} onPress={handlePress} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <Spinner />
            </View>
          ) : (
            <View style={styles.centered}>
              <BellOff size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>Aucune notification pour l'instant.</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  listContent: { flexGrow: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[7], gap: spacing[3] },
  emptyText: { color: colors.textFaint, fontSize: fontSize.sm },
});
