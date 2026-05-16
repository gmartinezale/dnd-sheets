import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { spellRepository } from '@/data/db/repositories/compendium.repository';
import { dnd5eApiProvider } from '@/data/api/providers/dnd5eApi.provider';
import { formatSpellLevel } from '@/core/utils/formatters';
import type { CharacterSpell } from '@/domain/dnd/types/spells';

type SpellSection = { title: string; data: CharacterSpell[] };

function groupByLevel(spells: CharacterSpell[]): SpellSection[] {
  const map = new Map<number, CharacterSpell[]>();
  for (const spell of spells) {
    if (!map.has(spell.spellLevel)) {
      map.set(spell.spellLevel, []);
    }
    const arr = map.get(spell.spellLevel);
    if (arr) { arr.push(spell); }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, data]) => ({ title: formatSpellLevel(level), data }));
}

type SrdSpellItem = { index: string; name: string };
type SchoolItem = { index: string; name: string };
type SpellFilters = { level: number | null; school: string | null; classIndex: string | null };

const SPELL_LEVELS = [
  { value: 0, label: 'Cantrip' },
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: 5, label: '5th' },
  { value: 6, label: '6th' },
  { value: 7, label: '7th' },
  { value: 8, label: '8th' },
  { value: 9, label: '9th' },
];

const CASTER_CLASSES = [
  { index: 'bard', name: 'Bard' },
  { index: 'cleric', name: 'Cleric' },
  { index: 'druid', name: 'Druid' },
  { index: 'paladin', name: 'Paladin' },
  { index: 'ranger', name: 'Ranger' },
  { index: 'sorcerer', name: 'Sorcerer' },
  { index: 'warlock', name: 'Warlock' },
  { index: 'wizard', name: 'Wizard' },
];

