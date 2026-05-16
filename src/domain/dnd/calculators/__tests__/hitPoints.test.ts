import { maxHitPoints } from '../hitPoints';
import { DEFAULT_ABILITY_SCORES } from '../../types/character';

describe('maxHitPoints', () => {
  const averageAbilities = { ...DEFAULT_ABILITY_SCORES }; // CON 10 → mod 0

  it('level 1 wizard: 6 + 0 = 6', () => {
    expect(maxHitPoints(6, 1, averageAbilities)).toBe(6);
  });

  it('level 1 barbarian: 12 + 0 = 12', () => {
    expect(maxHitPoints(12, 1, averageAbilities)).toBe(12);
  });

  it('level 5 wizard with CON 14 (+2): 6+2 + 4*(4+2) = 8 + 24 = 32', () => {
    const scores = { ...DEFAULT_ABILITY_SCORES, CON: 14 };
    // level1 = 6 + 2 = 8; avg_per_level = floor(6/2)+1 = 4; 4 extra levels × (4+2) = 24 → 32
    expect(maxHitPoints(6, 5, scores)).toBe(32);
  });

  it('throws for level 0', () => {
    expect(() => maxHitPoints(8, 0, averageAbilities)).toThrow(RangeError);
  });
});
