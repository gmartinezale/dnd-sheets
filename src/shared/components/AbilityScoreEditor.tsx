import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { TextStyles, FontSize } from '@/shared/theme/typography';
import { formatModifier } from '@/core/utils/formatters';
import { abilityModifier } from '@/domain/dnd/calculators/abilityModifier';
import type { AbilityName } from '@/core/constants/dnd.constants';

type AbilityScoreEditorProps = {
  ability: AbilityName;
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
  color?: string;
  readOnly?: boolean;
};

const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

export function AbilityScoreEditor({
  ability,
  score,
  onIncrement,
  onDecrement,
  color,
  readOnly = false,
}: AbilityScoreEditorProps) {
  const colors = useThemeColors();
  const mod = abilityModifier(score);
  const accentColor = color ?? colors['accent.secondary'];

  return (
    <View
      style={[styles.container, { backgroundColor: colors['background.secondary'], borderColor: accentColor }]}
      accessible
      accessibilityLabel={`${ABILITY_LABELS[ability]}: ${score}, modifier ${formatModifier(mod)}`}
    >
      <Text style={[styles.abilityLabel, { color: colors['text.secondary'] }]}>
        {ability}
      </Text>

      <Text style={[TextStyles.statNumber, { color: colors['text.primary'] }]}>
        {score}
      </Text>

      <View style={[styles.modBadge, { backgroundColor: `${accentColor}30` }]}>
        <Text style={[styles.modText, { color: accentColor }]}>
          {formatModifier(mod)}
        </Text>
      </View>

      {!readOnly && (
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={onDecrement}
            style={[styles.controlBtn, { borderColor: colors['border.default'] }]}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${ABILITY_LABELS[ability]}`}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={[styles.controlText, { color: colors['text.primary'] }]}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onIncrement}
            style={[styles.controlBtn, { borderColor: colors['border.default'] }]}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${ABILITY_LABELS[ability]}`}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={[styles.controlText, { color: colors['text.primary'] }]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    minWidth: 90,
  },
  abilityLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing[1],
  },
  modBadge: {
    marginTop: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  modText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing[1],
    marginTop: Spacing[2],
  },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    lineHeight: 20,
  },
});
