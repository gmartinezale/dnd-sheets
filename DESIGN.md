# DnD Character Sheet — Design System

## Principios visuales

1. **Legibilidad primero** — Durante el combate, los números deben leerse de un vistazo. Nunca sacrificar tamaño o contraste por estética.
2. **Economía de pantalla** — Mostrar lo esencial. Información secundaria bajo demanda (accordions, modales, tabs).
3. **Calidez aventurera** — Paleta orgánica inspirada en cuero, pergamino y bronce. Evitar tonos fríos o tecnológicos.
4. **Consistencia táctil** — Targets >= 44px. Jerarquía clara entre elementos interactivos y de solo lectura.
5. **Dark-first** — El modo oscuro es el primario (uso nocturno en sesiones). El modo claro debe funcionar igual de bien.

## Paleta de color

### Dark mode (primario)
| Token | Valor | Uso |
|-------|-------|-----|
| `background.primary` | `#1A1510` | Fondo principal — negro cálido (cuero oscuro) |
| `background.secondary` | `#231E18` | Fondo de cards / secciones |
| `background.elevated` | `#2E2720` | Modales, bottom sheets |
| `surface.default` | `#332C24` | Superficie de inputs y rows |
| `surface.hover` | `#3E362C` | Estados activos/hover |
| `border.default` | `#4A3F33` | Bordes sutiles |
| `border.accent` | `#8B6B3D` | Bordes de énfasis (bronce) |
| `text.primary` | `#F2E8D9` | Texto principal — pergamino claro |
| `text.secondary` | `#A89880` | Texto secundario / labels |
| `text.muted` | `#231E18` | Placeholders / texto desactivado |
| `accent.primary` | `#C8922A` | Dorado — acción principal, CTA |
| `accent.secondary` | `#8B6B3D` | Bronce — secundario |
| `accent.critical` | `#C94040` | Rojo — daño, peligro, HP bajo |
| `accent.success` | `#4A8C5C` | Verde — éxito, heal |
| `accent.magic` | `#6B5EA8` | Púrpura oscuro — magia/conjuros |

### Light mode (secundario)
| Token | Valor | Uso |
|-------|-------|-----|
| `background.primary` | `#F5EDD9` | Fondo — pergamino |
| `background.secondary` | `#EDE0C4` | Cards / secciones |
| `background.elevated` | `#E8D9B8` | Modales |
| `surface.default` | `#DDD0B0` | Inputs |
| `border.default` | `#C4AA80` | Bordes |
| `text.primary` | `#1A1510` | Texto principal |
| `text.secondary` | `#5C4A32` | Texto secundario |
| `accent.primary` | `#8B5E0A` | Dorado oscuro |
| `accent.critical` | `#B03030` | Rojo |
| `accent.magic` | `#4A3A80` | Púrpura |

### Colores semánticos D&D
| Token | Valor | Uso |
|-------|-------|-----|
| `dnd.str` | `#C94040` | Fuerza |
| `dnd.dex` | `#4A8C5C` | Destreza |
| `dnd.con` | `#C8922A` | Constitución |
| `dnd.int` | `#4A7EA8` | Inteligencia |
| `dnd.wis` | `#8B6B3D` | Sabiduría |
| `dnd.cha` | `#8B4A8B` | Carisma |

## Tipografía

| Rol | Familia | Peso | Tamaño | Uso |
|-----|---------|------|--------|-----|
| Display | `MedievalSharp` (google fonts) / fallback `serif` | Bold | 28–36 | Títulos de sección, nombre de personaje |
| Heading | `Cinzel` / fallback `serif` | SemiBold | 18–24 | Encabezados de tab, nombres de habilidades |
| Body | `Inter` / `System` | Regular/Medium | 14–16 | Texto corriente, descripciones |
| Stat | `Inter` | Bold | 24–32 | Números de stats (AC, HP, iniciativa) |
| Caption | `Inter` | Regular | 12 | Labels de modificadores, subtítulos |
| Code/Rules | `Inter Mono` | Regular | 13 | Texto de reglas mecánicas |

### Escala tipográfica
```
xs:   10px
sm:   12px
base: 14px
md:   16px
lg:   18px
xl:   24px
2xl:  28px
3xl:  36px
```

