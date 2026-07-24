import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/styles/theme';

interface CountdownOverlayProps {
  from?: number;
  onComplete: () => void;
}

const TICK_MS = 1000;
const GO_HOLD_MS = 500;

export function CountdownOverlay({ from = 3, onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(from);
  const scale = useSharedValue(1.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = 1.6;
    opacity.value = 0;
    scale.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 250 });

    const delay = count > 0 ? TICK_MS : GO_HOLD_MS;
    const timeout = setTimeout(() => {
      if (count > 0) {
        setCount((c) => c - 1);
      } else {
        onComplete();
      }
    }, delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.overlay}>
      <Animated.Text style={[styles.count, animatedStyle]}>{count > 0 ? count : 'GO !'}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 14, 20, 0.6)',
  },
  count: {
    color: colors.primary,
    fontSize: 120,
    fontWeight: '900',
  },
});
