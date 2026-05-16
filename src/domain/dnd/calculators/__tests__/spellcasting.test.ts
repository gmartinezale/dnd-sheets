import { spellSaveDC, spellAttackBonus } from '../spellcasting';
import { DEFAULT_ABILITY_SCORES } from '../../types/character';

const abilityScores = { ...DEFAULT_ABILITY_SCORES, INT: 18 }; // INT mod = +4

describe('spellSaveDC', () => {
  it('calculates correctly: 8 + prof + ability mod', () => {
    // Level 5: prof = 3, INT mod = +4 → DC = 8 + 3 + 4 = 15
    expect(spellSaveDC({ spellcastingAbility: 'INT', abilityScores, characterLevel: 5 })).toBe(15);
  });

  it('applies miscBonus', () => {
    // Level 1: prof = 2, INT mod = +4, misc = +1 → DC = 8 + 2 + 4 + 1 = 15
    expect(
      spellSaveDC({ spellcastingAbility: 'INT', abilityScores, characterLevel: 1, miscBonus: 1 }),
    ).toBe(15);
  });
});

describe('spellAttackBonus', () => {
  it('calculates correctly: prof + ability mod', () => {
    // Level 5: prof = 3, INT mod = +4 → bonus = +7
    expect(
      spellAttackBonus({ spellcastingAbility: 'INT', abilityScores, characterLevel: 5 }),
    ).toBe(7);
  });
});
