import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, gradientBrand, radius, spacing, fontSize } from '@/styles/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'ghost' | 'glass' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  children: string;
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  const label = (
    <Text style={[styles.label, variant === 'primary' ? styles.labelOnPrimary : styles.labelDefault]}>
      {children}
    </Text>
  );

  const inner =
    variant === 'primary' ? (
      <LinearGradient
        colors={gradientBrand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, fullWidth && styles.full, isDisabled && styles.disabled]}
      >
        {loading ? <ActivityIndicator color={colors.onPrimary} /> : label}
      </LinearGradient>
    ) : (
      <View
        style={[
          styles.base,
          variant === 'glass' && styles.glass,
          variant === 'danger' && styles.danger,
          fullWidth && styles.full,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.text} /> : label}
      </View>
    );

  return (
    <AnimatedPressable
      style={[animatedStyle, fullWidth && styles.full]}
      disabled={isDisabled}
      onPressIn={(e) => {
        scale.value = withTiming(0.97, { duration: 100 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 100 });
        onPressOut?.(e);
      }}
      {...props}
    >
      {inner}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
  },
  full: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: 'rgba(248, 113, 113, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  labelOnPrimary: {
    color: colors.onPrimary,
  },
  labelDefault: {
    color: colors.text,
  },
});
