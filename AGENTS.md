# DnD Sheets — Agent Context

> Guía de referencia rápida para agentes de IA. Lee esto antes de tocar cualquier archivo.
> Si añades una funcionalidad nueva, actualiza la sección correspondiente al final.

---

## Descripción del proyecto

App móvil iOS/Android de **hoja de personaje D&D 5e**. Local-first (SQLite), sin auth, sin backend propio. Usa la API pública de D&D 5e SRD para el compendio de referencia.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | React Native | 0.83.6 |
| Framework | Expo SDK | ~55.0.23 |
| Routing | expo-router | ~55.0.14 |
| Base de datos | expo-sqlite | ~55.0.15 |
| Estado servidor | TanStack Query | ^5.62.0 |
| Estado cliente | Zustand | ^5.0.0 |
| Validación | Zod | ^3.23.0 |
| Iconos | @expo/vector-icons (Ionicons) | ~15.1.1 |
| Animaciones | react-native-reanimated | ~4.2.1 |
| Language | TypeScript strict | — |

---

## Comandos del proyecto

```bash
# Siempre usar pnpm (npm falla con bug de arborist en este proyecto)
pnpm start              # Inicia el dev server de Expo
pnpm ios                # Corre en simulador iOS
pnpm android            # Corre en emulador Android
pnpm typecheck          # tsc --noEmit (debe dar 0 errores)
pnpm lint               # ESLint con --max-warnings 0 (debe dar 0 errores)
pnpm format             # Prettier en src/
pnpm test               # Jest
npx expo install <pkg>  # Para instalar paquetes de Expo (mantiene compatibilidad de versiones)
```

> **Regla crítica**: antes de terminar cualquier tarea, ejecutar `pnpm typecheck` y `pnpm lint`. Deben pasar con 0 errores.

---

## Estructura de directorios

