import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { SkillRow } from '@/shared/components/SkillRow';
import { Spacing } from '@/shared/theme/spacing';
import { FontSize, TextStyles } from '@/shared/theme/typography';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { skillRepository } from '@/data/db/repositories/compendium.repository';
import { allSkillBonuses, allSavingThrowBonuses, proficiencyBonus } from '@/domain/dnd';
import { SKILL_NAMES, SKILL_ABILITY_MAP } from '@/core/constants/dnd.constants';
import { formatModifier } from '@/core/utils/formatters';
import type { Character, SkillProficiencies } from '@/domain/dnd/types/character';
import type { ProficiencyType } from '@/core/constants/dnd.constants';

const PROFICIENCY_ORDER: ProficiencyType[] = ['none', 'half', 'full', 'expertise'];

export default function SkillsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [character, setCharacter] = useState<Character | null>(null);
  const [skills, setSkills] = useState<SkillProficiencies | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<SkillProficiencies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    Promise.all([
      characterRepository.getCharacterById(id),
      skillRepository.getSkillProficiencies(id),
    ])
      .then(([char, sk]) => {
        setCharacter(char);
        setSkills(sk);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load skills');
        setLoading(false);
      });
  }, [id]);

  const enterEdit = useCallback(() => {
    setDraft({ ...(skills ?? ({} as SkillProficiencies)) });
    setEditMode(true);
  }, [skills]);

  const cancelEdit = useCallback(() => {
    setDraft(null);
    setEditMode(false);
  }, []);

  const toggleProficiency = useCallback((skill: string) => {
    setDraft((prev) => {
      if (!prev) { return prev; }
      const current: ProficiencyType = (prev[skill as keyof SkillProficiencies] as ProficiencyType | undefined) ?? 'none';
      const nextIdx = (PROFICIENCY_ORDER.indexOf(current) + 1) % PROFICIENCY_ORDER.length;
      return { ...prev, [skill]: PROFICIENCY_ORDER[nextIdx] };
    });
  }, []);

  const saveEdit = useCallback(async () => {
    if (!draft || !id) { return; }
    try {
      await skillRepository.bulkSetSkillProficiencies(id, draft);
      setSkills({ ...draft });
      setEditMode(false);
      setDraft(null);
    } catch {
      Alert.alert('Error', 'Failed to save proficiencies.');
    }
  }, [draft, id]);

  if (loading) {
    return <LoadingState />;
  }
  if (error || !character) {
    return <ErrorState message={error ?? 'Character not found'} onRetry={() => router.back()} />;
  }

  const prof = proficiencyBonus(character.level);
  const displaySkills = editMode ? (draft ?? skills ?? ({} as SkillProficiencies)) : (skills ?? ({} as SkillProficiencies));
  const skillBonuses = allSkillBonuses(character.abilityScores, displaySkills, character.level);
  const savingThrows = allSavingThrowBonuses(character.abilityScores, character.savingThrowProficiencies, prof);

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader
        title="Skills & Saves"
        leftAction={{ label: 'Back', onPress: () => router.back() }}
        rightAction={
          editMode
            ? { label: 'Save', onPress: () => void saveEdit() }
            : { label: 'Edit', onPress: enterEdit }
        }
      />

      {editMode && (
        <View style={[styles.editBanner, { backgroundColor: colors['surface.default'], borderBottomColor: colors['border.default'] }]}>
          <Ionicons name="create-outline" size={14} color={colors['accent.primary']} />
          <Text style={[styles.editBannerText, { color: colors['accent.primary'] }]}>
            Tap a skill to cycle: None → Half → Full → Expertise
          </Text>
          <TouchableOpacity onPress={cancelEdit}>
            <Ionicons name="close" size={16} color={colors['text.muted']} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'], marginBottom: Spacing[2] }]}>
          Saving Throws
        </Text>
        {(Object.entries(savingThrows) as [string, number][]).map(([ability, bonus]) => (
          <SavingThrowRow
            key={ability}
            ability={ability}
            bonus={bonus}
            isProficient={character.savingThrowProficiencies[ability as keyof typeof character.savingThrowProficiencies]}
            colors={colors}
          />
        ))}

        <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'], marginTop: Spacing[6], marginBottom: Spacing[2] }]}>
          Skills
        </Text>
        {(SKILL_NAMES as readonly string[]).map((skill) => {
          const bonus = skillBonuses[skill as keyof typeof skillBonuses] ?? 0;
          const profType = (displaySkills[skill as keyof SkillProficiencies] as ProficiencyType | undefined) ?? 'none';
          const abilityAbbrev = SKILL_ABILITY_MAP[skill as keyof typeof SKILL_ABILITY_MAP] ?? '';
          return (
            <SkillRow
              key={skill}
              skillName={skill}
              abilityAbbrev={abilityAbbrev}
              bonus={bonus}
              proficiency={profType}
              onToggleProficiency={editMode ? () => toggleProficiency(skill) : undefined}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function SavingThrowRow({
  ability,
  bonus,
  isProficient,
  colors,
}: {
  ability: string;
  bonus: number;
  isProficient: boolean;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      style={[styles.stRow, { borderBottomColor: colors['border.default'] }]}
      accessible
      accessibilityLabel={`${ability} saving throw ${formatModifier(bonus)}${isProficient ? ', proficient' : ''}`}
    >
      <View
        style={[
          styles.profDot,
          { backgroundColor: isProficient ? colors['accent.primary'] : 'transparent', borderColor: colors['accent.primary'] },
        ]}
      />
      <Text style={[styles.stLabel, { color: colors['text.secondary'] }]}>{ability}</Text>
      <Text style={[styles.stBonus, { color: colors['text.primary'] }]}>{formatModifier(bonus)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editBannerText: { flex: 1, fontSize: FontSize.xs },
  stRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing[3],
    minHeight: 44,
  },
  profDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  stLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  stBonus: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
});
