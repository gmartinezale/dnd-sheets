import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { useClassesQuery } from '@/features/compendium/hooks/useClassesQuery';
import { CLASS_HIT_DIE } from '@/domain/dnd/rules/spellSlotProgression';

export default function ClassesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useClassesQuery();

  if (isLoading) {
    return <LoadingState message="Loading classes..." />;
  }
  if (error) {
    return <ErrorState message="Could not load classes." onRetry={() => void refetch()} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Classes" leftAction={{ label: 'Back', onPress: () => router.back() }} />
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.index}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const hitDie = CLASS_HIT_DIE[item.index] ?? 8;
          return (
            <View style={[styles.row, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors['text.primary'] }]}>{item.name}</Text>
                <Text style={[styles.sub, { color: colors['text.muted'] }]}>
                  Hit Die: d{hitDie}
                </Text>
              </View>
            </View>
          );
        }}
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
    minHeight: 60,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textTransform: 'capitalize',
  },
  sub: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
