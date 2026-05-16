import React from 'react';
import { View, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing } from '@/shared/theme/spacing';

type AppScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
};

export function AppScreen({
  children,
  scrollable = true,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
}: AppScreenProps) {
  const colors = useThemeColors();

  const containerStyle = [
    styles.container,
    { backgroundColor: colors['background.primary'] },
    style,
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
  },
});
