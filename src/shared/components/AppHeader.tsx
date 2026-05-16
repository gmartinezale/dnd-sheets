import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing } from '@/shared/theme/spacing';
import { TextStyles, FontSize } from '@/shared/theme/typography';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: {
    label: string;
    icon?: React.ReactNode;
    onPress: () => void;
  };
  rightAction?: {
    label: string;
    icon?: React.ReactNode;
    onPress: () => void;
  };
};

export function AppHeader({ title, subtitle, leftAction, rightAction }: AppHeaderProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[styles.container, { borderBottomColor: colors['border.default'] }]}
    >
      <View style={styles.side}>
        {leftAction && (
          <TouchableOpacity
            onPress={leftAction.onPress}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={leftAction.label}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {leftAction.icon ?? (
              <Text style={[styles.actionText, { color: colors['accent.primary'] }]}>
                {leftAction.label}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text
          style={[TextStyles.headingMedium, { color: colors['text.primary'] }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors['text.secondary'] }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={[styles.side, styles.rightSide]}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={rightAction.label}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightAction.icon ?? (
              <Text style={[styles.actionText, { color: colors['accent.primary'] }]}>
                {rightAction.label}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  actionBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FontSize.md,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
