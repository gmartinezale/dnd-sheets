/**
 * Sorcerer-specific resources per SRD 5.1.
 * Sorcery Points are regained on a long rest.
 * TODO: Font of Magic (convert sorcery points ↔ spell slots) — post-MVP
 */

/** Sorcery points by sorcerer level */
export const SORCERY_POINTS_BY_LEVEL: Record<number, number> = {
  1: 0,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  17: 17,
  18: 18,
  19: 19,
  20: 20,
};

export function sorceryPointsForLevel(level: number): number {
  const points = SORCERY_POINTS_BY_LEVEL[level];
  if (points === undefined) {
    throw new RangeError(`No sorcery points defined for level ${level}`);
  }
  return points;
}
