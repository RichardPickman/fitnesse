// ---------------------------------------------------------------------------
// Fitnesse — Theme
// Single source of truth for colors, spacing, typography.
// Change any value here and it propagates everywhere.
// ---------------------------------------------------------------------------

export const colors = {
  // Base
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceAlt: '#242424',
  border: '#2E2E2E',

  // Text
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textMuted: '#6B6B6B',

  // Accent
  accent: '#4ADE80',       // lime-green
  accentDim: '#22C55E',

  // Semantic
  error: '#EF4444',
  warning: '#F59E0B',

  // Tab bar
  tabActive: '#4ADE80',
  tabInactive: '#6B6B6B',
  tabBarBg: '#0F0F0F',
  tabBarBorder: '#1A1A1A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};
