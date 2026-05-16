import { StyleSheet } from 'react-native';

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 24,
  '2xl': 28,
  '3xl': 36,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

/**
 * Shared text styles.
 * Use these as base — override color per component.
 */
export const TextStyles = StyleSheet.create({
  displayBold: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['3xl'] * 1.2,
  },
  headingLarge: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xl * 1.3,
  },
  headingMedium: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.lg * 1.3,
  },
  statNumber: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['2xl'] * 1.1,
  },
  statNumberLarge: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['3xl'] * 1.0,
  },
  bodyMedium: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.md * 1.5,
  },
  bodySmall: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * 1.5,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.4,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.xs * 1.4,
  },
  button: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.md * 1.2,
  },
});
