import { create } from 'zustand';
import type { CharacterDraft } from '@/domain/dnd/types/character';
import type { AbilityScores, SavingThrowProficiencies } from '@/domain/dnd/types/abilities';
import {
  DEFAULT_ABILITY_SCORES,
  DEFAULT_SAVING_THROW_PROFICIENCIES,
} from '@/domain/dnd/types/character';

const INITIAL_DRAFT: CharacterDraft = {
  step: 'name',
  name: '',
  race: '',
  subrace: null,
  characterClass: '',
  level: 1,
  background: '',
  alignment: null,
  abilityScores: DEFAULT_ABILITY_SCORES,
  savingThrowProficiencies: DEFAULT_SAVING_THROW_PROFICIENCIES,
};

type CharacterDraftStore = {
  draft: CharacterDraft;
  setStep: (step: CharacterDraft['step']) => void;
  setName: (name: string) => void;
  setRace: (race: string, subrace?: string | null) => void;
  setClass: (characterClass: string) => void;
  setBackground: (background: string) => void;
  setAlignment: (alignment: CharacterDraft['alignment']) => void;
  setAbilityScore: (ability: keyof AbilityScores, value: number) => void;
  setAbilityScores: (scores: AbilityScores) => void;
  setSavingThrowProficiency: (ability: keyof SavingThrowProficiencies, value: boolean) => void;
  setSavingThrowProficiencies: (profs: SavingThrowProficiencies) => void;
  resetDraft: () => void;
};

export const useCharacterDraftStore = create<CharacterDraftStore>((set) => ({
  draft: INITIAL_DRAFT,

  setStep: (step) =>
    set((state) => ({ draft: { ...state.draft, step } })),

  setName: (name) =>
    set((state) => ({ draft: { ...state.draft, name } })),

  setRace: (race, subrace = null) =>
    set((state) => ({ draft: { ...state.draft, race, subrace } })),

  setClass: (characterClass) =>
    set((state) => ({ draft: { ...state.draft, characterClass } })),

  setBackground: (background) =>
    set((state) => ({ draft: { ...state.draft, background } })),

  setAlignment: (alignment) =>
    set((state) => ({ draft: { ...state.draft, alignment } })),

  setAbilityScore: (ability, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        abilityScores: { ...state.draft.abilityScores, [ability]: value },
      },
    })),

  setAbilityScores: (scores) =>
    set((state) => ({ draft: { ...state.draft, abilityScores: scores } })),

  setSavingThrowProficiency: (ability, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        savingThrowProficiencies: { ...state.draft.savingThrowProficiencies, [ability]: value },
      },
    })),

  setSavingThrowProficiencies: (profs) =>
    set((state) => ({ draft: { ...state.draft, savingThrowProficiencies: profs } })),

  resetDraft: () => set({ draft: INITIAL_DRAFT }),
}));
