import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight } from '@/shared/theme/typography';
import { weaponRepository } from '@/data/db/repositories/weapon.repository';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { dnd5eApiProvider } from '@/data/api/providers/dnd5eApi.provider';
import { weaponAttackBonus, weaponDamageBonus, proficiencyBonus } from '@/domain/dnd';
import { formatModifier } from '@/core/utils/formatters';
import type { CharacterWeapon, CreateCharacterWeaponInput } from '@/domain/dnd/types/equipment';
import type { Character } from '@/domain/dnd/types/character';

// ─── Weapon Row ──────────────────────────────────────────────────────────────

type WeaponRowProps = {
  weapon: CharacterWeapon;
  character: Character;
  colors: ReturnType<typeof useThemeColors>;
  onDelete: (id: string) => void;
};

function WeaponRow({ weapon, character, colors, onDelete }: WeaponRowProps) {
  const atkBonus = weaponAttackBonus({
    isProficient: weapon.isProficient,
    attackAbility: weapon.attackAbility,
    abilityScores: character.abilityScores,
    characterLevel: character.level,
    miscBonus: weapon.magicBonus,
  });
  const dmgBonus = weaponDamageBonus(
    weapon.attackAbility,
    character.abilityScores,
    weapon.magicBonus,
  );
  const dmgStr = dmgBonus !== 0
    ? `${weapon.damageDice}${formatModifier(dmgBonus)}`
    : weapon.damageDice;

  return (
    <View style={[styles.weaponRow, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
      <View style={styles.weaponInfo}>
        <Text style={[styles.weaponName, { color: colors['text.primary'] }]}>{weapon.name}</Text>
        <View style={styles.weaponStats}>
          <View style={[styles.statChip, { backgroundColor: colors['surface.default'] }]}>
            <Text style={[styles.statLabel, { color: colors['text.secondary'] }]}>ATK</Text>
            <Text style={[styles.statValue, { color: colors['accent.primary'] }]}>
              {formatModifier(atkBonus)}
            </Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: colors['surface.default'] }]}>
            <Text style={[styles.statLabel, { color: colors['text.secondary'] }]}>DMG</Text>
            <Text style={[styles.statValue, { color: colors['text.primary'] }]}>{dmgStr}</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: colors['surface.default'] }]}>
            <Text style={[styles.statLabel, { color: colors['text.secondary'] }]}>TYPE</Text>
            <Text style={[styles.statValue, { color: colors['text.secondary'] }]} numberOfLines={1}>
              {weapon.damageType}
            </Text>
          </View>
        </View>
        {weapon.properties.length > 0 && (
          <Text style={[styles.properties, { color: colors['text.muted'] }]}>
            {weapon.properties.join(' · ')}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Remove Weapon', `Remove ${weapon.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => onDelete(weapon.id) },
          ])
        }
        style={styles.deleteBtn}
        accessibilityLabel={`Delete ${weapon.name}`}
      >
        <Ionicons name="trash-outline" size={18} color={colors['accent.critical']} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Add Weapon Form ─────────────────────────────────────────────────────────

type FormState = {
  name: string;
  damageDice: string;
  damageType: string;
  attackAbility: 'STR' | 'DEX';
  isProficient: boolean;
  magicBonus: string;
  notes: string;
};

const DEFAULT_FORM: FormState = {
  name: '',
  damageDice: '1d6',
  damageType: 'slashing',
  attackAbility: 'STR',
  isProficient: true,
  magicBonus: '0',
  notes: '',
};

type SrdWeaponItem = { index: string; name: string };

type AddModalProps = {
  visible: boolean;
  characterId: string;
  colors: ReturnType<typeof useThemeColors>;
  onClose: () => void;
  onAdded: (weapon: CharacterWeapon) => void;
};

