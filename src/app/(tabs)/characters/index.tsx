import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppScreen } from '@/shared/components/AppScreen';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius, MinTouchTarget } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';
import { formatHP } from '@/core/utils/formatters';
import { useCharacterList } from '@/features/characters/hooks/useCharacterList';
import type { CharacterSummary } from '@/domain/dnd/types/character';
import { Ionicons } from '@expo/vector-icons';

export default function CharactersScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { characters, isLoading, error, refetch } = useCharacterList();

  const handleNewCharacter = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/characters/new');
  }, [router]);

  const handleOpenCharacter = useCallback(
    (id: string) => {
      router.push(`/(tabs)/characters/${id}`);
    },
    [router],
  );

  if (isLoading) {
    return <LoadingState message="Loading characters..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Could not load characters."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <AppScreen scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[TextStyles.headingLarge, { color: colors['text.primary'] }]}>
          My Characters
        </Text>
      </View>

      {/* List */}
      {characters.length === 0 ? (
        <EmptyState onNew={handleNewCharacter} colors={colors} />
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CharacterCard
              character={item}
              onPress={() => handleOpenCharacter(item.id)}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={handleNewCharacter}
        style={[styles.fab, { backgroundColor: colors['accent.primary'] }]}
        accessibilityRole="button"
        accessibilityLabel="Create new character"
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors['background.primary']} />
      </TouchableOpacity>
    </AppScreen>
  );
}

function CharacterCard({
  character,
  onPress,
  colors,
}: {
  character: CharacterSummary;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const hpPercent = character.maxHitPoints > 0
    ? character.currentHitPoints / character.maxHitPoints
    : 0;
  const hpColor =
    hpPercent > 0.5
      ? colors['accent.success']
      : hpPercent > 0.25
      ? colors['accent.primary']
      : colors['accent.critical'];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${character.name}, ${character.characterClass} level ${character.level}. HP: ${formatHP(character.currentHitPoints, character.maxHitPoints)}`}
      activeOpacity={0.85}
    >
      {/* Avatar placeholder */}
      <View style={[styles.avatar, { backgroundColor: colors['surface.default'] }]}>
        <Ionicons name="person" size={28} color={colors['text.muted']} />
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={[styles.characterName, { color: colors['text.primary'] }]} numberOfLines={1}>
          {character.name}
        </Text>
        <Text style={[styles.characterClass, { color: colors['text.secondary'] }]}>
          {character.characterClass} — Level {character.level} · {character.race}
        </Text>
      </View>

      {/* HP */}
      <View style={styles.hpContainer}>
        <Text style={[styles.hpLabel, { color: colors['text.muted'] }]}>HP</Text>
        <Text style={[styles.hpValue, { color: hpColor }]}>
          {formatHP(character.currentHitPoints, character.maxHitPoints)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors['text.muted']} />
    </TouchableOpacity>
  );
}

function EmptyState({
  onNew,
  colors,
}: {
  onNew: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="shield-outline" size={64} color={colors['text.muted']} />
      <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'] }]}>
        No characters yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors['text.muted'] }]}>
        Create your first character to begin your adventure.
      </Text>
      <TouchableOpacity
        onPress={onNew}
        style={[styles.emptyBtn, { borderColor: colors['accent.primary'] }]}
        accessibilityRole="button"
        accessibilityLabel="Create first character"
      >
        <Text style={[styles.emptyBtnText, { color: colors['accent.primary'] }]}>
          Create Character
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing[6],
    paddingBottom: Spacing[4],
  },
  list: {
    paddingTop: Spacing[2],
    paddingBottom: 100, // space for FAB
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing[3],
    gap: Spacing[3],
    minHeight: MinTouchTarget + 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  characterName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  characterClass: {
    fontSize: FontSize.sm,
  },
  hpContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  hpLabel: {
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hpValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing[8],
    right: Spacing[4],
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    paddingTop: Spacing[12],
  },
  emptySubtext: {
    fontSize: FontSize.base,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyBtn: {
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  emptyBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