function FilterChip({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        addStyles.chip,
        selected
          ? { backgroundColor: colors['accent.primary'], borderColor: colors['accent.primary'] }
          : { backgroundColor: colors['surface.default'], borderColor: colors['border.default'] },
      ]}
      onPress={onPress}
    >
      <Text style={[addStyles.chipText, { color: selected ? '#1A1510' : colors['text.secondary'] }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FilterRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[addStyles.filterRow, { borderBottomColor: colors['border.default'] }]}>
      <Text style={[addStyles.filterLabel, { color: colors['text.muted'] }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={addStyles.chipRow}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function AddSpellModal({
  visible,
  characterId,
  existingIndices,
  colors,
  onClose,
  onAdded,
}: {
  visible: boolean;
  characterId: string;
  existingIndices: Set<string>;
  colors: ReturnType<typeof useThemeColors>;
  onClose: () => void;
  onAdded: (spell: CharacterSpell) => void;
}) {
  const [srdSpells, setSrdSpells] = useState<SrdSpellItem[]>([]);
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [filters, setFilters] = useState<SpellFilters>({ level: null, school: null, classIndex: null });

  // Fetch schools once (cached in state across modal opens)
  useEffect(() => {
    if (!visible || schools.length > 0) { return; }
    dnd5eApiProvider.listMagicSchools().then(setSchools).catch(() => {});
  }, [visible, schools.length]);

  // Fetch spells on open or when filters change
  useEffect(() => {
    if (!visible) { return; }
    setLoadingList(true);
    const apiFilters: { level?: number; school?: string; classIndex?: string } = {};
    if (filters.level !== null) { apiFilters.level = filters.level; }
    if (filters.school !== null) { apiFilters.school = filters.school; }
    if (filters.classIndex !== null) { apiFilters.classIndex = filters.classIndex; }
    dnd5eApiProvider
      .listSpells(apiFilters)
      .then((items) => setSrdSpells(items as SrdSpellItem[]))
      .catch(() => setSrdSpells([]))
      .finally(() => setLoadingList(false));
  }, [visible, filters]);

  const handleClose = useCallback(() => {
    setFilters({ level: null, school: null, classIndex: null });
    setSearch('');
    onClose();
  }, [onClose]);

  const toggleFilter = useCallback(<K extends keyof SpellFilters>(key: K, value: SpellFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  }, []);

  const handleAdd = useCallback(
    async (item: SrdSpellItem) => {
      if (existingIndices.has(item.index)) {
        Alert.alert('Already Known', `${item.name} is already in your spell list.`);
        return;
      }
      setAdding(item.index);
      try {
        const detail = await dnd5eApiProvider.getSpell(item.index);
        const spell = await spellRepository.addCharacterSpell({
          characterId,
          spellIndex: item.index,
          spellName: item.name,
          spellLevel: detail.level,
          prepared: false,
          alwaysPrepared: false,
        });
        onAdded(spell);
      } catch {
        Alert.alert('Error', 'Could not add spell. Check your connection.');
      } finally {
        setAdding(null);
      }
    },
    [characterId, existingIndices, onAdded],
  );

  const filtered = srdSpells.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hasActiveFilters = filters.level !== null || filters.school !== null || filters.classIndex !== null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={addStyles.overlay}>
        <View style={[addStyles.sheet, { backgroundColor: colors['background.elevated'] }]}>
          {/* Header */}
          <View style={[addStyles.header, { borderBottomColor: colors['border.default'] }]}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={colors['text.secondary']} />
            </TouchableOpacity>
            <Text style={[addStyles.title, { color: colors['text.primary'] }]}>Add Spell</Text>
            {hasActiveFilters ? (
              <TouchableOpacity onPress={() => setFilters({ level: null, school: null, classIndex: null })}>
                <Text style={[addStyles.clearBtn, { color: colors['accent.primary'] }]}>Clear</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>

          {/* Search */}
          <View style={[addStyles.searchBar, { backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}>
            <Ionicons name="search" size={16} color={colors['text.muted']} />
            <TextInput
              style={[addStyles.searchInput, { color: colors['text.primary'] }]}
              placeholder="Search spells…"
              placeholderTextColor={colors['text.muted']}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors['text.muted']} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filters */}
          <FilterRow label="Level" colors={colors}>
            {SPELL_LEVELS.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                selected={filters.level === value}
                onPress={() => toggleFilter('level', value)}
                colors={colors}
              />
            ))}
          </FilterRow>

          {schools.length > 0 && (
            <FilterRow label="School" colors={colors}>
              {schools.map((s) => (
                <FilterChip
                  key={s.index}
                  label={s.name}
                  selected={filters.school === s.index}
                  onPress={() => toggleFilter('school', s.index)}
                  colors={colors}
                />
              ))}
            </FilterRow>
          )}

          <FilterRow label="Class" colors={colors}>
            {CASTER_CLASSES.map((c) => (
              <FilterChip
                key={c.index}
                label={c.name}
                selected={filters.classIndex === c.index}
                onPress={() => toggleFilter('classIndex', c.index)}
                colors={colors}
              />
            ))}
          </FilterRow>

          {/* Spell list */}
          {loadingList && srdSpells.length === 0 ? (
            <ActivityIndicator color={colors['accent.primary']} style={{ marginTop: Spacing[8] }} />
          ) : (
            <>
              {loadingList && (
                <ActivityIndicator
                  size="small"
                  color={colors['accent.primary']}
                  style={addStyles.refetchIndicator}
                />
              )}
              <FlatList
                data={filtered}
                keyExtractor={(s) => s.index}
                contentContainerStyle={{ padding: Spacing[4] }}
                ListEmptyComponent={
                  <Text style={[addStyles.emptyText, { color: colors['text.muted'] }]}>
                    No spells match the current filters.
                  </Text>
                }
                renderItem={({ item }) => {
                  const alreadyKnown = existingIndices.has(item.index);
                  const isAdding = adding === item.index;
                  return (
                    <TouchableOpacity
                      style={[addStyles.spellItem, { borderBottomColor: colors['border.default'], opacity: alreadyKnown ? 0.4 : 1 }]}
                      onPress={() => void handleAdd(item)}
                      disabled={alreadyKnown || isAdding}
                    >
                      <Text style={[addStyles.spellName, { color: colors['text.primary'] }]}>{item.name}</Text>
                      {isAdding ? (
                        <ActivityIndicator size="small" color={colors['accent.primary']} />
                      ) : alreadyKnown ? (
                        <Ionicons name="checkmark" size={16} color={colors['accent.success']} />
                      ) : (
                        <Ionicons name="add" size={18} color={colors['accent.primary']} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function SpellsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    spellRepository
      .getCharacterSpells(id)
      .then((data) => {
        setSpells(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load spells');
        setLoading(false);
      });
  }, [id]);

  const handleRemove = useCallback((spellId: string, spellName: string) => {
    Alert.alert('Remove Spell', `Remove ${spellName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          spellRepository.removeCharacterSpell(spellId).then(() => {
            setSpells((prev) => prev.filter((s) => s.id !== spellId));
          }).catch(() => Alert.alert('Error', 'Failed to remove spell.'));
        },
      },
    ]);
  }, []);

  const handleTogglePrepared = useCallback((spellId: string, currentPrepared: boolean) => {
    const next = !currentPrepared;
    spellRepository.toggleSpellPrepared(spellId, next).then(() => {
      setSpells((prev) => prev.map((s) => s.id === spellId ? { ...s, prepared: next } : s));
    }).catch(() => {});
  }, []);

  if (loading) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => router.back()} />;
  }

  const sections = groupByLevel(spells);
  const existingIndices = new Set(spells.map((s) => s.spellIndex));

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader
        title="Spells"
        leftAction={{ label: 'Back', onPress: () => router.back() }}
        rightAction={{ label: 'Add', onPress: () => setModalVisible(true) }}
      />
      {spells.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="sparkles-outline" size={48} color={colors['text.muted']} />
          <Text style={[styles.emptyText, { color: colors['text.muted'] }]}>No spells known.</Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors['accent.primary'] }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.emptyBtnText}>Add Spell</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors['background.primary'] }]}>
              <Text style={[styles.sectionTitle, { color: colors['accent.primary'] }]}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.spellRow, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
              <TouchableOpacity
                style={[
                  styles.prepBadge,
                  {
                    backgroundColor: item.prepared ? `${colors['accent.primary']}30` : colors['surface.default'],
                    borderColor: item.prepared ? colors['accent.primary'] : colors['border.default'],
                  },
                ]}
                onPress={() => handleTogglePrepared(item.id, item.prepared)}
                accessibilityLabel={`${item.prepared ? 'Unprepare' : 'Prepare'} ${item.spellName}`}
              >
                <Text style={[styles.prepText, { color: item.prepared ? colors['accent.primary'] : colors['text.muted'] }]}>P</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.spellName, { color: colors['text.primary'] }]}>{item.spellName}</Text>
                <Text style={[styles.spellSub, { color: colors['text.muted'] }]}>
                  {formatSpellLevel(item.spellLevel)} · {item.prepared ? 'Prepared' : 'Known'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(item.id, item.spellName)}
                accessibilityLabel={`Remove ${item.spellName}`}
                style={{ padding: Spacing[2] }}
              >
                <Ionicons name="trash-outline" size={16} color={colors['accent.critical']} />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
        />
      )}

      <AddSpellModal
        visible={modalVisible}
        characterId={id ?? ''}
        existingIndices={existingIndices}
        colors={colors}
        onClose={() => setModalVisible(false)}
        onAdded={(spell) => {
          setSpells((prev) => [...prev, spell]);
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing[4],
    paddingBottom: Spacing[12],
  },
  sectionHeader: {
    paddingVertical: Spacing[2],
    marginBottom: Spacing[1],
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  spellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 52,
    gap: Spacing[3],
  },
  spellName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  spellSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  prepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prepText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
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
  emptyBtn: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
  },
  emptyBtnText: { color: '#1A1510', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});

const addStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  clearBtn: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing[4],
    marginTop: Spacing[3],
    marginBottom: Spacing[1],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing[2],
  },
  searchInput: { flex: 1, paddingVertical: Spacing[3], fontSize: FontSize.sm },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing[2],
    paddingLeft: Spacing[4],
  },
  filterLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    width: 44,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingRight: Spacing[4],
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  refetchIndicator: {
    marginVertical: Spacing[2],
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    marginTop: Spacing[8],
  },
  spellItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  spellName: { fontSize: FontSize.sm },
});
