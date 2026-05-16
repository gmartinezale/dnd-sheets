import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { useEquipmentQuery } from '@/features/compendium/hooks/useEquipmentQuery';

export default function EquipmentCompendiumScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch } = useEquipmentQuery();

  if (isLoading) {
    return <LoadingState message="Loading equipment..." />;
  }
  if (error) {
    return <ErrorState message="Could not load equipment." onRetry={() => void refetch()} />;
  }

  const items = (data ?? []).filter((e) =>
    search.trim() ? e.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Equipment" leftAction={{ label: 'Back', onPress: () => router.back() }} />
      <View style={[styles.searchContainer, { backgroundColor: colors['background.secondary'] }]}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search equipment..."
          placeholderTextColor={colors['text.muted']}
          style={[styles.searchInput, { color: colors['text.primary'], borderColor: colors['border.default'] }]}
          clearButtonMode="while-editing"
          accessibilityLabel="Search equipment"
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.index}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors['text.primary'] }]}>{item.name}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors['text.muted'] }]}>No items found.</Text>
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
  list: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing[8],
    fontSize: FontSize.base,
  },
});