## Espaciado

Escala en múltiplos de 4px:
```
spacing.1  =  4px   (micro: separación interna)
spacing.2  =  8px   (small: gap entre elementos relacionados)
spacing.3  = 12px   (entre sub-elementos)
spacing.4  = 16px   (base: padding horizontal de pantalla)
spacing.5  = 20px
spacing.6  = 24px   (entre secciones)
spacing.8  = 32px   (entre secciones grandes)
spacing.10 = 40px   (cabeceras)
spacing.12 = 48px   (hero sections)
```

### Radio de bordes
```
radius.sm  =  4px
radius.md  =  8px
radius.lg  = 12px
radius.xl  = 16px
radius.full = 9999px (pills/badges)
```

## Componentes base

### PrimaryButton
- Background: `accent.primary`
- Altura mínima: 52px
- Texto: Bold 16px, `text.primary` (sobre dorado)
- Border radius: `radius.lg`
- Estados: default / pressed (0.85 opacidad) / disabled (0.4 opacidad)

### StatCard
- Background: `background.secondary`
- Border: 1px `border.accent` sutil
- Número grande: Bold 28px `text.primary`
- Label: Caption 12px `text.secondary`
- Mínimo tappable: 80x80px

### AbilityScoreCard
- Muestra: nombre abreviado + valor + modificador
- Color de borde según atributo (dnd.str, dnd.dex, etc.)
- Modificador: destacado con fondo semi-opaco

### SkillRow
- Altura: 44px mínimo
- Proficiencia: dot indicator (vacío / half / full)
- Bonus calculado: derecha, negrita
- Atributo base: caption a la derecha del nombre

### ResourceCounter
- Para HP, spell slots, sorcery points, etc.
- Controles táctiles grandes: +/- con feedback háptico
- Valor actual / máximo visible

### AppScreen
- SafeAreaView + ScrollView base
- Padding horizontal: `spacing.4`
- Fondo: `background.primary`

## Reglas de accesibilidad mobile

1. Todos los touch targets >= 44x44px.
2. Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande (WCAG AA).
3. `accessibilityLabel` en todos los botones de icono.
4. No depender solo del color para comunicar estado (ej: añadir icono además del color de HP).
5. Soporte `accessibilityRole` correcto: button, header, text, adjustable.
6. Compatibilidad con Dynamic Type en iOS (no bloquear tamaños de fuente del sistema).
7. Reducir animaciones si `prefersReducedMotion` está activo.
8. Textos editables con `accessibilityHint` que explica qué campo es.
9. Fondo de pantalla nunca blanco puro ni negro puro — reduce fatiga visual.
10. Modo oscuro: priorizado y probado primero.

## Pantallas y jerarquía visual

### Lista de personajes
- Énfasis en nombre + clase + nivel + raza
- HP compacto visible en la card
- FAB para crear nuevo personaje

### Crear personaje
- Wizard multi-paso: nombre → raza → clase → atributos → resumen
- Un campo a la vez o sección compacta por paso

### Detalle de personaje
- Header: nombre, clase, nivel, HP grande, AC, iniciativa
- Tabs: Atributos / Habilidades / Combate / Equipo / Conjuros / Recursos
- Tabs con iconos + label corto

### Atributos
- Grid 2x3 de AbilityScoreCards
- Modificador prominente, valor base debajo
- Saving throws en lista debajo

### Habilidades y Saving Throws
- Lista scrollable con SkillRow
- Grouped por atributo o lista plana con filtro
- Proficiencia visible claramente

### Combate
- HP grande con controles +/- táctiles
- AC, iniciativa, velocidad en row
- Lista de ataques con bonus de ataque y dado de daño

### Equipo
- Lista con EquipmentRow (nombre, peso, cantidad, tipo)
- Acción rápida equipar/desequipar armas/armaduras

### Conjuros
- Agrupado por nivel de conjuro
- Spell slots como píldoras (activo/gastado)
- SpellCard con nombre, nivel, componentes, descripción

### Recursos de clase
- ResourceCounter por recurso (HP, spell slots, sorcery points, ki, hit dice)
- Long rest / short rest buttons que resetean los correctos
