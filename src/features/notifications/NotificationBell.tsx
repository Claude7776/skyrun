import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
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
          {/* Ping ring behind the badge — pulses independently so the count text stays readable */}
          <PingRing />
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

function PingRing() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) }), -1, false);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  return <Animated.View style={[styles.ping, animatedStyle]} />;
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
  ping: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
