import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppScreen } from '@/shared/components/AppScreen';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';

const SECTIONS = [
  { label: 'Spells', icon: 'sparkles', route: '/(tabs)/compendium/spells', desc: 'Browse all SRD spells' },
  { label: 'Classes', icon: 'shield', route: '/(tabs)/compendium/classes', desc: 'Explore character classes' },
  { label: 'Races', icon: 'people', route: '/(tabs)/compendium/races', desc: 'Discover races & traits' },
  { label: 'Equipment', icon: 'briefcase', route: '/(tabs)/compendium/equipment', desc: 'Weapons, armor, and gear' },
] as const;

export default function CompendiumScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={[TextStyles.headingLarge, { color: colors['text.primary'] }]}>Compendium</Text>
        <Text style={[styles.subtitle, { color: colors['text.secondary'] }]}>
          D&D 5e SRD Reference
        </Text>
      </View>
      <View style={styles.grid}>
        {SECTIONS.map(({ label, icon, route, desc }) => (
          <TouchableOpacity
            key={label}
            onPress={() => router.push(route)}
            style={[styles.card, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${desc}`}
            activeOpacity={0.85}
          >
            <Ionicons name={icon as 'sparkles'} size={32} color={colors['accent.primary']} />
            <Text style={[styles.cardLabel, { color: colors['text.primary'] }]}>{label}</Text>
            <Text style={[styles.cardDesc, { color: colors['text.muted'] }]}>{desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing[6],
    paddingBottom: Spacing[6],
    gap: Spacing[1],
  },
  subtitle: {
    fontSize: FontSize.base,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  card: {
    width: '47%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[5],
    gap: Spacing[2],
    minHeight: 130,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  cardDesc: {
    fontSize: FontSize.sm,
  },
});
