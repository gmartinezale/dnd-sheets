import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { characterRepository } from '@/data/db/repositories/character.repository';
import {
  abilityModifier,
  CLASS_HIT_DIE,
  CLASS_SPELLCASTING_ABILITY,
} from '@/domain/dnd';
import { DND_CLASSES } from '@/core/constants/dnd.constants';
import type { Character } from '@/domain/dnd/types/character';

type ExtraClass = { characterClass: string; level: number };

export default function LevelUpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Which class to level up: 'primary' or index into extraClasses
  const [selectedClass, setSelectedClass] = useState<'primary' | number>('primary');
  // Whether to add a new multiclass entry
  const [addingMulticlass, setAddingMulticlass] = useState(false);
  const [newMulticlassName, setNewMulticlassName] = useState('');
  // HP increase — manual input
  const [hpIncrease, setHpIncrease] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        return;
      }
      characterRepository
        .getCharacterById(id)
        .then((char) => {
          setCharacter(char);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [id]),
  );

  if (loading || !character) {
    return <LoadingState />;
  }

  const { characterClass, level, extraClasses, abilityScores } = character;
  const conMod = abilityModifier(abilityScores.CON);

  // Hit die for selected class
  const getHitDie = (cls: string): number =>
    CLASS_HIT_DIE[cls as keyof typeof CLASS_HIT_DIE] ?? 8;

  const selectedClassName =
    selectedClass === 'primary'
      ? characterClass
      : extraClasses[selectedClass as number]?.characterClass ?? characterClass;
  const hitDie = getHitDie(selectedClassName);
  const avgHPGain = Math.floor(hitDie / 2) + 1 + conMod;

  // Classes that can still be leveled (max 20 total)
  const totalLevel = level + extraClasses.reduce((s, ec) => s + ec.level, 0);
  const canLevelUp = totalLevel < 20;

  // Classes available to multiclass into (not already taken)
  const takenClasses = new Set([characterClass, ...extraClasses.map((ec) => ec.characterClass)]);
  const availableForMulticlass = DND_CLASSES.filter((c) => !takenClasses.has(c));

  const handleSave = async () => {
    if (!canLevelUp && !addingMulticlass) {
      Alert.alert('Max Level', 'You have reached level 20.');
      return;
    }
    setSaving(true);
    try {
      const hpGain = parseInt(hpIncrease, 10);
      const validHpGain = isNaN(hpGain) ? avgHPGain : Math.max(1, hpGain);
      const newMaxHP = character.maxHitPoints + validHpGain;

      let newLevel = level;
      let newExtraClasses: ExtraClass[] = [...extraClasses];
      let newSpellcastingAbility = character.spellcastingAbility;

      if (addingMulticlass && newMulticlassName) {
        // Add new class at level 1
        newExtraClasses = [...extraClasses, { characterClass: newMulticlassName, level: 1 }];
        // Auto-set spellcasting ability if primary has none but new class does
        if (!newSpellcastingAbility) {
          const scAbility = CLASS_SPELLCASTING_ABILITY[newMulticlassName];
          if (scAbility) {
            newSpellcastingAbility = scAbility;
          }
        }
      } else if (canLevelUp) {
        if (selectedClass === 'primary') {
          newLevel = level + 1;
          // Auto-set spellcasting ability from primary class if not set
          if (!newSpellcastingAbility && newLevel >= 1) {
            const scAbility = CLASS_SPELLCASTING_ABILITY[characterClass];
            if (scAbility) {
              newSpellcastingAbility = scAbility;
            }
          }
        } else {
          newExtraClasses = extraClasses.map((ec, idx) =>
            idx === (selectedClass as number) ? { ...ec, level: ec.level + 1 } : ec,
          );
        }
      }

      await characterRepository.updateCharacter(id ?? '', {
        level: newLevel,
        extraClasses: newExtraClasses,
        maxHitPoints: newMaxHP,
        currentHitPoints: character.currentHitPoints + validHpGain,
        hitDiceRemaining: character.hitDiceRemaining + 1,
        spellcastingAbility: newSpellcastingAbility ?? undefined,
      });

      router.back();
    } catch {
      Alert.alert('Error', 'Failed to level up. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader
        title="Level Up"
        subtitle={`Level ${level} → ${level + (selectedClass === 'primary' ? 1 : 0)}`}
        leftAction={{ label: 'Cancel', onPress: () => router.back() }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Current level summary */}
        <View style={[styles.card, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
          <Text style={[styles.sectionLabel, { color: colors['text.secondary'] }]}>CURRENT</Text>
          <Text style={[styles.summaryText, { color: colors['text.primary'] }]}>
            {characterClass.charAt(0).toUpperCase() + characterClass.slice(1)} {level}
          </Text>
          {extraClasses.map((ec) => (
            <Text key={ec.characterClass} style={[styles.summaryText, { color: colors['text.secondary'] }]}>
              {ec.characterClass.charAt(0).toUpperCase() + ec.characterClass.slice(1)} {ec.level}
            </Text>
          ))}
          <Text style={[styles.totalLevel, { color: colors['text.muted'] }]}>
            Total level {totalLevel} / 20
          </Text>
        </View>

        {/* Which class to level up */}
        {!addingMulticlass && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors['text.secondary'] }]}>LEVEL UP WHICH CLASS</Text>
            {/* Primary */}
            <ClassOption
              label={`${characterClass.charAt(0).toUpperCase() + characterClass.slice(1)} ${level} → ${level + 1}`}
              sublabel={`d${getHitDie(characterClass)} hit die`}
              selected={selectedClass === 'primary'}
              onPress={() => setSelectedClass('primary')}
              colors={colors}
            />
            {/* Extra classes */}
            {extraClasses.map((ec, idx) => (
              <ClassOption
                key={ec.characterClass}
                label={`${ec.characterClass.charAt(0).toUpperCase() + ec.characterClass.slice(1)} ${ec.level} → ${ec.level + 1}`}
                sublabel={`d${getHitDie(ec.characterClass)} hit die`}
                selected={selectedClass === idx}
                onPress={() => setSelectedClass(idx)}
                colors={colors}
              />
            ))}
          </View>
        )}

        {/* Multiclass option */}
        {availableForMulticlass.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.multiclassToggle,
                {
                  backgroundColor: addingMulticlass ? colors['accent.primary'] : colors['surface.default'],
                  borderColor: addingMulticlass ? colors['accent.primary'] : colors['border.default'],
                },
              ]}
              onPress={() => {
                setAddingMulticlass((v) => !v);
                if (!addingMulticlass && availableForMulticlass[0]) {
                  setNewMulticlassName(availableForMulticlass[0]);
                }
              }}
            >
              <Ionicons
                name={addingMulticlass ? 'checkmark-circle' : 'add-circle-outline'}
                size={18}
                color={addingMulticlass ? '#1A1510' : colors['text.secondary']}
              />
              <Text style={{ color: addingMulticlass ? '#1A1510' : colors['text.secondary'], fontWeight: '600', fontSize: FontSize.sm }}>
                Add Multiclass
              </Text>
            </TouchableOpacity>

            {addingMulticlass && (
              <View style={styles.classPickerContainer}>
                <Text style={[styles.fieldLabel, { color: colors['text.secondary'] }]}>Choose Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classPicker}>
                  {availableForMulticlass.map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      style={[
                        styles.classChip,
                        {
                          backgroundColor: newMulticlassName === cls ? colors['accent.primary'] : colors['surface.default'],
                          borderColor: newMulticlassName === cls ? colors['accent.primary'] : colors['border.default'],
                        },
                      ]}
                      onPress={() => setNewMulticlassName(cls)}
                    >
                      <Text style={{ color: newMulticlassName === cls ? '#1A1510' : colors['text.secondary'], fontWeight: '600', fontSize: FontSize.xs }}>
                        {cls.charAt(0).toUpperCase() + cls.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* HP increase */}
        <View style={[styles.card, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
          <Text style={[styles.sectionLabel, { color: colors['text.secondary'] }]}>HIT POINTS</Text>
          <Text style={[styles.hpHint, { color: colors['text.muted'] }]}>
            Average gain: {avgHPGain > 0 ? `+${avgHPGain}` : avgHPGain} (d{hitDie} avg {Math.floor(hitDie / 2) + 1}{conMod >= 0 ? `+${conMod}` : conMod} CON)
          </Text>
          <View style={styles.hpRow}>
            <Text style={[styles.hpLabel, { color: colors['text.secondary'] }]}>HP gained:</Text>
            <TextInput
              style={[styles.hpInput, { color: colors['text.primary'], backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
              value={hpIncrease}
              onChangeText={setHpIncrease}
              keyboardType="number-pad"
              placeholder={String(avgHPGain)}
              placeholderTextColor={colors['text.muted']}
            />
          </View>
          <Text style={[styles.hpTotal, { color: colors['text.muted'] }]}>
            New max HP: {character.maxHitPoints + (parseInt(hpIncrease, 10) || avgHPGain)}
          </Text>
        </View>

        {/* Confirm */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors['accent.primary'], opacity: saving ? 0.6 : 1 }]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving…' : addingMulticlass ? 'Add Class' : 'Level Up!'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ClassOption({
  label,
  sublabel,
  selected,
  onPress,
  colors,
}: {
  label: string;
  sublabel: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.classOption,
        {
          backgroundColor: selected ? colors['surface.default'] : colors['background.secondary'],
          borderColor: selected ? colors['accent.primary'] : colors['border.default'],
          borderWidth: selected ? 2 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={18}
        color={selected ? colors['accent.primary'] : colors['text.muted']}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.classOptionLabel, { color: colors['text.primary'] }]}>{label}</Text>
        <Text style={[styles.classOptionSub, { color: colors['text.muted'] }]}>{sublabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing[4], gap: Spacing[4], paddingBottom: Spacing[10] },
  card: {
    padding: Spacing[4],
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing[2],
  },
  section: { gap: Spacing[3] },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1 },
  summaryText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  totalLevel: { fontSize: FontSize.sm, marginTop: Spacing[1] },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: Radius.lg,
    gap: Spacing[3],
  },
  classOptionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  classOptionSub: { fontSize: FontSize.xs },
  multiclassToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing[2],
    alignSelf: 'flex-start',
  },
  classPickerContainer: { gap: Spacing[2] },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.5 },
  classPicker: { gap: Spacing[2], paddingVertical: Spacing[1] },
  classChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  hpHint: { fontSize: FontSize.sm },
  hpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  hpLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  hpInput: {
    width: 80,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  hpTotal: { fontSize: FontSize.sm },
  saveBtn: {
    paddingVertical: Spacing[4],
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  saveBtnText: { color: '#1A1510', fontWeight: FontWeight.bold, fontSize: FontSize.lg },
});
