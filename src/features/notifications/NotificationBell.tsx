import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react-native';
import { listNotificationsRequest } from '@/api/notifications';
import { colors, radius } from '@/styles/theme';

export function NotificationBell() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotificationsRequest,
    refetchInterval: 30000,
  });

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Pressable onPress={() => router.push('/notifications')} hitSlop={10} style={styles.wrapper}>
      <Bell size={22} color={colors.text} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
