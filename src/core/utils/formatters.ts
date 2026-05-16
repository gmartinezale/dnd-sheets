/**
 * Formats a D&D modifier number with sign (e.g., +3, -1, +0).
 */
export function formatModifier(modifier: number): string {
  if (modifier >= 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
}

/**
 * Formats HP as "current / max".
 */
export function formatHP(current: number, max: number): string {
  return `${current} / ${max}`;
}

/**
 * Formats a dice expression (e.g., "1d8", "2d6+3").
 */
export function formatDice(count: number, sides: number, bonus?: number): string {
  const base = `${count}d${sides}`;
  if (bonus === undefined || bonus === 0) {
    return base;
  }
  return `${base}${formatModifier(bonus)}`;
}

/**
 * Capitalizes the first letter of each word.
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncates a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Formats a spell level (0 = Cantrip, else "Level N").
 */
export function formatSpellLevel(level: number): string {
  if (level === 0) {
    return 'Cantrip';
  }
  return `Level ${level}`;
}
