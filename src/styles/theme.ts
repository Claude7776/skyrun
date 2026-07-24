/**
 * Design tokens for the SkyRun dark theme — the React Native equivalent of
 * the web app's tokens.css. Same palette, expressed as plain JS/TS since
 * RN has no CSS variables.
 */
export const colors = {
  bg: '#0a0e14',
  bgElevated: '#0f141b',
  surface: '#141a22',
  surfaceAlt: '#1a212b',
  border: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',

  text: '#f4f7fa',
  textMuted: '#9aa7b8',
  textFaint: '#667181',

  primary: '#38bdf8',
  primaryDark: '#0ea5e9',
  accent: '#a78bfa',

  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',

  onPrimary: '#06121d',
} as const;

/** Used with expo-linear-gradient for the primary button / brand accents. */
export const gradientBrand = ['#38bdf8', '#818cf8', '#a78bfa'] as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  '2xl': 40,
} as const;

/**
 * Elevation presets (iOS shadow* + Android `elevation`) for the dark theme —
 * shadows need a visible dark-on-dark tint here rather than the usual black,
 * since a plain black shadow disappears against `colors.bg`.
 */
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

/** Shared animation timings so easing/duration stay consistent app-wide. */
export const motion = {
  fast: 120,
  base: 220,
  slow: 400,
} as const;
