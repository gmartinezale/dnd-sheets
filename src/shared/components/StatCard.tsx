import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { TextStyles, FontSize } from '@/shared/theme/typography';

type StatCardProps = {
  value: string | number;
  label: string;
  accent?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function StatCard({ value, label, accent, style, accessibilityLabel }: StatCardProps) {
  const colors = useThemeColors();
  const borderColor = accent ?? colors['border.accent'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors['background.secondary'],
          borderColor,
        },
        style,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
    >
      <Text style={[TextStyles.statNumber, { color: colors['text.primary'] }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors['text.secondary'] }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 80,
    minHeight: 80,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
