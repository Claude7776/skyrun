import { useEffect } from 'react';
import { StyleSheet, TextInput, type TextStyle } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion } from '@/styles/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  style?: TextStyle;
  duration?: number;
}

/**
 * Counts up/down to `value` whenever it changes. Reuses the animated-
 * TextInput trick already applied to the border color in Input.tsx: RN's
 * plain Text can't take an animated prop for its content, but a read-only
 * TextInput can via its native "text" prop, updating per-frame without a
 * JS round-trip.
 */
export function AnimatedNumber({
  value,
  formatter = (n) => String(Math.round(n)),
  style,
  duration = motion.slow,
}: AnimatedNumberProps) {
  const animated = useSharedValue(value);

  useEffect(() => {
    animated.value = withTiming(value, { duration });
  }, [value, duration, animated]);

  // "text" isn't a typed TextInput prop in RN's types — it's the native
  // bridge this animated-counter trick relies on, so the hook result is
  // cast rather than typed.
  const animatedProps = useAnimatedProps(() => ({
    text: formatter(animated.value),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      caretHidden
      value={formatter(value)}
      animatedProps={animatedProps}
      style={[styles.text, style]}
    />
  );
}

const styles = StyleSheet.create({
  text: { padding: 0, margin: 0 },
});
