# Geovisor Ecopedagógico — Backlog UI v3
> Rama: `feature/ui-v3` · Actualizado: 2026-04-25
> Prioridad: P0 = bloqueante · P1 = alta · P2 = media · P3 = baja

---

## RAMA Y DEPENDENCIAS

Esta rama parte del commit `6320885` de `feature/rf-implementation` (v3 funcional completo).
**No mezclar con cambios de lógica/datos — solo UI, animaciones y diseño.**

---

## VISIÓN DE DISEÑO

**Filosofía:** estilo Apple — limpio, sobrio, tipografía bold, espacios generosos, animaciones
fluidas (fade + slide-up). Paleta monocromática con verde-bosque como único acento.
Sin emojis. Sin iconos coloridos. Solo SVG stroke.

**Animaciones:** fade-up al entrar en viewport (IntersectionObserver), stagger por índice,
contadores animados, hover con lift-shadow. Respetar `prefers-reduced-motion`.

---

## SPRINT UI-v3 — PENDIENTES

### [UI-HOME] Rediseño completo de la página de inicio
**Prioridad:** P1 · Archivos: `src/pages/Home.tsx`, `tailwind.config.js`, `src/index.css`

#### Secciones a implementar (en orden):

**1. Hero full-screen**
- Altura: 100vh (mínimo) con fondo oscuro (imagen de bosque andino con overlay verde-bosque/80)
- Headline: animación de reveal por palabras ("Explora / el territorio / de Sevilla")
- Subtítulo: fade-in con delay
- 2 CTAs: "Abrir visor" (filled verde-bosque) + "Ver recorridos" (outline blanco)
- Scroll indicator animado (chevron pulsante abajo)
- `prefers-reduced-motion`: animaciones off, estado final visible inmediato

**2. Stats strip**
- Fondo blanco, borde sutil top/bottom
- 4 métricas: 22 capas · 23 fichas pedagógicas · 6 categorías · 4 recorridos guiados
- Cada número: contador animado que sube de 0 al valor final cuando entra en viewport
- Etiqueta en gris claro bajo el número
- Separador vertical entre stats en desktop, grid 2×2 en móvil

**3. Carrusel de imágenes del territorio**
- Librería: `swiper/react` (ya instalada)
- 6 slides con imágenes verificadas de Wikimedia Commons:
  1. Vista de Salento, Quindío — Paisaje Cultural Cafetero
  2. Frailejones en el Páramo de Sumapaz
  3. Bosque andino colombiano (Antioquia)
  4. Río Cauca — Valle del Cauca
  5. Nevado del Tolima — pisos térmicos
  6. Cafetales en Colombia
- Cada slide: imagen full-width, altura 480px (60vh móvil), overlay gradiente abajo
- Caption con título e "© Wikimedia Commons CC-BY-SA" sobre overlay
- Autoplay: 4s, pausa en hover
- Paginación dots + flechas prev/next (minimalistas, sin fondo)
- Fade transition entre slides (no slide horizontal)
- `aria-label` en cada slide para accesibilidad

**4. Sección "Qué puedes hacer" (Capabilities)**
- Título: "Una herramienta para explorar, aprender y reflexionar"
- Subtítulo descriptivo del enfoque ecopedagógico
- 6 cards en grid (3×2 desktop, 2×3 tablet, 1×6 mobile)
- Cada card: icono SVG stroke (monochrome, 28px) + título bold + descripción corta
- Iconos (SVG inline, stroke-only):
  1. Layers — "Explora 22 capas geográficas interactivas"
  2. Map-pin — "Sigue 4 recorridos guiados temáticos"
  3. Book-open — "Consulta 23 fichas pedagógicas con multimedia"
  4. Ruler — "Mide distancias y calcula áreas"
  5. Download — "Exporta el mapa como imagen PNG"
  6. Search — "Busca dentro de las capas activas"
- Animación: fade-up staggered (delay 0, 80, 160, 240, 320, 400ms) al entrar viewport
- Hover: translateY(-4px) + shadow-md, transición 200ms

**5. Sección "El territorio"**
- 2 columnas en desktop (texto izquierda, stats/visual derecha)
- Texto izquierda:
  - H2: "Sevilla, Valle del Cauca"
  - Párrafo 1 (80 palabras): descripción geográfica, caficultura, ecosistemas, PCC UNESCO
  - Párrafo 2 (60 palabras): contexto de las transformaciones socioecosistémicas que estudia el geovisor
- Derecha: bloque con 3 datos destacados (área km², altitud, año declaratoria PCC)
- Animación: fade-in al scroll

