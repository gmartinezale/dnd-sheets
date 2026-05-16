import { httpGet } from '../httpClient';
import {
  SpellDtoSchema,
  SpellListDtoSchema,
  GenericListDtoSchema,
  ClassDtoSchema,
  RaceDtoSchema,
  EquipmentListDtoSchema,
  EquipmentDetailDtoSchema,
} from '../dto/dnd5e.dto';
import type { EquipmentDetailDto } from '../dto/dnd5e.dto';
import type { SpellProvider, ClassProvider, RaceProvider, EquipmentProvider, RulesProvider } from './providers.interface';
import type { Spell, SpellSummary } from '@/domain/dnd/types/spells';
import type { DndClass, DndRace } from '@/domain/dnd/types/classes';
import { SRD_API_BASE_URL } from '@/core/constants/dnd.constants';

/**
 * D&D 5e API provider — https://www.dnd5eapi.co
 * All responses are validated with Zod before use.
 */
class Dnd5eApiProvider implements RulesProvider {
  private readonly baseUrl: string;

  constructor(baseUrl: string = SRD_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ─── Spells ──────────────────────────────────────────────────────────────

  async listSpells(filters: { level?: number; school?: string; classIndex?: string } = {}): Promise<SpellSummary[]> {
    let url = `${this.baseUrl}/spells`;
    const params: string[] = [];
    if (filters.level !== undefined) {
      params.push(`level=${filters.level}`);
    }
    if (filters.school) {
      params.push(`school=${filters.school}`);
    }
    if (filters.classIndex) {
      params.push(`classes=${filters.classIndex}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const raw = await httpGet<unknown>(url);
    const parsed = SpellListDtoSchema.parse(raw);

    return parsed.results.map((item) => ({
      index: item.index,
      name: item.name,
      url: item.url,
      // These fields are not available in list view — set defaults
      level: 0,
      school: { index: '', name: '' },
      castingTime: '',
      concentration: false,
      ritual: false,
    }));
  }

  async getSpell(index: string): Promise<Spell> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/spells/${index}`);
    const dto = SpellDtoSchema.parse(raw);

    return {
      index: dto.index,
      name: dto.name,
      level: dto.level,
      school: { index: dto.school.index, name: dto.school.name },
      castingTime: dto.casting_time,
      range: dto.range,
      duration: dto.duration,
      concentration: dto.concentration,
      ritual: dto.ritual,
      components: dto.components,
      material: dto.material,
      description: dto.desc,
      higherLevel: dto.higher_level,
      classes: dto.classes.map((c) => ({ index: c.index, name: c.name })),
      subclasses: (dto.subclasses ?? []).map((sc) => ({ index: sc.index, name: sc.name })),
      url: dto.url,
    };
  }

  async listMagicSchools(): Promise<Array<{ index: string; name: string }>> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/magic-schools`);
    const parsed = GenericListDtoSchema.parse(raw);
    return parsed.results.map((s) => ({ index: s.index, name: s.name }));
  }

  // ─── Classes ─────────────────────────────────────────────────────────────

  async listClasses(): Promise<Array<{ index: string; name: string }>> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/classes`);
    const parsed = GenericListDtoSchema.parse(raw);
    return parsed.results.map((c) => ({ index: c.index, name: c.name }));
  }

  async getClass(index: string): Promise<DndClass> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/classes/${index}`);
    const dto = ClassDtoSchema.parse(raw);

    return {
      index: dto.index,
      name: dto.name,
      hitDie: dto.hit_die,
      proficiencies: dto.proficiencies.map((p) => ({ index: p.index, name: p.name })),
      savingThrows: dto.saving_throws.map((s) => ({ index: s.index, name: s.name })),
      subclasses: dto.subclasses.map((sc) => ({ index: sc.index, name: sc.name })),
      spellcasting: dto.spellcasting
        ? {
            level: dto.spellcasting.level,
            spellcastingAbility: {
              index: dto.spellcasting.spellcasting_ability.index,
              name: dto.spellcasting.spellcasting_ability.name,
            },
          }
        : null,
      url: dto.url,
    };
  }

  // ─── Races ───────────────────────────────────────────────────────────────

  async listRaces(): Promise<Array<{ index: string; name: string }>> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/races`);
    const parsed = GenericListDtoSchema.parse(raw);
    return parsed.results.map((r) => ({ index: r.index, name: r.name }));
  }

  async getRace(index: string): Promise<DndRace> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/races/${index}`);
    const dto = RaceDtoSchema.parse(raw);

    return {
      index: dto.index,
      name: dto.name,
      speed: dto.speed,
      abilityBonuses: dto.ability_bonuses.map((ab) => ({
        abilityScore: { index: ab.ability_score.index, name: ab.ability_score.name },
        bonus: ab.bonus,
      })),
      size: dto.size,
      sizeDescription: dto.size_description,
      languages: dto.languages.map((l) => ({ index: l.index, name: l.name })),
      traits: (dto.traits ?? []).map((t) => ({ index: t.index, name: t.name })),
      subraces: (dto.subraces ?? []).map((sr) => ({ index: sr.index, name: sr.name })),
      url: dto.url,
    };
  }

  // ─── Equipment ───────────────────────────────────────────────────────────

  async listEquipment(): Promise<Array<{ index: string; name: string }>> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/equipment`);
    const parsed = EquipmentListDtoSchema.parse(raw);
    return parsed.results.map((e) => ({ index: e.index, name: e.name }));
  }

  async getEquipmentItem(index: string): Promise<EquipmentDetailDto> {
    const raw = await httpGet<unknown>(`${this.baseUrl}/equipment/${index}`);
    return EquipmentDetailDtoSchema.parse(raw);
  }
}

export const dnd5eApiProvider = new Dnd5eApiProvider();

// Re-export interface types for DI
export type { SpellProvider, ClassProvider, RaceProvider, EquipmentProvider, RulesProvider };
