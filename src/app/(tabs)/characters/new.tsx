import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { PrimaryButton } from '@/shared/components/PrimaryButton';
import { AbilityScoreEditor } from '@/shared/components/AbilityScoreEditor';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';
import { useCharacterDraftStore } from '@/features/characters/stores/characterDraft.store';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { maxHitPoints, CLASS_HIT_DIE, CLASS_SAVING_THROWS, CLASS_SPELLCASTING_ABILITY } from '@/domain/dnd';
import type { AbilityScores } from '@/domain/dnd/types/abilities';
import type { SavingThrowProficiencies } from '@/domain/dnd/types/abilities';
import { DND_CLASSES, DND_RACES, ALIGNMENTS } from '@/core/constants/dnd.constants';
import type { CharacterDraft } from '@/domain/dnd/types/character';

const STEPS = ['name', 'race', 'class', 'abilities', 'review'] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  name: 'Name & Background',
  race: 'Choose Race',
  class: 'Choose Class',
  abilities: 'Ability Scores',
  review: 'Review',
};

export default function NewCharacterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { draft, setName, setRace, setClass, setAlignment, setAbilityScore, resetDraft } =
    useCharacterDraftStore();

  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const handleBack = useCallback(() => {
    if (currentStepIndex === 0) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/characters');
      }
    } else {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  }, [currentStepIndex, router]);

  const handleNext = useCallback(() => {
    setValidationError(null);

    // Validate current step
    if (currentStep === 'name' && !draft.name.trim()) {
      setValidationError('Character name is required.');
      return;
    }
    if (currentStep === 'race' && !draft.race) {
      setValidationError('Please select a race.');
      return;
    }
    if (currentStep === 'class' && !draft.characterClass) {
      setValidationError('Please select a class.');
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  }, [currentStep, currentStepIndex, draft]);

  const handleCreate = useCallback(async () => {
    if (!draft.name.trim() || !draft.race || !draft.characterClass) {
      setValidationError('Please complete all required fields.');
      return;
    }

    setSaving(true);
    setValidationError(null);

    try {
      const classIndex = draft.characterClass.toLowerCase();
      const hitDie = CLASS_HIT_DIE[classIndex] ?? 8;
      const classSavingThrows = CLASS_SAVING_THROWS[classIndex] ?? [];

      const savingThrowProficiencies: SavingThrowProficiencies = {
        STR: classSavingThrows.includes('STR'),
        DEX: classSavingThrows.includes('DEX'),
        CON: classSavingThrows.includes('CON'),
        INT: classSavingThrows.includes('INT'),
        WIS: classSavingThrows.includes('WIS'),
        CHA: classSavingThrows.includes('CHA'),
      };

      const hp = maxHitPoints(hitDie, draft.level, draft.abilityScores);

      await characterRepository.createCharacter({
        name: draft.name.trim(),
        race: draft.race,
        subrace: draft.subrace,
        characterClass: draft.characterClass,
        subclass: null,
        level: draft.level,
        background: draft.background,
        alignment: draft.alignment ?? undefined,
        experiencePoints: 0,
        abilityScores: draft.abilityScores,
        savingThrowProficiencies,
        maxHitPoints: hp,
        currentHitPoints: hp,
        temporaryHitPoints: 0,
        hitDiceRemaining: draft.level,
        initiativeBonus: null,
        armorClass: null,
        shieldBonus: 0,
        speed: 30,
        spellcastingAbility: CLASS_SPELLCASTING_ABILITY[draft.characterClass] ?? null,
        spellAttackBonus: null,
        notes: '',
        extraClasses: [],
      });

      resetDraft();
      router.replace('/(tabs)/characters');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to create character.');
    } finally {
      setSaving(false);
    }
  }, [draft, resetDraft, router]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors['background.primary'] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader
        title={STEP_LABELS[currentStep]}
        subtitle={`Step ${currentStepIndex + 1} of ${STEPS.length}`}
        leftAction={{ label: currentStepIndex === 0 ? 'Cancel' : 'Back', onPress: handleBack }}
      />

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors['surface.default'] }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors['accent.primary'],
              width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 'name' && (
          <NameStep colors={colors} draft={draft} setName={setName} setAlignment={setAlignment} />
        )}
        {currentStep === 'race' && (
          <SelectStep
            title="Choose your Race"
            options={DND_RACES}
            selected={draft.race}
            onSelect={(val) => setRace(val)}
            colors={colors}
          />
        )}
        {currentStep === 'class' && (
          <SelectStep
            title="Choose your Class"
            options={DND_CLASSES}
            selected={draft.characterClass}
            onSelect={(val) => setClass(val)}
            colors={colors}
          />
        )}
        {currentStep === 'abilities' && (
          <AbilitiesStep colors={colors} abilityScores={draft.abilityScores} setAbilityScore={setAbilityScore} />
        )}
        {currentStep === 'review' && (
          <ReviewStep colors={colors} draft={draft} />
        )}

        {validationError && (
          <Text style={[styles.errorText, { color: colors['accent.critical'] }]}>
            {validationError}
          </Text>
        )}

        <View style={styles.buttonRow}>
          {currentStep !== 'review' ? (
            <PrimaryButton label="Next" onPress={handleNext} style={{ flex: 1 }} />
          ) : (
            <PrimaryButton
              label="Create Character"
              onPress={() => void handleCreate()}
              loading={saving}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Step sub-components ────────────────────────────────────────────────────

function NameStep({
  colors,
  draft,
  setName,
  setAlignment,
}: {
  colors: ReturnType<typeof useThemeColors>;
  draft: CharacterDraft;
  setName: (v: string) => void;
  setAlignment: (v: CharacterDraft['alignment']) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.fieldLabel, { color: colors['text.secondary'] }]}>
        Character Name *
      </Text>
      <TextInput
        value={draft.name}
        onChangeText={setName}
        placeholder="e.g. Aralindë Nightwhisper"
        placeholderTextColor={colors['text.muted']}
        style={[styles.input, { backgroundColor: colors['surface.default'], color: colors['text.primary'], borderColor: colors['border.default'] }]}
        autoFocus
        maxLength={100}
        accessibilityLabel="Character name"
        accessibilityHint="Enter your character's name"
        returnKeyType="done"
      />

      <Text style={[styles.fieldLabel, { color: colors['text.secondary'], marginTop: Spacing[4] }]}>
        Alignment
      </Text>
      <View style={styles.chipGrid}>
        {ALIGNMENTS.map((alignment) => (
          <TouchableOpacity
            key={alignment}
            onPress={() => setAlignment(alignment as typeof draft.alignment)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  draft.alignment === alignment
                    ? colors['accent.primary']
                    : colors['surface.default'],
                borderColor:
                  draft.alignment === alignment
                    ? colors['accent.primary']
                    : colors['border.default'],
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: draft.alignment === alignment }}
            accessibilityLabel={alignment}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    draft.alignment === alignment
                      ? colors['background.primary']
                      : colors['text.secondary'],
                },
              ]}
            >
              {alignment}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SelectStep({
  title,
  options,
  selected,
  onSelect,
  colors,
}: {
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (val: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={[TextStyles.headingMedium, { color: colors['text.primary'], marginBottom: Spacing[4] }]}>
        {title}
      </Text>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.selectRow,
              {
                backgroundColor: isSelected ? `${colors['accent.primary']}20` : colors['background.secondary'],
                borderColor: isSelected ? colors['accent.primary'] : colors['border.default'],
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={option}
          >
            <Text
              style={[
                styles.selectText,
                { color: isSelected ? colors['accent.primary'] : colors['text.primary'] },
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
            {isSelected && (
              <View style={[styles.radioCheck, { backgroundColor: colors['accent.primary'] }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AbilitiesStep({
  colors,
  abilityScores,
  setAbilityScore,
}: {
  colors: ReturnType<typeof useThemeColors>;
  abilityScores: AbilityScores;
  setAbilityScore: (ability: keyof AbilityScores, value: number) => void;
}) {
  const abilities = (Object.keys(abilityScores) as Array<keyof AbilityScores>);
  const abilityColors: Record<keyof AbilityScores, string> = {
    STR: colors['dnd.str'],
    DEX: colors['dnd.dex'],
    CON: colors['dnd.con'],
    INT: colors['dnd.int'],
    WIS: colors['dnd.wis'],
    CHA: colors['dnd.cha'],
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={[TextStyles.headingMedium, { color: colors['text.primary'], marginBottom: Spacing[4] }]}>
        Set Ability Scores
      </Text>
      <View style={styles.abilitiesGrid}>
        {abilities.map((ability) => (
          <AbilityScoreEditor
            key={ability}
            ability={ability}
            score={abilityScores[ability]}
            color={abilityColors[ability]}
            onIncrement={() => {
              if (abilityScores[ability] < 30) {
                setAbilityScore(ability, abilityScores[ability] + 1);
              }
            }}
            onDecrement={() => {
              if (abilityScores[ability] > 1) {
                setAbilityScore(ability, abilityScores[ability] - 1);
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}

function ReviewStep({
  colors,
  draft,
}: {
  colors: ReturnType<typeof useThemeColors>;
  draft: CharacterDraft;
}) {
  const classIndex = draft.characterClass.toLowerCase();
  const hitDie = CLASS_HIT_DIE[classIndex] ?? 8;
  const hp = maxHitPoints(hitDie, draft.level, draft.abilityScores);

  return (
    <View style={styles.stepContainer}>
      <Text style={[TextStyles.headingMedium, { color: colors['text.primary'], marginBottom: Spacing[4] }]}>
        Review Character
      </Text>

      {[
        { label: 'Name', value: draft.name },
        { label: 'Race', value: draft.race || '—' },
        { label: 'Class', value: draft.characterClass || '—' },
        { label: 'Level', value: String(draft.level) },
        { label: 'Alignment', value: draft.alignment ?? '—' },
        { label: 'Starting HP', value: String(hp) },
        { label: 'STR / DEX / CON', value: `${draft.abilityScores.STR} / ${draft.abilityScores.DEX} / ${draft.abilityScores.CON}` },
        { label: 'INT / WIS / CHA', value: `${draft.abilityScores.INT} / ${draft.abilityScores.WIS} / ${draft.abilityScores.CHA}` },
      ].map(({ label, value }) => (
        <View
          key={label}
          style={[styles.reviewRow, { borderBottomColor: colors['border.default'] }]}
        >
          <Text style={[styles.reviewLabel, { color: colors['text.secondary'] }]}>{label}</Text>
          <Text style={[styles.reviewValue, { color: colors['text.primary'] }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  progressBar: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  stepContainer: {
    gap: Spacing[2],
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    fontSize: FontSize.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing[2],
  },
  selectText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  radioCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  abilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'center',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewLabel: {
    fontSize: FontSize.base,
  },
  reviewValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  buttonRow: {
    marginTop: Spacing[8],
  },
  errorText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing[3],
  },
});
