import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ResourceCounter } from '@/shared/components/ResourceCounter';
import { StatCard } from '@/shared/components/StatCard';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { abilityModifier, proficiencyBonus } from '@/domain/dnd';
import { formatModifier } from '@/core/utils/formatters';
import type { Character } from '@/domain/dnd/types/character';

/** Modal to directly set HP (for large heals / damage) or max HP */
function HPEditModal({
  visible,
  mode,
  current,
  colors,
  onClose,
  onSave,
}: {
  visible: boolean;
  mode: 'current' | 'max';
  current: number;
  colors: ReturnType<typeof useThemeColors>;
  onClose: () => void;
  onSave: (value: number) => void;
}) {
  const [value, setValue] = useState(String(current));
  useEffect(() => { setValue(String(current)); }, [current, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.box, { backgroundColor: colors['background.elevated'] }]}>
          <Text style={[modalStyles.title, { color: colors['text.primary'] }]}>
            {mode === 'current' ? 'Set Current HP' : 'Set Max HP'}
          </Text>
          <TextInput
            style={[modalStyles.input, { color: colors['text.primary'], borderColor: colors['border.default'] }]}
            value={value}
            onChangeText={(v) => setValue(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            autoFocus
            textAlign="center"
          />
          <View style={modalStyles.row}>
            <TouchableOpacity style={[modalStyles.btn, { borderColor: colors['border.default'] }]} onPress={onClose}>
              <Text style={{ color: colors['text.secondary'], fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.btn, { backgroundColor: colors['accent.primary'] }]}
              onPress={() => { const v = parseInt(value, 10); if (!isNaN(v) && v >= 0) { onSave(v); } }}
            >
              <Text style={{ color: '#1A1510', fontWeight: FontWeight.bold }}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CombatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hpModal, setHpModal] = useState<'current' | 'max' | null>(null);

  const reload = useCallback(() => {
    if (!id) {
      return;
    }
    characterRepository
      .getCharacterById(id)
      .then((char) => {
        setCharacter(char);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load character');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleHPChange = async (delta: number) => {
    if (!character || !id) {
      return;
    }
    const next = Math.max(0, Math.min(character.maxHitPoints, character.currentHitPoints + delta));
    setCharacter((c) => c ? { ...c, currentHitPoints: next } : c);
    await characterRepository.updateCharacter(id, { currentHitPoints: next });
  };

  const handleSetHP = useCallback(
    async (mode: 'current' | 'max', value: number) => {
      if (!character || !id) { return; }
      if (mode === 'current') {
        const clamped = Math.max(0, Math.min(character.maxHitPoints, value));
        setCharacter((c) => c ? { ...c, currentHitPoints: clamped } : c);
        await characterRepository.updateCharacter(id, { currentHitPoints: clamped });
      } else {
        const newMax = Math.max(1, value);
        const newCurrent = Math.min(character.currentHitPoints, newMax);
        setCharacter((c) => c ? { ...c, maxHitPoints: newMax, currentHitPoints: newCurrent } : c);
        await characterRepository.updateCharacter(id, { maxHitPoints: newMax, currentHitPoints: newCurrent });
      }
      setHpModal(null);
    },
    [character, id],
  );

  if (loading) {
    return <LoadingState />;
  }
  if (error || !character) {
    return <ErrorState message={error ?? 'Character not found'} onRetry={() => router.back()} />;
  }

  const prof = proficiencyBonus(character.level);
  const initiative = character.initiativeBonus ?? abilityModifier(character.abilityScores.DEX);
  const ac = character.armorClass ?? 10 + abilityModifier(character.abilityScores.DEX);

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Combat" leftAction={{ label: 'Back', onPress: () => router.back() }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* HP counter */}
        <ResourceCounter
          label="Hit Points"
          current={character.currentHitPoints}
          maximum={character.maxHitPoints}
          onDecrement={() => void handleHPChange(-1)}
          onIncrement={() => void handleHPChange(1)}
          color={
            character.currentHitPoints / character.maxHitPoints > 0.5
              ? colors['accent.success']
              : colors['accent.critical']
          }
        />
        {/* HP quick-set buttons */}
        <View style={styles.hpActions}>
          <TouchableOpacity
            style={[styles.hpActionBtn, { borderColor: colors['border.default'] }]}
            onPress={() => setHpModal('current')}
          >
            <Text style={[styles.hpActionText, { color: colors['text.secondary'] }]}>Set HP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hpActionBtn, { borderColor: colors['border.default'] }]}
            onPress={() => setHpModal('max')}
          >
            <Text style={[styles.hpActionText, { color: colors['text.secondary'] }]}>Set Max HP</Text>
          </TouchableOpacity>
        </View>

        {/* Temp HP */}
        <View style={styles.section}>
          <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'] }]}>
            Temp HP
          </Text>
          <Text style={[styles.tempHP, { color: colors['text.muted'] }]}>
            {character.temporaryHitPoints}
          </Text>
        </View>

        {/* Combat stats row */}
        <View style={styles.statsRow}>
          <StatCard value={ac} label="AC" style={{ flex: 1 }} />
          <StatCard value={formatModifier(initiative)} label="Initiative" style={{ flex: 1 }} />
          <StatCard value={character.speed} label="Speed" style={{ flex: 1 }} />
          <StatCard value={`+${prof}`} label="Prof." style={{ flex: 1 }} />
        </View>

        {/* Hit Dice */}
        <View style={[styles.section, { borderColor: colors['border.default'] }]}>
          <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'] }]}>
            Hit Dice
          </Text>
          <Text style={[styles.tempHP, { color: colors['text.primary'] }]}>
            {character.hitDiceRemaining} / {character.level}
          </Text>
        </View>
      </ScrollView>

      {hpModal !== null && (
        <HPEditModal
          visible
          mode={hpModal}
          current={hpModal === 'current' ? character.currentHitPoints : character.maxHitPoints}
          colors={colors}
          onClose={() => setHpModal(null)}
          onSave={(v) => void handleSetHP(hpModal, v)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
    gap: Spacing[6],
  },
  section: {
    gap: Spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  tempHP: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  hpActions: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: -Spacing[4],
  },
  hpActionBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  hpActionText: { fontSize: FontSize.sm, fontWeight: '600' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  box: { width: 280, padding: Spacing[6], borderRadius: Radius.xl, gap: Spacing[4] },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  input: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    borderBottomWidth: 2,
    paddingVertical: Spacing[2],
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: Spacing[3] },
  btn: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
});