```
src/
├── app/                        # Expo Router — file-based routing
│   ├── _layout.tsx             # Root layout: carga fonts (Ionicons), SplashScreen, AppProviders
│   ├── index.tsx               # Redirect a /(tabs)/characters
│   └── (tabs)/                 # Tab navigator (3 tabs)
│       ├── _layout.tsx         # Tab bar con Ionicons + theme
│       ├── characters/
│       │   ├── _layout.tsx     # Stack navigator para characters
│       │   ├── index.tsx       # Lista de personajes
│       │   ├── new.tsx         # Wizard multi-paso creación de personaje (5 pasos)
│       │   └── [id]/
│       │       ├── _layout.tsx # Stack navigator para detalle
│       │       ├── index.tsx   # Pantalla principal del personaje (Info/Combat/Abilities tabs + quick nav)
│       │       ├── combat.tsx  # HP counter + stats de combate + HPEditModal
│       │       ├── skills.tsx  # Lista de habilidades con proficiencias editables
│       │       ├── spells.tsx  # Conjuros agrupados por nivel + añadir desde SRD
│       │       ├── weapons.tsx # Armas con ATK/DMG + añadir desde SRD o manual
│       │       ├── equipment.tsx # Inventario
│       │       ├── resources.tsx # Recursos de clase (spell slots, etc.)
│       │       ├── edit-abilities.tsx # Editor de ability scores (6 stats)
│       │       └── level-up.tsx       # Subida de nivel + multiclase
│       ├── compendium/
│       │   ├── _layout.tsx     # Stack navigator para compendio
│       │   ├── index.tsx       # Grid de secciones SRD
│       │   ├── spells.tsx      # Búsqueda de conjuros SRD
│       │   ├── classes.tsx     # Clases SRD
│       │   ├── races.tsx       # Razas SRD
│       │   └── equipment.tsx   # Equipo SRD
│       └── settings/
│           ├── _layout.tsx     # Stack navigator para settings
│           └── index.tsx       # Color scheme, versión
│
├── domain/dnd/                 # Lógica de negocio D&D pura (sin framework)
│   ├── index.ts                # Exports: abilityModifier, proficiencyBonus, spellSaveDC, spellAttackBonus, maxHitPoints, CharacterWeapon, CLASS_SPELLCASTING_ABILITY
│   ├── types/
│   │   ├── character.ts        # CharacterSchema (Zod), Character, CharacterDraft, UpdateCharacterInput; incluye extraClasses
│   │   ├── abilities.ts        # AbilityScores, SavingThrowProficiencies
│   │   ├── classes.ts          # CLASS_HIT_DIE, CLASS_SAVING_THROWS, DND_CLASSES, DND_RACES
│   │   ├── equipment.ts        # InventoryItem, CharacterWeapon, CreateCharacterWeaponInput
│   │   ├── resources.ts        # ResourcePool, CreateResourcePoolInput, UpdateResourcePoolInput
│   │   └── spells.ts           # CharacterSpell, CreateSpellInput
│   ├── calculators/            # Funciones puras: abilityModifier, proficiencyBonus, etc.
│   └── rules/                  # Reglas SRD: hit points, spell DC, etc.
│
├── data/
│   ├── db/
│   │   ├── database.ts         # getDatabase() singleton, runMigrations()
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.ts  # Schema SQLite: characters, inventory, spells, resources
│   │   │   └── 002_weapons_multiclass.ts  # Tabla character_weapons + extra_classes_json en characters
│   │   └── repositories/
│   │       ├── character.repository.ts    # CRUD personajes
│   │       ├── compendium.repository.ts   # CRUD spells, inventory, resources, skill proficiencies
│   │       └── weapon.repository.ts       # CRUD character_weapons
│   └── api/
│       ├── httpClient.ts       # httpGet<T>() con timeout y AbortController
│       ├── dto/                # Tipos de respuesta de la API SRD
│       └── providers/          # Funciones que usan httpGet para cada endpoint SRD
│
├── features/
│   ├── characters/
│   │   ├── hooks/
│   │   │   └── useCharacterList.ts      # TanStack Query: lista de personajes
│   │   └── stores/
│   │       └── characterDraft.store.ts  # Zustand: estado del wizard de creación
│   └── compendium/
│       └── hooks/
│           ├── useSpellsQuery.ts
│           ├── useClassesQuery.ts
│           ├── useRacesQuery.ts
│           └── useEquipmentQuery.ts
│
├── shared/
│   ├── components/
│   │   ├── AppHeader.tsx        # Header con leftAction / rightAction opcionales
│   │   ├── AppScreen.tsx        # SafeAreaView wrapper con padding estándar
│   │   ├── StatCard.tsx         # Card de stat con valor, label y accent
│   │   ├── ResourceCounter.tsx  # Counter con +/− para HP/recursos. Props: label, current, maximum, onIncrement, onDecrement, color?, readOnly?
│   │   ├── SkillRow.tsx         # Fila de habilidad con proficiency
│   │   ├── AbilityScoreEditor.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
│   └── theme/
│       ├── colors.ts            # Colors.dark / Colors.light — tokens de color
│       ├── useThemeColors.ts    # Hook: retorna Colors[colorScheme]
│       ├── spacing.ts           # Spacing: { 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48 }; Radius: { sm, md, lg, xl, full }
│       └── typography.ts        # FontSize, FontWeight, TextStyles
│
├── core/
│   ├── constants/dnd.constants.ts  # ABILITY_NAMES, SKILL_NAMES, SKILL_ABILITY_MAP, Alignment, etc.
│   ├── errors/AppError.ts          # AppError con códigos: NOT_FOUND, VALIDATION_ERROR, DB_ERROR, NETWORK_ERROR
│   └── utils/
│       ├── formatters.ts           # formatHP, formatModifier, formatSpellLevel
│       └── assertNever.ts
│
└── providers/
    ├── AppProviders.tsx    # SafeAreaProvider > QueryProvider > SQLiteProvider
    ├── QueryProvider.tsx
    └── SQLiteProvider.tsx  # Corre runMigrations() al montar
```

---

## Patrones de navegación

**IMPORTANTE**: Cada carpeta de rutas necesita su propio `_layout.tsx` con un Stack. Sin él, expo-router registra cada archivo como un tab independiente (bug visible como íconos rotos y labels como "folder/index").

```
Tab: Characters  →  characters/_layout.tsx (Stack)
  ├── /characters              (index.tsx)
  ├── /characters/new          (new.tsx)
  └── /characters/[id]         ([id]/_layout.tsx → Stack)
        ├── /characters/[id]   (index.tsx — pantalla principal)
        ├── combat, skills, spells, equipment, resources

Tab: Compendium  →  compendium/_layout.tsx (Stack)
Tab: Settings    →  settings/_layout.tsx (Stack)
```

