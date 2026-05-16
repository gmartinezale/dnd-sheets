import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ResourceCounter } from '@/shared/components/ResourceCounter';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { resourceRepository } from '@/data/db/repositories/compendium.repository';
import { getResettingResources } from '@/domain/dnd/calculators/resources';
import type { Character } from '@/domain/dnd/types/character';
import type { ResourcePool } from '@/domain/dnd/types/resources';

export default function ResourcesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [character, setCharacter] = useState<Character | null>(null);
  const [resources, setResources] = useState<ResourcePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    Promise.all([
      characterRepository.getCharacterById(id),
      resourceRepository.getResourcePools(id),
    ])
      .then(([char, res]) => {
        setCharacter(char);
        setResources(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load resources');
        setLoading(false);
      });
  }, [id]);

  const handleRestoreResource = async (resource: ResourcePool, delta: number) => {
    const next = Math.max(0, Math.min(resource.maximum, resource.current + delta));
    const updated = { ...resource, current: next };
    setResources((prev) => prev.map((r) => (r.id === resource.id ? updated : r)));
    await resourceRepository.updateResourcePool(resource.id, { current: next });
  };

  const handleRest = async (type: 'short' | 'long') => {
    if (!character || !id) {
      return;
    }
    const toReset = getResettingResources(resources, type);
    const updatedResources = resources.map((r) =>
      toReset.some((res) => res.id === r.id) ? { ...r, current: r.maximum } : r,
    );
    setResources(updatedResources);

    // Persist resets
    await Promise.all(
      toReset.map((r) => resourceRepository.updateResourcePool(r.id, { current: r.maximum })),
    );

    if (type === 'long') {
      // Long rest also restores HP
      await characterRepository.updateCharacter(id, {
        currentHitPoints: character.maxHitPoints,
        hitDiceRemaining: Math.min(
          character.level,
          character.hitDiceRemaining + Math.max(1, Math.floor(character.level / 2)),
        ),
      });
      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              currentHitPoints: prev.maxHitPoints,
              hitDiceRemaining: Math.min(
                prev.level,
                prev.hitDiceRemaining + Math.max(1, Math.floor(prev.level / 2)),
              ),
            }
          : prev,
      );
    }
  };

  const confirmRest = (type: 'short' | 'long') => {
    Alert.alert(
      type === 'short' ? 'Short Rest' : 'Long Rest',
      type === 'short'
        ? 'Take a short rest and restore short-rest resources?'
        : 'Take a long rest and fully restore HP and all resources?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rest', onPress: () => void handleRest(type) },
      ],
    );
  };

  if (loading) {
    return <LoadingState />;
  }
  if (error || !character) {
    return <ErrorState message={error ?? 'Character not found'} onRetry={() => router.back()} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Resources" leftAction={{ label: 'Back', onPress: () => router.back() }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* HP */}
        <ResourceCounter
          label="Hit Points"
          current={character.currentHitPoints}
          maximum={character.maxHitPoints}
          onDecrement={() =>
            id ? void characterRepository
              .updateCharacter(id, { currentHitPoints: Math.max(0, character.currentHitPoints - 1) })
              .then(() =>
                setCharacter((prev) =>
                  prev ? { ...prev, currentHitPoints: Math.max(0, prev.currentHitPoints - 1) } : prev,
                ),
              ) : undefined
          }
          onIncrement={() =>
            id ? void characterRepository
              .updateCharacter(id, {
                currentHitPoints: Math.min(character.maxHitPoints, character.currentHitPoints + 1),
              })
              .then(() =>
                setCharacter((prev) =>
                  prev
                    ? {
                        ...prev,
                        currentHitPoints: Math.min(prev.maxHitPoints, prev.currentHitPoints + 1),
                      }
                    : prev,
                ),
              ) : undefined
          }
          color={
            character.currentHitPoints / character.maxHitPoints > 0.5
              ? colors['accent.success']
              : colors['accent.critical']
          }
        />

        {/* Other resources */}
        {resources.length > 0 && (
          <>
            <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'] }]}>
              Other Resources
            </Text>
            {resources.map((resource) => (
              <ResourceCounter
                key={resource.id}
                label={resource.name}
                current={resource.current}
                maximum={resource.maximum}
                onDecrement={() => void handleRestoreResource(resource, -1)}
                onIncrement={() => void handleRestoreResource(resource, 1)}
              />
            ))}
          </>
        )}

        {/* Rest buttons */}
        <Text style={[TextStyles.headingMedium, { color: colors['text.secondary'], marginTop: Spacing[4] }]}>
          Take a Rest
        </Text>
        <View style={styles.restRow}>
          <TouchableOpacity
            onPress={() => confirmRest('short')}
            style={[styles.restBtn, { backgroundColor: colors['surface.default'], borderColor: colors['accent.secondary'] }]}
            accessibilityRole="button"
            accessibilityLabel="Short rest"
          >
            <Text style={[styles.restBtnText, { color: colors['accent.secondary'] }]}>Short Rest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => confirmRest('long')}
            style={[styles.restBtn, { backgroundColor: `${colors['accent.primary']}20`, borderColor: colors['accent.primary'] }]}
            accessibilityRole="button"
            accessibilityLabel="Long rest"
          >
            <Text style={[styles.restBtnText, { color: colors['accent.primary'] }]}>Long Rest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  restRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  restBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[4],
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  restBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});
