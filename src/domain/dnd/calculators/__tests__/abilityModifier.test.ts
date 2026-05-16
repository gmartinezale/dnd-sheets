import { abilityModifier } from '../abilityModifier';

describe('abilityModifier', () => {
  it('returns 0 for score 10', () => {
    expect(abilityModifier(10)).toBe(0);
  });

  it('returns 0 for score 11', () => {
    expect(abilityModifier(11)).toBe(0);
  });

  it('returns +1 for score 12', () => {
    expect(abilityModifier(12)).toBe(1);
  });

  it('returns +1 for score 13', () => {
    expect(abilityModifier(13)).toBe(1);
  });

  it('returns +5 for score 20', () => {
    expect(abilityModifier(20)).toBe(5);
  });

  it('returns +10 for score 30', () => {
    expect(abilityModifier(30)).toBe(10);
  });

  it('returns -1 for score 8', () => {
    expect(abilityModifier(8)).toBe(-1);
  });

  it('returns -5 for score 1', () => {
    expect(abilityModifier(1)).toBe(-5);
  });

  it('returns -4 for score 3', () => {
    expect(abilityModifier(3)).toBe(-4);
  });

  it('throws for score below 1', () => {
    expect(() => abilityModifier(0)).toThrow(RangeError);
  });

  it('throws for score above 30', () => {
    expect(() => abilityModifier(31)).toThrow(RangeError);
  });
});
