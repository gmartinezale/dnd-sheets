import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { useSpellsQuery } from '@/features/compendium/hooks/useSpellsQuery';
import { formatSpellLevel } from '@/core/utils/formatters';

const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export default function SpellsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const { data, isLoading, error, refetch } = useSpellsQuery();

  if (isLoading) {
    return <LoadingState message="Loading spells..." />;
  }
  if (error) {
    return <ErrorState message="Could not load spells." onRetry={() => void refetch()} />;
  }

  const spells = (data ?? []).filter((spell) => {
    const matchesSearch = search.trim()
      ? spell.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesLevel = levelFilter !== null ? spell.level === levelFilter : true;
    return matchesSearch && matchesLevel;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Spells" leftAction={{ label: 'Back', onPress: () => router.back() }} />

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors['background.secondary'] }]}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search spells..."
          placeholderTextColor={colors['text.muted']}
          style={[styles.searchInput, { color: colors['text.primary'], borderColor: colors['border.default'] }]}
          clearButtonMode="while-editing"
          accessibilityLabel="Search spells"
        />
      </View>

      {/* Level filter chips */}
      <FlatList
        horizontal
        data={[null, ...LEVELS]}
        keyExtractor={(item) => String(item)}
        contentContainerStyle={styles.filterRow}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isActive = levelFilter === item;
          return (
            <TouchableOpacity
              onPress={() => setLevelFilter(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors['accent.primary'] : colors['surface.default'],
                  borderColor: isActive ? colors['accent.primary'] : colors['border.default'],
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={item === null ? 'All levels' : formatSpellLevel(item)}
            >
              <Text style={[styles.chipText, { color: isActive ? colors['background.primary'] : colors['text.secondary'] }]}>
                {item === null ? 'All' : item === 0 ? 'Cantrip' : `Lv ${item}`}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Spell list */}
      <FlatList
        data={spells}
        keyExtractor={(item) => item.index}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.spellRow, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.spellName, { color: colors['text.primary'] }]}>{item.name}</Text>
              <Text style={[styles.spellMeta, { color: colors['text.muted'] }]}>
                {formatSpellLevel(item.level)} · {item.school?.name ?? ''}
              </Text>
            </View>
            {item.concentration && (
              <View style={[styles.badge, { backgroundColor: `${colors['accent.secondary']}30` }]}>
                <Text style={[styles.badgeText, { color: colors['accent.secondary'] }]}>C</Text>
              </View>
            )}
            {item.ritual && (
              <View style={[styles.badge, { backgroundColor: `${colors['accent.primary']}20` }]}>
                <Text style={[styles.badgeText, { color: colors['accent.primary'] }]}>R</Text>
              </View>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors['text.muted'] }]}>No spells found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  searchInput: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    fontSize: FontSize.base,
  },
  filterRow: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing[2],
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  list: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  spellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing[2],
  },
  spellName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  spellMeta: {
    fontSize: FontSize.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing[8],
    fontSize: FontSize.base,
  },
});
