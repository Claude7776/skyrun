import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlarmClock, Target, Trophy, type LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatRelativeTime } from '@/utils/format';
import { colors, spacing, fontSize } from '@/styles/theme';
import type { AppNotification, NotificationType } from '@/types/notification';

const ICONS: Record<NotificationType, LucideIcon> = {
  goal_achieved: Target,
  new_record: Trophy,
  training_reminder: AlarmClock,
};

const ICON_COLORS: Record<NotificationType, string> = {
  goal_achieved: colors.success,
  new_record: colors.warning,
  training_reminder: colors.primary,
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const Icon = ICONS[notification.type];

  return (
    <Pressable onPress={() => onPress(notification)}>
      <GlassCard contentStyle={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${ICON_COLORS[notification.type]}22` }]}>
          <Icon size={18} color={ICON_COLORS[notification.type]} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.message, !notification.isRead && styles.messageUnread]}>{notification.message}</Text>
          <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
        </View>
        {!notification.isRead && <View style={styles.dot} />}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1, gap: spacing[1] },
  message: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  messageUnread: { color: colors.text },
  time: { color: colors.textFaint, fontSize: fontSize.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
