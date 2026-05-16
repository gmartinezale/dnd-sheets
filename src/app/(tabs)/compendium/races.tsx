import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { useRacesQuery } from '@/features/compendium/hooks/useRacesQuery';

export default function RacesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useRacesQuery();

  if (isLoading) {
    return <LoadingState message="Loading races..." />;
  }
  if (error) {
    return <ErrorState message="Could not load races." onRetry={() => void refetch()} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Races" leftAction={{ label: 'Back', onPress: () => router.back() }} />
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.index}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
            <Text style={[styles.name, { color: colors['text.primary'] }]}>{item.name}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  row: {
    padding: Spacing[4],
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
