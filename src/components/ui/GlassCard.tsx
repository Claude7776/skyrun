import { StyleSheet, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '@/styles/theme';

interface GlassCardProps extends ViewProps {
  /** Layout styles (e.g. flexDirection) for the inner content, as opposed to `style` (outer sizing/margin). */
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Glassmorphism surface used across dashboard cards, forms, and panels —
 * the native equivalent of the web app's `.glass` CSS class, using a real
 * native blur instead of `backdrop-filter`.
 */
export function GlassCard({ children, style, contentStyle, ...props }: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]} {...props}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
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
