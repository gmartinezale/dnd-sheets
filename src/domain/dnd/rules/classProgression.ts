/**
 * D&D 5e Class Progression per SRD 5.1.
 * Contains per-class per-level feature summaries (level thresholds only, not full text).
 * TODO: Add full feature descriptions from SRD for post-MVP compendium
 */

import { CLASS_HIT_DIE, CLASS_SAVING_THROWS } from './spellSlotProgression';

export type ClassLevelFeature = {
  level: number;
  name: string;
};

/** Abbreviated class features by level (names only, not descriptions) */
export const CLASS_FEATURES: Record<string, ClassLevelFeature[]> = {
  barbarian: [
    { level: 1, name: 'Rage' },
    { level: 1, name: 'Unarmored Defense' },
    { level: 2, name: 'Reckless Attack' },
    { level: 2, name: 'Danger Sense' },
    { level: 3, name: 'Primal Path' },
    { level: 5, name: 'Extra Attack' },
    { level: 5, name: 'Fast Movement' },
    { level: 7, name: 'Feral Instinct' },
    { level: 9, name: 'Brutal Critical (1 die)' },
    { level: 11, name: 'Relentless Rage' },
    { level: 13, name: 'Brutal Critical (2 dice)' },
    { level: 15, name: 'Persistent Rage' },
    { level: 17, name: 'Brutal Critical (3 dice)' },
    { level: 18, name: 'Indomitable Might' },
    { level: 20, name: 'Primal Champion' },
  ],
  // TODO: Add remaining classes post-MVP
};

export { CLASS_HIT_DIE, CLASS_SAVING_THROWS };

/**
 * Returns features unlocked at or before a given level for a class.
 */
export function featuresUpToLevel(classIndex: string, level: number): ClassLevelFeature[] {
  const features = CLASS_FEATURES[classIndex] ?? [];
  return features.filter((f) => f.level <= level);
}
