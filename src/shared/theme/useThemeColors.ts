import { useColorScheme } from 'react-native';
import { Colors } from './colors';
import type { ColorScheme } from './colors';

export function useThemeColors(): (typeof Colors)[ColorScheme] {
  const raw = useColorScheme();
  const scheme: ColorScheme = raw === 'light' ? 'light' : 'dark';
  return Colors[scheme];
}

export function useColorSchemeValue<T>(dark: T, light: T): T {
  const raw = useColorScheme();
  const scheme: ColorScheme = raw === 'light' ? 'light' : 'dark';
  return scheme === 'dark' ? dark : light;
}
