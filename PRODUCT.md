# DnD Character Sheet — Product Definition

## App
Hoja de personaje de D&D 5e local-first para móvil iOS/Android. Permite crear, editar y consultar personajes completos de Dungeons & Dragons 5ª Edición de forma rápida y sin conexión, con catálogo SRD disponible online.

## Usuarios principales
- **Jugadores activos** que quieren acceder a su hoja de personaje durante una sesión de juego.
- **Dungeon Masters** que necesitan consultar rápidamente stats de NPCs o personajes propios.
- **Jugadores nuevos** que quieren aprender las mecánicas básicas de D&D 5e.

## Contexto de uso
- Móvil, principalmente una sola mano, durante sesiones de juego presenciales.
- Poca tolerancia a pantallas saturadas o lentas — la partida no puede esperar.
- Uso frecuente de secciones: HP, ataques, habilidades, conjuros.
- Ocasionalmente se consulta el catálogo SRD para recordar reglas o buscar conjuros.
- Luz variable: a veces en ambientes oscuros (dark mode obligatorio).

## Jobs to be done
1. Consultar modificadores de atributos y habilidades en segundos.
2. Rastrear HP, spell slots y recursos de clase durante el combate.
3. Crear un personaje nuevo rápidamente con los datos SRD.
4. Editar atributos tras subir de nivel.
5. Tener la hoja de conjuros siempre a mano con descripciones.

## Personalidad visual
- **Simple, clara, aventurera** — sin sobrecargar la pantalla.
- Inspirada en la estética de fantasía de mesa: pergamino, tinta, madera, bronce, piedra rúnica.
- Legible ante todo — texto de stats debe ser grande y con buen contraste.
- Cálida, no fría — los colores evocan taberna y campaña, no dashboard corporativo.

## Anti-referencias (qué evitar)
- Dashboards genéricos con exceso de cards y métricas.
- Gradientes morados/neón típicos de IA o crypto apps.
- Glassmorphism innecesario.
- UI "corporativa" con grids rígidos y tonos azul corporativo.
- D&D Beyond (para no infringir copyright visual).
- Pantallas saturadas con 20 elementos visibles a la vez.
- Animaciones que distraigan durante el juego.

## Flujo MVP
1. Lista de personajes → Crear personaje → Detalle del personaje
2. Desde el detalle: tabs Atributos / Habilidades / Combate / Equipo / Conjuros / Recursos
3. Catálogo SRD (conjuros, clases, razas, equipo) — solo lectura
4. Configuración básica (tema, idioma futuro)

## Futuro (post-MVP)
- Multiclase avanzada
- Dotes y trasfondos
- Condiciones de estado
- Objetos mágicos y homebrew
- Sincronización cloud opcional
- Integración oficial con APIs de terceros si disponible