### Reglas de navegación

- Volver a la lista de personajes: `router.navigate('/(tabs)/characters')` (no `router.back()`)
- Volver a la pantalla del personaje desde sub-tabs: `router.back()` funciona gracias al Stack de `[id]/`
- Cancel en `new.tsx`: `router.canGoBack() ? router.back() : router.replace('/(tabs)/characters')`
- Después de crear personaje: `router.replace('/(tabs)/characters')`

---

## Base de datos SQLite

Archivo: `dnd_sheets.db`. Tablas creadas por `001_initial_schema.ts`:

| Tabla | Descripción |
|-------|-------------|
| `characters` | Personaje completo con ability scores, combat stats, spellcasting |
| `inventory_items` | Items de inventario ligados a `character_id` |
| `character_spells` | Conjuros conocidos/preparados por personaje |
| `resource_pools` | Recursos de clase (spell slots, Ki, etc.) |

- IDs: `TEXT` UUID generados con `expo-crypto` (`Crypto.randomUUID()`)
- Timestamps: `TEXT` ISO 8601
- `updated_at` es opcional en inputs — los repositorios usan `new Date().toISOString()` por defecto
- Todos los queries usan parámetros (`?`) para prevenir SQL injection

### Convenciones de campo importantes

- `ResourcePool`: campos `current` y `maximum` (NO `currentUses`/`maxUses`)
- `UpdateCharacterInput`: `Partial<Omit<Character, 'id' | 'createdAt'>>` — `updatedAt` es opcional

---

## Theming

```ts
// Uso correcto del sistema de colores
import { useThemeColors } from '@/shared/theme/useThemeColors';
const colors = useThemeColors();
// → colors['text.primary'], colors['accent.primary'], etc.

// Directamente por tema (fuera de componentes)
import { Colors } from '@/shared/theme/colors';
const colors = Colors['dark'];
```

**Contraste mínimo en dark mode:**
- `text.muted` (`#6B5E50`) NO usar para texto visible — ratio ~1.6:1
- `text.secondary` (`#A89880`) mínimo para texto secundario — ratio ~4:1
- `text.primary` (`#F2E8D9`) para texto principal

**Spacing**: usar `Spacing[4]` (= 16px), `Spacing[2]` (= 8px). NO usar `Spacing.md` o `Spacing.xs` (no existen).

---

## Fuentes e iconos

Los fonts de Ionicons se cargan en `src/app/_layout.tsx` con `Font.useFonts({ ...Ionicons.font })`. El SplashScreen se mantiene hasta que los fonts estén listos. **No se necesita cargar fonts adicionales** en otros layouts.

```tsx
// Uso de iconos — siempre Ionicons de @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="shield" size={24} color={colors['text.primary']} />
```

---

## API SRD externa

Base URL: `https://www.dnd5eapi.co/api`

Endpoints usados:
- `/spells?limit=500` — lista de conjuros
- `/classes` — clases
- `/races` — razas
- `/equipment?limit=500` — equipamiento

**Nota**: los endpoints de lista devuelven solo `{ index, name }`. Los campos detallados (`hit_die`, `speed`, `ability_bonuses`, etc.) solo están disponibles en endpoints individuales (`/classes/{index}`).

---

## Configuración del proyecto

```js
// babel.config.js — minimal
presets: ['babel-preset-expo'],
plugins: ['react-native-reanimated/plugin']
// NO usar babel-plugin-module-resolver (Metro maneja paths de tsconfig nativamente en Expo 55)
```

```json
// tsconfig.json — strict mode total
"strict": true, "noUnusedLocals": true, "noUnusedParameters": true,
"noImplicitReturns": true, "noFallthroughCasesInSwitch": true
// Path aliases: @/ → src/, @/domain/*, @/features/*, @/shared/*, @/data/*, @/core/*, @/providers/*
```

---

## Checklist antes de marcar una tarea como completa

- [ ] `pnpm typecheck` → 0 errores
- [ ] `pnpm lint` → 0 errores, 0 warnings
- [ ] Si se añade una ruta nueva: verificar que la carpeta tenga `_layout.tsx`
- [ ] Si se añade un componente reutilizable: documentarlo en la sección de componentes de este archivo
- [ ] Si se añade una funcionalidad nueva: actualizar la sección **Registro de funcionalidades** más abajo

---

## Registro de funcionalidades

