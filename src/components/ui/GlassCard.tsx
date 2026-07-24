import { StyleSheet, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, spacing, shadows, motion } from '@/styles/theme';

interface GlassCardProps extends ViewProps {
  /** Layout styles (e.g. flexDirection) for the inner content, as opposed to `style` (outer sizing/margin). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Delays the entrance animation (ms) — lets a grid of cards fade in staggered instead of all at once. */
  delay?: number;
}

/**
 * Glassmorphism surface used across dashboard cards, forms, and panels —
 * the native equivalent of the web app's `.glass` CSS class, using a real
 * native blur instead of `backdrop-filter`.
 *
 * Shadow lives on an outer, non-clipping wrapper: iOS clips a view's own
 * shadow when `overflow: hidden` is set, which the inner view needs for the
 * blur + rounded corners, so the two responsibilities are split in two.
 */
export function GlassCard({ children, style, contentStyle, delay = 0, ...props }: GlassCardProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(motion.base).delay(delay)}
      style={[styles.shadowWrapper, style]}
      {...props}
    >
      <View style={styles.wrapper}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: radius.lg,
    ...shadows.card,
  },
  wrapper: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
  },
  content: {
    padding: spacing[5],
  },
});
