import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors } from '@/styles/theme';

const PARTICLE_COLORS = [colors.primary, colors.primaryDark, colors.accent, colors.success, colors.warning, '#ffffff'];
const PARTICLE_COUNT = 18;

interface Particle {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  rotation: number;
}

/**
 * One-shot confetti burst from the center, built from plain Reanimated views
 * (no new dependency) — mounted once when a run finishes, then left to fade.
 */
export function ConfettiBurst() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle: (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4,
        distance: 60 + Math.random() * 90,
        size: 6 + Math.random() * 6,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        delay: Math.random() * 120,
        rotation: Math.random() * 360,
      })),
    []
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <ConfettiParticle key={i} {...p} />
      ))}
    </View>
  );
}

function ConfettiParticle({ angle, distance, size, color, delay, rotation }: Particle) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }));
  }, [progress, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const dx = Math.cos(angle) * distance * progress.value;
    // A touch of downward drift on top of the radial burst, for a light gravity feel.
    const dy = Math.sin(angle) * distance * progress.value + progress.value * progress.value * 40;
    return {
      opacity: 1 - progress.value,
      transform: [{ translateX: dx }, { translateY: dy }, { rotate: `${rotation * progress.value}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, backgroundColor: color, borderRadius: size * 0.25 },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
