import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing, MinTouchTarget } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { formatModifier } from '@/core/utils/formatters';
import type { ProficiencyType } from '@/core/constants/dnd.constants';

type SkillRowProps = {
  skillName: string;
  abilityAbbrev: string;
  bonus: number;
  proficiency: ProficiencyType;
  onToggleProficiency?: () => void;
  readOnly?: boolean;
};

export function SkillRow({
  skillName,
  abilityAbbrev,
  bonus,
  proficiency,
  onToggleProficiency,
  readOnly = false,
}: SkillRowProps) {
  const colors = useThemeColors();
  const interactive = !readOnly && !!onToggleProficiency;

  const inner = (
    <>
      <ProficiencyDot proficiency={proficiency} colors={colors} />

      <Text style={[styles.skillName, { color: colors['text.primary'] }]} numberOfLines={1}>
        {skillName}
      </Text>

      <Text style={[styles.abilityTag, { color: colors['text.muted'] }]}>
        ({abilityAbbrev})
      </Text>

      <Text style={[styles.bonus, { color: interactive ? colors['accent.primary'] : colors['text.secondary'] }]}>
        {formatModifier(bonus)}
      </Text>
    </>
  );

  if (interactive) {
    return (
      <TouchableOpacity
        onPress={onToggleProficiency}
        style={[styles.row, { borderBottomColor: colors['border.default'] }]}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={`${skillName} proficiency: ${proficiency}. Tap to change.`}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[styles.row, { borderBottomColor: colors['border.default'] }]}
      accessible
      accessibilityLabel={`${skillName}: ${formatModifier(bonus)}, proficiency: ${proficiency}`}
    >
      {inner}
    </View>
  );
}

function ProficiencyDot({
  proficiency,
  colors,
}: {
  proficiency: ProficiencyType;
  colors: ReturnType<typeof useThemeColors>;
}) {
  if (proficiency === 'none') {
    return (
      <View
        style={[styles.dot, styles.dotEmpty, { borderColor: colors['text.muted'] }]}
      />
    );
  }
  if (proficiency === 'half') {
    return (
      <View style={[styles.dot, { borderColor: colors['accent.primary'] }]}>
        <View
          style={[styles.dotHalf, { backgroundColor: colors['accent.primary'] }]}
        />
      </View>
    );
  }
  return (
    <View
      style={[
        styles.dot,
        styles.dotFull,
        {
          backgroundColor:
            proficiency === 'expertise' ? colors['accent.magic'] : colors['accent.primary'],
          borderColor:
            proficiency === 'expertise' ? colors['accent.magic'] : colors['accent.primary'],
        },
      ]}
    />
  );
}

const DOT_SIZE = 14;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MinTouchTarget,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing[2],
    gap: Spacing[2],
  },
  dotContainer: {
    width: DOT_SIZE + 8,
    height: DOT_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    overflow: 'hidden',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
  },
  dotFull: {},
  dotHalf: {
    width: '50%',
    height: '100%',
  },
  skillName: {
    flex: 1,
    fontSize: FontSize.base,
  },
  abilityTag: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  bonus: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    minWidth: 36,
    textAlign: 'right',
  },
});
