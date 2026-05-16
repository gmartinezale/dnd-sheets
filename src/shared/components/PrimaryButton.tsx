import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { TextStyles } from '@/shared/theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
}: PrimaryButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor: colors['accent.primary'] },
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={colors['background.primary']} size="small" />
      ) : (
        <Text
          style={[
            TextStyles.button,
            { color: colors['background.primary'] },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
  },
  disabled: {
    opacity: 0.4,
  },
});
