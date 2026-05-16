import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppHeader } from '@/shared/components/AppHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { StatCard } from '@/shared/components/StatCard';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';
import { formatHP, formatModifier } from '@/core/utils/formatters';
import { characterRepository } from '@/data/db/repositories/character.repository';
import { weaponRepository } from '@/data/db/repositories/weapon.repository';
import { spellRepository } from '@/data/db/repositories/compendium.repository';
import type { CharacterWeapon } from '@/domain/dnd/types/equipment';
import type { CharacterSpell } from '@/domain/dnd/types/spells';
import {
  abilityModifier,
  proficiencyBonus,
  spellSaveDC,
  spellAttackBonus,
  CLASS_SPELLCASTING_ABILITY,
} from '@/domain/dnd';
import type { Character } from '@/domain/dnd/types/character';

const TABS = ['Info', 'Combat', 'Abilities'] as const;
type TabName = (typeof TABS)[number];

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [character, setCharacter] = useState<Character | null>(null);
  const [weapons, setWeapons] = useState<CharacterWeapon[]>([]);
  const [combatSpells, setCombatSpells] = useState<CharacterSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Info');

  // Reload on focus so edits from sub-screens are reflected
  useFocusEffect(
    useCallback(() => {
      if (!id) {
        return;
      }
      Promise.all([
        characterRepository.getCharacterById(id),
        weaponRepository.getWeapons(id),
        spellRepository.getCharacterSpells(id),
      ])
        .then(([char, w, s]) => {
          setCharacter(char);
          setWeapons(w);
          setCombatSpells(s);
          setLoading(false);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Failed to load character');
          setLoading(false);
        });
    }, [id]),
  );

  if (loading) {
    return <LoadingState />;
  }
  if (error || !character) {
    return <ErrorState message={error ?? 'Character not found'} onRetry={() => router.back()} />;
  }

  const prof = proficiencyBonus(character.level);
  const totalLevel = character.level + (character.extraClasses ?? []).reduce((s, ec) => s + ec.level, 0);
  const initiative = character.initiativeBonus ?? abilityModifier(character.abilityScores.DEX);
  const ac = character.armorClass ?? (10 + abilityModifier(character.abilityScores.DEX));

  // Build subtitle: class + multiclass info + race
  const classLabel = character.extraClasses && character.extraClasses.length > 0
    ? `${character.characterClass} ${character.level} / ${character.extraClasses.map((ec) => `${ec.characterClass} ${ec.level}`).join(' / ')}`
    : `${character.characterClass} ${character.level}`;

  return (
    <View style={[{ flex: 1, backgroundColor: colors['background.primary'] }]}>
      <AppHeader
        title={character.name}
        subtitle={`${classLabel} · ${character.race} · Lv ${totalLevel}`}
        leftAction={{ label: 'Back', onPress: () => router.navigate('/(tabs)/characters') }}
      />

      {/* Character hero stats */}
      <View style={[styles.hero, { backgroundColor: colors['background.secondary'], borderBottomColor: colors['border.default'] }]}>
        <StatCard
          value={formatHP(character.currentHitPoints, character.maxHitPoints)}
          label="HP"
          accent={
            character.currentHitPoints / character.maxHitPoints > 0.5
              ? colors['accent.success']
              : colors['accent.critical']
          }
          style={styles.heroCard}
        />
        <StatCard value={ac} label="AC" style={styles.heroCard} />
        <StatCard value={formatModifier(initiative)} label="Initiative" style={styles.heroCard} />
        <StatCard value={`+${prof}`} label="Prof." style={styles.heroCard} />
        <StatCard value={character.speed} label="Speed" style={styles.heroCard} />
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: colors['background.secondary'], borderBottomColor: colors['border.default'] }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors['accent.primary'], borderBottomWidth: 2 },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            accessibilityLabel={tab}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors['accent.primary'] : colors['text.muted'] },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Info' && <InfoTab character={character} colors={colors} />}
        {activeTab === 'Combat' && <CombatTab character={character} weapons={weapons} spells={combatSpells} colors={colors} />}
        {activeTab === 'Abilities' && <AbilitiesTab character={character} colors={colors} />}
      </ScrollView>

      {/* Quick navigation row */}
      <View style={[styles.quickNav, { backgroundColor: colors['background.secondary'], borderTopColor: colors['border.default'] }]}>
        {[
          { label: 'Skills', icon: 'list', pathname: '/(tabs)/characters/[id]/skills' },
          { label: 'Combat', icon: 'flash', pathname: '/(tabs)/characters/[id]/combat' },
          { label: 'Weapons', icon: 'hammer', pathname: '/(tabs)/characters/[id]/weapons' },
          { label: 'Spells', icon: 'sparkles', pathname: '/(tabs)/characters/[id]/spells' },
          { label: 'Resources', icon: 'battery-half', pathname: '/(tabs)/characters/[id]/resources' },
        ].map(({ label, icon, pathname }) => (
          <TouchableOpacity
            key={label}
            onPress={() => router.push({ pathname, params: { id: id ?? '' } } as Parameters<typeof router.push>[0])}
            style={styles.quickNavBtn}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Ionicons name={icon as 'list'} size={20} color={colors['text.muted']} />
            <Text style={[styles.quickNavLabel, { color: colors['text.muted'] }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function InfoTab({ character, colors }: { character: Character; colors: ReturnType<typeof useThemeColors> }) {
  const fields = [
    { label: 'Background', value: character.background || '—' },
    { label: 'Alignment', value: character.alignment ?? '—' },
    { label: 'Experience', value: `${character.experiencePoints} XP` },
    { label: 'Notes', value: character.notes || '—' },
  ];
  return (
    <View style={{ gap: Spacing[1] }}>
      {fields.map(({ label, value }) => (
        <View key={label} style={[styles.infoRow, { borderBottomColor: colors['border.default'] }]}>
          <Text style={[styles.infoLabel, { color: colors['text.secondary'] }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: colors['text.primary'] }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function CombatTab({
  character,
  weapons,
  spells,
  colors,
}: {
  character: Character;
  weapons: CharacterWeapon[];
  spells: CharacterSpell[];
  colors: ReturnType<typeof useThemeColors>;
}) {
  const spellAbility = character.spellcastingAbility ?? CLASS_SPELLCASTING_ABILITY[character.characterClass] ?? null;
  const hasSpells = spellAbility !== null;
  const saveDC = hasSpells
    ? spellSaveDC({
        spellcastingAbility: spellAbility ?? 'INT',
        abilityScores: character.abilityScores,
        characterLevel: character.level,
      })
    : null;
  const spellAtk = hasSpells
    ? spellAttackBonus({
        spellcastingAbility: spellAbility ?? 'INT',
        abilityScores: character.abilityScores,
        characterLevel: character.level,
      })
    : null;

  const prof = proficiencyBonus(character.level);

  // Group spells by level: cantrips first, then 1-9
  const spellsByLevel = spells.reduce<Record<number, CharacterSpell[]>>((acc, s) => {
    if (!acc[s.spellLevel]) { acc[s.spellLevel] = []; }
    acc[s.spellLevel].push(s);
    return acc;
  }, {});
  const spellLevels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);

  return (
    <View style={{ gap: Spacing[4] }}>
      {/* Spellcasting stats */}
      <View style={{ gap: Spacing[2] }}>
        <Text style={[TextStyles.label, { color: colors['text.secondary'] }]}>Spellcasting</Text>
        {hasSpells ? (
          <View style={styles.statRow}>
            <StatCard value={saveDC ?? '—'} label="Save DC" style={{ flex: 1 }} />
            <StatCard value={spellAtk !== null ? formatModifier(spellAtk) : '—'} label="Spell Atk" style={{ flex: 1 }} />
            <StatCard value={spellAbility ?? '—'} label="Ability" style={{ flex: 1 }} />
          </View>
        ) : (
          <Text style={[styles.infoValue, { color: colors['text.muted'] }]}>
            This character does not cast spells.
          </Text>
        )}
      </View>

      {/* Weapons */}
      <View style={{ gap: Spacing[2] }}>
        <Text style={[TextStyles.label, { color: colors['text.secondary'] }]}>Weapons</Text>
        {weapons.length === 0 ? (
          <Text style={[styles.infoValue, { color: colors['text.muted'] }]}>No weapons added.</Text>
        ) : (
          weapons.map((w) => {
            const mod = abilityModifier(character.abilityScores[w.attackAbility]);
            const atkBonus = mod + (w.isProficient ? prof : 0) + w.magicBonus;
            const dmgMod = mod + w.magicBonus;
            const dmgDisplay = dmgMod === 0 ? w.damageDice : `${w.damageDice}${formatModifier(dmgMod)}`;
            return (
              <View
                key={w.id}
                style={[
                  styles.combatRow,
                  { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.combatRowName, { color: colors['text.primary'] }]}>{w.name}</Text>
                  <Text style={[styles.combatRowSub, { color: colors['text.secondary'] }]}>
                    {w.attackAbility} · {w.damageType}
                  </Text>
                </View>
                <View style={styles.combatRowStats}>
                  <View style={styles.combatRowStat}>
                    <Text style={[styles.combatStatVal, { color: colors['accent.primary'] }]}>{formatModifier(atkBonus)}</Text>
                    <Text style={[styles.combatStatLbl, { color: colors['text.muted'] }]}>ATK</Text>
                  </View>
                  <View style={styles.combatRowStat}>
                    <Text style={[styles.combatStatVal, { color: colors['text.primary'] }]}>{dmgDisplay}</Text>
                    <Text style={[styles.combatStatLbl, { color: colors['text.muted'] }]}>DMG</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Spells list */}
      {spells.length > 0 && (
        <View style={{ gap: Spacing[2] }}>
          <Text style={[TextStyles.label, { color: colors['text.secondary'] }]}>Spells</Text>
          {spellLevels.map((lvl) => (
            <View key={lvl} style={{ gap: Spacing[1] }}>
              <Text style={[styles.spellLevelHeader, { color: colors['text.muted'] }]}>
                {lvl === 0 ? 'Cantrips' : `Level ${lvl}`}
              </Text>
              {spellsByLevel[lvl].map((s) => (
                <View
                  key={s.id}
                  style={[
                    styles.combatRow,
                    { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.combatRowName, { color: colors['text.primary'] }]}>{s.spellName}</Text>
                  </View>
                  {(s.prepared || s.alwaysPrepared) && (
                    <View style={[styles.preparedBadge, { backgroundColor: colors['accent.primary'] + '33' }]}>
                      <Text style={[styles.preparedBadgeText, { color: colors['accent.primary'] }]}>Prepared</Text>
                    </View>
                  )}
                  {spellAtk !== null && lvl === 0 && (
                    <View style={styles.combatRowStat}>
                      <Text style={[styles.combatStatVal, { color: colors['accent.primary'] }]}>{formatModifier(spellAtk)}</Text>
                      <Text style={[styles.combatStatLbl, { color: colors['text.muted'] }]}>ATK</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function AbilitiesTab({ character, colors }: { character: Character; colors: ReturnType<typeof useThemeColors> }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const abilityColorMap: Record<string, string> = {
    STR: colors['dnd.str'],
    DEX: colors['dnd.dex'],
    CON: colors['dnd.con'],
    INT: colors['dnd.int'],
    WIS: colors['dnd.wis'],
    CHA: colors['dnd.cha'],
  };

  return (
    <View style={{ gap: Spacing[3] }}>
      <View style={styles.abilitiesGrid}>
        {(Object.entries(character.abilityScores) as [string, number][]).map(([ability, score]) => {
          const mod = abilityModifier(score);
          const color = abilityColorMap[ability] ?? colors['accent.secondary'];
          return (
            <View
              key={ability}
              style={[styles.abilityCard, { backgroundColor: colors['background.secondary'], borderColor: color }]}
              accessible
              accessibilityLabel={`${ability}: ${score}, modifier ${formatModifier(mod)}`}
            >
              <Text style={[styles.abilityLabel, { color: colors['text.secondary'] }]}>{ability}</Text>
              <Text style={[styles.abilityScore, { color: colors['text.primary'] }]}>{score}</Text>
              <Text style={[styles.abilityMod, { color }]}>{formatModifier(mod)}</Text>
            </View>
          );
        })}
      </View>
      {/* Action buttons */}
      <View style={styles.abilityActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors['surface.default'], borderColor: colors['border.default'] }]}
          onPress={() => router.push({ pathname: '/(tabs)/characters/[id]/edit-abilities', params: { id: id ?? '' } })}
        >
          <Ionicons name="create-outline" size={16} color={colors['text.secondary']} />
          <Text style={[styles.actionBtnText, { color: colors['text.secondary'] }]}>Edit Abilities</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors['accent.primary'], borderColor: colors['accent.primary'] }]}
          onPress={() => router.push({ pathname: '/(tabs)/characters/[id]/level-up', params: { id: id ?? '' } })}
        >
          <Ionicons name="arrow-up-circle-outline" size={16} color="#1A1510" />
          <Text style={[styles.actionBtnText, { color: '#1A1510', fontWeight: FontWeight.bold }]}>Level Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  heroCard: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  tabContent: {
    padding: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: FontSize.base,
  },
  infoValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    maxWidth: '60%',
    textAlign: 'right',
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  abilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'center',
  },
  abilityCard: {
    width: 90,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  abilityLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  abilityScore: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  abilityMod: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  abilityActions: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  quickNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Spacing[2],
  },
  quickNavBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: 2,
  },
  quickNavLabel: {
    fontSize: 9,
    fontWeight: FontWeight.medium,
  },
  combatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
  combatRowName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  combatRowSub: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  combatRowStats: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  combatRowStat: {
    alignItems: 'center',
  },
  combatStatVal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  combatStatLbl: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  spellLevelHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: Spacing[1],
  },
  preparedBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  preparedBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
