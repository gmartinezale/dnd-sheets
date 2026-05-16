import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing, Radius, MinTouchTarget } from '@/shared/theme/spacing';
import { TextStyles, FontSize, FontWeight } from '@/shared/theme/typography';

type ResourceCounterProps = {
  label: string;
  current: number;
  maximum: number;
  onIncrement: () => void;
  onDecrement: () => void;
  color?: string;
  readOnly?: boolean;
};

export function ResourceCounter({
  label,
  current,
  maximum,
  onIncrement,
  onDecrement,
  color,
  readOnly = false,
}: ResourceCounterProps) {
  const colors = useThemeColors();
  const accentColor = color ?? colors['accent.primary'];
  const isEmpty = current <= 0;
  const isFull = current >= maximum;

  const handleDecrement = () => {
    if (current > 0) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (current < maximum) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrement();
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}
      accessible
      accessibilityLabel={`${label}: ${current} of ${maximum}`}
    >
      <Text style={[styles.label, { color: colors['text.secondary'] }]}>{label}</Text>

      <View style={styles.controls}>
        {!readOnly && (
          <TouchableOpacity
            onPress={handleDecrement}
            disabled={isEmpty}
            style={[
              styles.controlBtn,
              { borderColor: colors['border.accent'] },
              isEmpty && styles.controlDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${label}`}
            accessibilityState={{ disabled: isEmpty }}
          >
            <Text style={[styles.controlText, { color: isEmpty ? colors['text.muted'] : colors['text.primary'] }]}>
              −
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.valueContainer}>
          <Text style={[TextStyles.statNumberLarge, { color: accentColor }]}>
            {current}
          </Text>
          <Text style={[styles.maxText, { color: colors['text.secondary'] }]}>
            /{maximum}
          </Text>
        </View>

        {!readOnly && (
          <TouchableOpacity
            onPress={handleIncrement}
            disabled={isFull}
            style={[
              styles.controlBtn,
              { borderColor: colors['border.accent'] },
              isFull && styles.controlDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${label}`}
            accessibilityState={{ disabled: isFull }}
          >
            <Text style={[styles.controlText, { color: isFull ? colors['text.muted'] : colors['text.primary'] }]}>
              +
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  controlBtn: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    opacity: 0.3,
  },
  controlText: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  maxText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
});
