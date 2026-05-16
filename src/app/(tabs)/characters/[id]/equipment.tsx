import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { inventoryRepository } from '@/data/db/repositories/compendium.repository';
import type { InventoryItem } from '@/domain/dnd/types/equipment';

export default function EquipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    inventoryRepository
      .getInventoryItems(id)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
        setLoading(false);
      });
  }, [id]);

  const toggleEquip = async (item: InventoryItem) => {
    const updated = { ...item, equipped: !item.equipped };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await inventoryRepository.updateInventoryItem(item.id, { equipped: !item.equipped });
  };

  if (loading) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => router.back()} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader title="Equipment" leftAction={{ label: 'Back', onPress: () => router.back() }} />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="briefcase-outline" size={48} color={colors['text.muted']} />
          <Text style={[styles.emptyText, { color: colors['text.muted'] }]}>No items yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.row,
                {
                  backgroundColor: colors['background.secondary'],
                  borderColor: item.equipped ? colors['accent.primary'] : colors['border.default'],
                },
              ]}
              onPress={() => void toggleEquip(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.equipped }}
              accessibilityLabel={`${item.name}, ${item.equipped ? 'equipped' : 'not equipped'}`}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors['text.primary'] }]}>{item.name}</Text>
                <Text style={[styles.sub, { color: colors['text.muted'] }]}>
                  Qty: {item.quantity} · {item.weight ?? 0} lb
                </Text>
              </View>
              {item.equipped && (
                <Ionicons name="checkmark-circle" size={20} color={colors['accent.primary']} />
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minHeight: 60,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  sub: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  emptyText: {
    fontSize: FontSize.base,
  },
});
