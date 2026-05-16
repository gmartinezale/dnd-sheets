import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { FontSize } from '@/shared/theme/typography';
import { Spacing } from '@/shared/theme/spacing';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors['accent.primary']} />
      <Text style={[styles.text, { color: colors['text.secondary'] }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    padding: Spacing[8],
  },
  text: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
});
