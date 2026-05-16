export const Colors = {
  dark: {
    // Backgrounds
    'background.primary': '#1A1510',
    'background.secondary': '#231E18',
    'background.elevated': '#2E2720',
    'surface.default': '#332C24',
    'surface.hover': '#3E362C',
    // Borders
    'border.default': '#4A3F33',
    'border.accent': '#8B6B3D',
    // Text
    'text.primary': '#F2E8D9',
    'text.secondary': '#A89880',
    'text.muted': '#6B5E50',
    // Accents
    'accent.primary': '#C8922A',
    'accent.secondary': '#8B6B3D',
    'accent.critical': '#C94040',
    'accent.success': '#4A8C5C',
    'accent.magic': '#6B5EA8',
    // D&D attribute colors
    'dnd.str': '#C94040',
    'dnd.dex': '#4A8C5C',
    'dnd.con': '#C8922A',
    'dnd.int': '#4A7EA8',
    'dnd.wis': '#8B6B3D',
    'dnd.cha': '#8B4A8B',
  },
  light: {
    'background.primary': '#F5EDD9',
    'background.secondary': '#EDE0C4',
    'background.elevated': '#E8D9B8',
    'surface.default': '#DDD0B0',
    'surface.hover': '#D4C5A0',
    'border.default': '#C4AA80',
    'border.accent': '#8B6B3D',
    'text.primary': '#1A1510',
    'text.secondary': '#5C4A32',
    'text.muted': '#8C7A5E',
    'accent.primary': '#8B5E0A',
    'accent.secondary': '#8B6B3D',
    'accent.critical': '#B03030',
    'accent.success': '#3A7048',
    'accent.magic': '#4A3A80',
    'dnd.str': '#B03030',
    'dnd.dex': '#3A7048',
    'dnd.con': '#8B5E0A',
    'dnd.int': '#2E6080',
    'dnd.wis': '#7A5A2E',
    'dnd.cha': '#7A3A7A',
  },
} as const;

export type ColorScheme = 'dark' | 'light';
export type ColorKey = keyof typeof Colors.dark;