> Cuando un agente implemente una funcionalidad nueva, debe añadir una entrada aquí con: nombre, descripción, archivos creados/modificados y decisiones técnicas relevantes.

### Creación de personaje (wizard multi-paso)
- **Archivos**: `src/app/(tabs)/characters/new.tsx`, `src/features/characters/stores/characterDraft.store.ts`
- **Pasos**: name → race → class → abilities → review (5 pasos)
- **Estado**: Zustand store `characterDraft.store.ts` — persiste durante la sesión, se resetea con `resetDraft()` tras crear
- **Clases disponibles**: `DND_CLASSES` en `src/domain/dnd/types/classes.ts`
- **Razas disponibles**: `DND_RACES` en `src/domain/dnd/types/classes.ts`

### Detalle de personaje
- **Archivos**: `src/app/(tabs)/characters/[id]/index.tsx`
- **Tabs internos**: Info / Combat / Abilities (renderizados en la misma pantalla, sin navegación)
- **Quick nav**: fila inferior con links a combat, skills, spells, equipment, resources (pantallas separadas)
- **Back**: usa `router.navigate('/(tabs)/characters')` para evitar problema de historial sucio

### Compendio SRD
- **Archivos**: `src/app/(tabs)/compendium/`, `src/features/compendium/hooks/`, `src/data/api/`
- **Datos**: solo lectura, TanStack Query con caché, requiere conexión
- **Limitación**: los listados SRD solo devuelven `{ index, name }` — no acceder a campos de detalle sin llamar al endpoint individual

### Armas del personaje
- **Archivos**: `src/app/(tabs)/characters/[id]/weapons.tsx`, `src/data/db/repositories/weapon.repository.ts`, `src/data/db/migrations/002_weapons_multiclass.ts`
- **Funcionalidad**: Lista de armas con bonus de ataque y daño. Añadir arma desde compendio SRD (browse con detalle) o formulario manual. Eliminar arma con swipe.
- **Tipos**: `CharacterWeapon`, `CreateCharacterWeaponInput` en `src/domain/dnd/types/equipment.ts`
- **DB**: tabla `character_weapons` creada en migración 002

### Subida de nivel con multiclase
- **Archivos**: `src/app/(tabs)/characters/[id]/level-up.tsx`
- **Funcionalidad**: Aumentar nivel principal o añadir clase adicional (multiclase). Input de aumento de HP. Auto-actualiza `spellcastingAbility` según la clase con `CLASS_SPELLCASTING_ABILITY`.
- **Tipos**: `extraClasses: Array<{ characterClass: string; level: number }>` en `Character` y `CreateCharacterInput`
- **DB**: columna `extra_classes_json TEXT NOT NULL DEFAULT '[]'` añadida a `characters` en migración 002

### Edición de ability scores
- **Archivos**: `src/app/(tabs)/characters/[id]/edit-abilities.tsx`
- **Funcionalidad**: Editar los 6 ability scores (STR/DEX/CON/INT/WIS/CHA) con steppers +/−. Preview del modificador en tiempo real. Guarda y recalcula stats derivados.
- **Acceso**: botón "Edit Abilities" en la tab Abilities de la pantalla principal del personaje

### Proficiencias de habilidades editables
- **Archivos**: `src/app/(tabs)/characters/[id]/skills.tsx`
- **Funcionalidad**: Modo edición (botón Edit en el header). Tap en skill cicla: None → Half → Full → Expertise. Guarda con `bulkSetSkillProficiencies(id, draft)` donde `draft` es `Partial<SkillProficiencies>` (objeto, NO array).
- **API importante**: `skillRepository.bulkSetSkillProficiencies(characterId, proficiencies: Partial<SkillProficiencies>)` toma un objeto, no un array.

### Añadir conjuros desde compendio SRD
- **Archivos**: `src/app/(tabs)/characters/[id]/spells.tsx`
- **Funcionalidad**: Modal para añadir conjuros con browse del compendio SRD (lista filtrable). Toggle "prepared" en conjuros existentes. Eliminar conjuro. Lista agrupada por nivel.

### Edición de HP en combate
- **Archivos**: `src/app/(tabs)/characters/[id]/combat.tsx`
- **Funcionalidad**: Modal `HPEditModal` para "Set HP" y "Set Max HP" inline. HP actual se clampea entre 0 y maxHP al editar.