function AddWeaponModal({ visible, characterId, colors, onClose, onAdded }: AddModalProps) {
  const [mode, setMode] = useState<'choose' | 'browse' | 'manual'>('choose');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [srdItems, setSrdItems] = useState<SrdWeaponItem[]>([]);
  const [srdLoading, setSrdLoading] = useState(false);
  const [srdSearch, setSrdSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<string[]>([]);

  // Load SRD weapon list when browse mode opens
  useEffect(() => {
    if (mode !== 'browse') {
      return;
    }
    setSrdLoading(true);
    dnd5eApiProvider
      .listEquipment()
      .then((items) => {
        // We don't know category from list, show all and let user pick
        setSrdItems(items);
      })
      .catch(() => setSrdItems([]))
      .finally(() => setSrdLoading(false));
  }, [mode]);

  const handleSrdSelect = useCallback(async (item: SrdWeaponItem) => {
    setSrdLoading(true);
    setError(null);
    try {
      const detail = await dnd5eApiProvider.getEquipmentItem(item.index);
      const isWeapon = detail.equipment_category.index === 'weapon';
      setForm({
        name: detail.name,
        damageDice: detail.damage?.damage_dice ?? '1d4',
        damageType: detail.damage?.damage_type.index ?? 'slashing',
        attackAbility: 'STR',
        isProficient: true,
        magicBonus: '0',
        notes: isWeapon ? '' : '(not a weapon — adjust manually)',
      });
      setProperties((detail.properties ?? []).map((p) => p.name));
      setMode('manual');
    } catch {
      setError('Could not load weapon details. Check your connection.');
    } finally {
      setSrdLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Weapon name is required.');
      return;
    }
    if (!form.damageDice.trim()) {
      setError('Damage dice is required (e.g. 1d8).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input: CreateCharacterWeaponInput = {
        characterId,
        name: form.name.trim(),
        damageDice: form.damageDice.trim(),
        damageType: form.damageType.trim() || 'slashing',
        attackAbility: form.attackAbility,
        isProficient: form.isProficient,
        magicBonus: parseInt(form.magicBonus, 10) || 0,
        properties,
        notes: form.notes.trim(),
        source: 'manual',
        srdIndex: null,
      };
      const weapon = await weaponRepository.addWeapon(input);
      onAdded(weapon);
      setForm(DEFAULT_FORM);
      setProperties([]);
      setMode('choose');
    } catch {
      setError('Failed to save weapon.');
    } finally {
      setSaving(false);
    }
  }, [form, characterId, properties, onAdded]);

  const handleClose = useCallback(() => {
    setForm(DEFAULT_FORM);
    setProperties([]);
    setMode('choose');
    setError(null);
    onClose();
  }, [onClose]);

  const filteredSrd = srdItems.filter((i) =>
    i.name.toLowerCase().includes(srdSearch.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors['background.elevated'] }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors['border.default'] }]}>
            <TouchableOpacity onPress={mode === 'choose' ? handleClose : () => setMode('choose')} accessibilityLabel="Back">
              <Ionicons name={mode === 'choose' ? 'close' : 'arrow-back'} size={22} color={colors['text.secondary']} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors['text.primary'] }]}>
              {mode === 'choose' ? 'Add Weapon' : mode === 'browse' ? 'Browse SRD' : 'Weapon Details'}
            </Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Choose mode */}
          {mode === 'choose' && (
            <View style={styles.chooseContainer}>
              <TouchableOpacity
                style={[styles.chooseBtn, { backgroundColor: colors['surface.default'], borderColor: colors['border.accent'] }]}
                onPress={() => setMode('browse')}
              >
                <Ionicons name="search" size={28} color={colors['accent.primary']} />
                <Text style={[styles.chooseBtnTitle, { color: colors['text.primary'] }]}>Browse SRD</Text>
                <Text style={[styles.chooseBtnSub, { color: colors['text.secondary'] }]}>Search the D&D 5e compendium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chooseBtn, { backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
                onPress={() => { setForm(DEFAULT_FORM); setProperties([]); setMode('manual'); }}
              >
                <Ionicons name="create-outline" size={28} color={colors['text.secondary']} />
                <Text style={[styles.chooseBtnTitle, { color: colors['text.primary'] }]}>Add Manually</Text>
                <Text style={[styles.chooseBtnSub, { color: colors['text.secondary'] }]}>Enter weapon stats yourself</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Browse SRD */}
          {mode === 'browse' && (
            <View style={{ flex: 1 }}>
              <View style={[styles.searchBar, { backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}>
                <Ionicons name="search" size={16} color={colors['text.muted']} />
                <TextInput
                  style={[styles.searchInput, { color: colors['text.primary'] }]}
                  placeholder="Search equipment..."
                  placeholderTextColor={colors['text.muted']}
                  value={srdSearch}
                  onChangeText={setSrdSearch}
                  autoFocus
                />
              </View>
              {srdLoading ? (
                <ActivityIndicator color={colors['accent.primary']} style={{ marginTop: Spacing[8] }} />
              ) : (
                <FlatList
                  data={filteredSrd}
                  keyExtractor={(i) => i.index}
                  contentContainerStyle={{ padding: Spacing[4] }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.srdItem, { borderBottomColor: colors['border.default'] }]}
                      onPress={() => void handleSrdSelect(item)}
                    >
                      <Text style={[styles.srdItemName, { color: colors['text.primary'] }]}>{item.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors['text.muted']} />
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}

          {/* Manual form */}
          {mode === 'manual' && (
            <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
              {error && (
                <Text style={[styles.formError, { color: colors['accent.critical'] }]}>{error}</Text>
              )}
              <Field label="Name *" colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors['text.primary'], backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="e.g. Longsword"
                  placeholderTextColor={colors['text.muted']}
                />
              </Field>
              <Field label="Damage Dice *" colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors['text.primary'], backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
                  value={form.damageDice}
                  onChangeText={(v) => setForm((f) => ({ ...f, damageDice: v }))}
                  placeholder="e.g. 1d8"
                  placeholderTextColor={colors['text.muted']}
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Damage Type" colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors['text.primary'], backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
                  value={form.damageType}
                  onChangeText={(v) => setForm((f) => ({ ...f, damageType: v }))}
                  placeholder="slashing / piercing / bludgeoning"
                  placeholderTextColor={colors['text.muted']}
                  autoCapitalize="none"
                />
              </Field>
              <Field label="Attack Ability" colors={colors}>
                <View style={styles.toggle}>
                  {(['STR', 'DEX'] as const).map((ab) => (
                    <TouchableOpacity
                      key={ab}
                      style={[
                        styles.toggleBtn,
                        {
                          backgroundColor: form.attackAbility === ab ? colors['accent.primary'] : colors['surface.default'],
                          borderColor: form.attackAbility === ab ? colors['accent.primary'] : colors['border.default'],
                        },
                      ]}
                      onPress={() => setForm((f) => ({ ...f, attackAbility: ab }))}
                    >
                      <Text style={{ color: form.attackAbility === ab ? '#1A1510' : colors['text.secondary'], fontWeight: '600' }}>{ab}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
              <Field label="Proficient" colors={colors}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: form.isProficient ? colors['accent.primary'] : colors['surface.default'],
                      borderColor: form.isProficient ? colors['accent.primary'] : colors['border.default'],
                    },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, isProficient: !f.isProficient }))}
                >
                  <Text style={{ color: form.isProficient ? '#1A1510' : colors['text.secondary'], fontWeight: '600' }}>
                    {form.isProficient ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </Field>
              <Field label="Magic Bonus (+1, +2, +3…)" colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors['text.primary'], backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
                  value={form.magicBonus}
                  onChangeText={(v) => setForm((f) => ({ ...f, magicBonus: v }))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors['text.muted']}
                />
              </Field>
              <Field label="Notes" colors={colors}>
                <TextInput
                  style={[styles.input, styles.inputMulti, { color: colors['text.primary'], backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
                  value={form.notes}
                  onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                  placeholder="Optional notes"
                  placeholderTextColor={colors['text.muted']}
                  multiline
                  numberOfLines={2}
                />
              </Field>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors['accent.primary'], opacity: saving ? 0.6 : 1 }]}
                onPress={() => void handleSave()}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Add Weapon'}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors['text.secondary'] }]}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WeaponsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [character, setCharacter] = useState<Character | null>(null);
  const [weapons, setWeapons] = useState<CharacterWeapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    Promise.all([characterRepository.getCharacterById(id), weaponRepository.getWeapons(id)])
      .then(([char, weps]) => {
        setCharacter(char);
        setWeapons(weps);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load weapons');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = useCallback(
    (weaponId: string) => {
      weaponRepository.deleteWeapon(weaponId).then(() => {
        setWeapons((prev) => prev.filter((w) => w.id !== weaponId));
      }).catch(() => {
        Alert.alert('Error', 'Failed to delete weapon.');
      });
    },
    [],
  );

  if (loading) {
    return <LoadingState />;
  }
  if (error || !character) {
    return <ErrorState message={error ?? 'Character not found'} onRetry={() => router.back()} />;
  }

  const prof = proficiencyBonus(character.level);

  return (
    <View style={{ flex: 1, backgroundColor: colors['background.primary'] }}>
      <AppHeader
        title="Weapons"
        subtitle={`Prof +${prof}`}
        leftAction={{ label: 'Back', onPress: () => router.back() }}
        rightAction={{ label: 'Add', onPress: () => setModalVisible(true) }}
      />

      {weapons.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="shield-outline" size={48} color={colors['text.muted']} />
          <Text style={[styles.emptyText, { color: colors['text.secondary'] }]}>No weapons yet.</Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors['accent.primary'] }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.emptyBtnText}>Add Weapon</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={weapons}
          keyExtractor={(w) => w.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WeaponRow weapon={item} character={character} colors={colors} onDelete={handleDelete} />
          )}
        />
      )}

      <AddWeaponModal
        visible={modalVisible}
        characterId={id ?? ''}
        colors={colors}
        onClose={() => setModalVisible(false)}
        onAdded={(w) => {
          setWeapons((prev) => [...prev, w]);
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing[4], gap: Spacing[3] },
  weaponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing[2],
  },
  weaponInfo: { flex: 1, gap: Spacing[2] },
  weaponName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  weaponStats: { flexDirection: 'row', gap: Spacing[2] },
  statChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: Radius.md,
    alignItems: 'center',
    minWidth: 52,
  },
  statLabel: { fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.5 },
  statValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  properties: { fontSize: FontSize.xs },
  deleteBtn: { padding: Spacing[2] },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[3] },
  emptyText: { fontSize: FontSize.md },
  emptyBtn: { paddingHorizontal: Spacing[6], paddingVertical: Spacing[3], borderRadius: Radius.lg },
  emptyBtnText: { color: '#1A1510', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { maxHeight: '90%', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  chooseContainer: { padding: Spacing[4], gap: Spacing[4] },
  chooseBtn: {
    padding: Spacing[6],
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  chooseBtnTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  chooseBtnSub: { fontSize: FontSize.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing[4],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing[2],
  },
  searchInput: { flex: 1, paddingVertical: Spacing[3], fontSize: FontSize.sm },
  srdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  srdItemName: { fontSize: FontSize.sm },
  formContent: { padding: Spacing[4], gap: Spacing[4], paddingBottom: Spacing[10] },
  fieldRow: { gap: Spacing[1] },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: FontSize.sm,
  },
  inputMulti: { minHeight: 64, textAlignVertical: 'top' },
  toggle: { flexDirection: 'row', gap: Spacing[2] },
  toggleBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  formError: { fontSize: FontSize.sm, fontWeight: '600' },
  saveBtn: {
    paddingVertical: Spacing[4],
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  saveBtnText: { color: '#1A1510', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
