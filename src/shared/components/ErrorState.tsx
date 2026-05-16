import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { TextStyles, FontSize } from '@/shared/theme/typography';
import { Spacing, Radius } from '@/shared/theme/spacing';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container} accessibilityLiveRegion="assertive">
      <Text style={[TextStyles.headingMedium, { color: colors['accent.critical'] }]}>
        Error
      </Text>
      <Text style={[styles.message, { color: colors['text.secondary'] }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryBtn, { borderColor: colors['accent.primary'] }]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[styles.retryText, { color: colors['accent.primary'] }]}>
            Try again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    padding: Spacing[8],
  },
  message: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  retryText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
