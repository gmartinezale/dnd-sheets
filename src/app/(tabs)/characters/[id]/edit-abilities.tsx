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
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { abilityModifier } from '@/domain/dnd';
import { formatModifier } from '@/core/utils/formatters';
import { ABILITY_NAMES } from '@/core/constants/dnd.constants';
import type { Character } from '@/domain/dnd/types/character';
import type { AbilityScores } from '@/domain/dnd/types/abilities';
import type { AbilityName } from '@/core/constants/dnd.constants';

export default function EditAbilitiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<Record<AbilityName, string>>({
    STR: '10', DEX: '10', CON: '10', INT: '10', WIS: '10', CHA: '10',
  });

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        return;
      }
      characterRepository
        .getCharacterById(id)
        .then((char) => {
          setCharacter(char);
          if (char) {
            setScores({
              STR: String(char.abilityScores.STR),
              DEX: String(char.abilityScores.DEX),
              CON: String(char.abilityScores.CON),
              INT: String(char.abilityScores.INT),
              WIS: String(char.abilityScores.WIS),
              CHA: String(char.abilityScores.CHA),
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [id]),
  );

  const updateScore = (ab: AbilityName, delta: number) => {
    setScores((prev) => {
      const current = parseInt(prev[ab], 10) || 10;
      const next = Math.max(1, Math.min(30, current + delta));
      return { ...prev, [ab]: String(next) };
    });
  };

  const handleSave = async () => {
    const parsed: Partial<AbilityScores> = {};
    for (const ab of ABILITY_NAMES) {
      const v = parseInt(scores[ab as AbilityName], 10);
      if (isNaN(v) || v < 1 || v > 30) {
        Alert.alert('Invalid Score', `${ab} must be between 1 and 30.`);
        return;
      }
      parsed[ab as AbilityName] = v;
    }
    setSaving(true);
    try {
      await characterRepository.updateCharacter(id ?? '', {
        abilityScores: parsed as AbilityScores,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save ability scores.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !character) {
    return <LoadingState />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader
        title="Edit Abilities"
        leftAction={{ label: 'Cancel', onPress: () => router.back() }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.hint, { color: colors['text.muted'] }]}>
          Tap +/− to adjust, or type directly.
        </Text>

        {ABILITY_NAMES.map((ab) => {
          const val = parseInt(scores[ab as AbilityName], 10) || 10;
          const mod = abilityModifier(val);
          return (
            <View
              key={ab}
              style={[styles.row, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}
            >
              <View style={styles.abLabel}>
                <Text style={[styles.abName, { color: colors['text.primary'] }]}>{ab}</Text>
                <Text style={[styles.abMod, { color: colors['accent.primary'] }]}>
                  {formatModifier(mod)}
                </Text>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[styles.stepper, { borderColor: colors['border.default'] }]}
                  onPress={() => updateScore(ab as AbilityName, -1)}
                >
                  <Text style={[styles.stepperText, { color: colors['text.secondary'] }]}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { color: colors['text.primary'], borderColor: colors['border.default'] }]}
                  value={scores[ab as AbilityName]}
                  onChangeText={(v) =>
                    setScores((prev) => ({ ...prev, [ab]: v.replace(/[^0-9]/g, '') }))
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                <TouchableOpacity
                  style={[styles.stepper, { borderColor: colors['border.default'] }]}
                  onPress={() => updateScore(ab as AbilityName, 1)}
                >
                  <Text style={[styles.stepperText, { color: colors['text.secondary'] }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors['accent.primary'], opacity: saving ? 0.6 : 1 }]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Abilities'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing[4], gap: Spacing[3], paddingBottom: Spacing[10] },
  hint: { fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  abLabel: { alignItems: 'flex-start', gap: 2 },
  abName: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.5 },
  abMod: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, lineHeight: 22 },
  input: {
    width: 56,
    height: 40,
    borderBottomWidth: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  saveBtn: {
    paddingVertical: Spacing[4],
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  saveBtnText: { color: '#1A1510', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