**6. Sección "Enfoque ecopedagógico"**
- Fondo: verde-bosque texto blanco (rompe monotonía visual)
- Quote centrado: marco de Zimmermann (2005)
- Descripción del uso en aula (estudiantes 10-15 años, básica secundaria)
- CTA final: "Comenzar a explorar →"

**7. Categorías rediseñadas**
- Título: "Seis temáticas para explorar el territorio"
- Grid 3×2, cards más grandes, sin el círculo con inicial
- Cada card: barra de color izquierda (2px, color de categoría) + nombre bold + descripción
- Hover: borde izquierdo ancho a 4px + background muy sutil del color de categoría (5% opacity)
- Animación: fade-up staggered al scroll

**8. Footer mini dentro del Home**
- Fondo negro/oscuro, texto gris claro
- Créditos académicos + enlace a GeoCVC

---

### [UI-INFRA] Animaciones globales — infraestructura CSS/Tailwind
**Prioridad:** P1 · Archivos: `tailwind.config.js`, `src/index.css`

- Añadir keyframes en `tailwind.config.js`:
  - `fadeUp`: opacity 0→1 + translateY(24px→0), 0.55s ease-out
  - `fadeIn`: opacity 0→1, 0.4s ease-out
  - `countUp`: se maneja via JS (no CSS)
- Clase `.reveal` en `src/index.css`:
  ```css
  .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .reveal.visible { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
  ```
- Hook `useScrollReveal` en `src/hooks/useScrollReveal.ts` (IntersectionObserver, threshold 0.12)

---

### [UI-NAV] Navbar hamburguesa en móvil
**Prioridad:** P2 · Archivo: `src/components/Navbar.tsx`

- En pantallas < 768px: ocultar links del nav, mostrar botón hamburguesa (3 líneas SVG)
- Menú desplegable: slide-down animado, fondo verde-bosque, links verticales
- Cerrar con Escape o clic fuera
- El geocoder también colapsa en móvil (icono lupa → expande)

---

### [UI-VISOR] Mejoras visuales del visor
**Prioridad:** P2 · Archivos: `src/components/LayerPanel.tsx`, `src/components/MapViewer.tsx`

- **Iconos SVG por categoría** en LayerPanel en lugar del círculo de color (stroke monochrome):
  - actores: users / people
  - agua: droplet / water
  - biodiversidad: leaf
  - clima: cloud
  - suelos: layers
  - territorio: map
- **Escala gráfica**: `L.control.scale({ imperial: false })` en MapViewer
- **Marker clustering**: activar `leaflet.markercluster` para capas de puntos

---

### [UI-MOBILE] Bottom-sheet en móvil
**Prioridad:** P2 · Archivos: `src/pages/Visor.tsx`, `src/components/LayerPanel.tsx`, `src/components/InfoPanel.tsx`

- En < 768px: LayerPanel se convierte en bottom-sheet (altura 60vh, deslizable hacia arriba)
- En < 768px: InfoPanel se convierte en bottom-sheet lateral → bottom
- Swipe down para cerrar (touch events)

---

## COMPLETADO EN v2 + v3 (referencia)

| Sprint | ID | Descripción |
|--------|----|-------------|
| v2 | DATA-01/02 | 16 GeoJSON + 23 fichas pedagógicas verificadas |
| v2 | FEAT-01..09 | RecorridoHUD, URL sync, opacidad, geocoder, zoom extensión, etc. |
| v2 | BUG-01/02 | 46 YouTube IDs + 63 Wikimedia URLs verificados y reemplazados |
| v3 | A11Y-02 | Escape cierra popup/InfoPanel; focus-visible en todos los controles |
| v3 | FEAT-06 | Herramienta de medición con Turf.js |
| v3 | FEAT-08 | Exportar PNG vía html2canvas (lazy-loaded) |
| v3 | FEAT-11 | Búsqueda de features por atributos en capas activas |
| v3 | INFRA-01 | SW injectManifest + pre-cache tiles OSM zoom 10-14 |
| v3 | INFRA-02 | ESLint flat config + Prettier + Husky pre-commit |

---

## RF CUBIERTOS TRAS v3

| Módulo | Avance |
|--------|--------|
| Visualización RF-01..06 | 90% (dark mode pendiente como UI-05 → eliminado del backlog) |
| Consulta RF-07..11 | 100% |
| Pedagógico RF-12..16 | 80% (RF-15 timeline sin datos) |
| Exportación RF-17..18 | 100% |
| Accesibilidad RF-19..21 | 85% |
| **TOTAL** | **~93%** |

---

*Última actualización: 2026-04-25 — rama feature/ui-v3, sprint UI*
