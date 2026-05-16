import type { AbilityName } from '@/core/constants/dnd.constants';

export type AbilityScores = {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
};

export type AbilityModifiers = AbilityScores;

export type SavingThrowProficiencies = {
  STR: boolean;
  DEX: boolean;
  CON: boolean;
  INT: boolean;
  WIS: boolean;
  CHA: boolean;
};

export type AbilityScoreEntry = {
  ability: AbilityName;
  score: number;
  modifier: number;
  savingThrow: {
    bonus: number;
    isProficient: boolean;
  };
};
