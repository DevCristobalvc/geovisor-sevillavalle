# Geovisor Ecopedagógico — Backlog Post-mortem v2
> Rama: `feature/rf-implementation` · Actualizado: 2026-04-25
> Prioridad: P0 = bloqueante · P1 = alta · P2 = media · P3 = baja

---

## ESTADO ACTUAL (post v2)

| Módulo | RF cubiertos | RF pendientes | Avance |
|--------|-------------|---------------|--------|
| Visualización (RF-01..06) | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06* | RF-06 (dark mode) | 90 % |
| Consulta (RF-07..11) | RF-07, RF-08, RF-09*, RF-11 | RF-09 (búsqueda features), RF-10 | 75 % |
| Pedagógico (RF-12..16) | RF-12, RF-13, RF-14, RF-16 | RF-15 | 80 % |
| Exportación / Compartir (RF-17..18) | RF-18 | RF-17 | 50 % |
| Accesibilidad / Offline (RF-19..21) | RF-19*, RF-20*, RF-21* | RF-20, RF-21 (completo) | 55 % |
| **TOTAL** | **~16 / 21** | **~5 / 21** | **~75 %** |

`*` = parcialmente implementado

---

## COMPLETADO EN v2 (referencia)

| ID | Descripción |
|----|-------------|
| DATA-01 | 16 archivos GeoJSON seed (actores, agua, biodiversidad, territorio) |
| DATA-02 | 23 fichas pedagógicas completas con galería, videos y vocabulario |
| FIX-01 | CircleMarker + pointToLayer para capas de puntos, hover effect |
| FIX-02 | Páginas `/privacidad` y `/creditos` + rutas en App.tsx |
| FIX-03 | Toggle de categoría completa con estado indeterminado |
| FIX-04 | Glosario con enlaces "Ver en visor →" por categoría |
| FEAT-01 | RecorridoHUD + FlyController, lectura de `?recorrido=id` |
| FEAT-02 | `useUrlSync` — lectura/escritura de `?lat&lng&zoom&base&layers` |
| FEAT-03 | `capasOpacidad` en estado + slider de opacidad por capa activa |
| FEAT-04 | Leyenda visual con swatches de color en LayerPanel |
| FEAT-05 | Geocoder Nominatim con debounce en Navbar |
| FEAT-07 | Botón ⊕ zoom a extensión por capa GeoJSON activa |
| FEAT-09 | Thumbnail de capa en popup de Leaflet con onerror fallback |
| A11Y | role=tablist/tab/tabpanel, aria-current, aria-hidden, aria-label |
| REVIEW | Footer usa `<Link>` (era `<a>`, causaba reload); gallery onerror; `?categoria=` expande LayerPanel; Rickroll en agua_cuencas reemplazado; 5 fichas sin contenido rellenadas |
| BUG-01 | 46 YouTube IDs verificados vía oEmbed y reemplazados en las 23 fichas (todos los originales eran inválidos) |
| BUG-02 | 63 URLs de Wikimedia Commons verificadas vía Commons API y reemplazadas (todas las originales eran archivos inexistentes) |

---

## FUNCIONALIDADES PENDIENTES

### [FEAT-06] Herramienta de medición (distancia y área)
**RF:** RF-10 | **Prioridad:** P2

No implementado. Requiere integración de Turf.js.

**Subtareas:**
- Botón "Medir" en MapToolbar
- Cursor crosshair, clic = vértice, doble clic = cerrar polígono
- Tooltip con resultado en km / ha
- Botón "Limpiar"

---

### [FEAT-08] Exportar vista como imagen PNG
**RF:** RF-17 | **Prioridad:** P2

No implementado. Requiere `leaflet-image` o `html2canvas`.

---

### [FEAT-10] Línea de tiempo (timeline slider)
**RF:** RF-15 | **Prioridad:** P3

No implementado. No hay datos históricos disponibles aún.

---

### [FEAT-11] Búsqueda de features dentro de capas GeoJSON
**RF:** RF-09 | **Prioridad:** P2

El geocoder busca lugares (Nominatim) pero no permite buscar dentro de los atributos de una capa activa (ej: "buscar vereda X").

---

## DISEÑO Y UX — PENDIENTES

### [UI-01] Animaciones página de inicio
**Prioridad:** P1

Fade-in escalonado, hero con imagen de Sevilla, cards con hover lift, sección "Cómo funciona" con 3 pasos. Respetar `prefers-reduced-motion`.

---

### [UI-02] Mejoras visuales del visor
**Prioridad:** P1

- **Iconos SVG** por categoría en LayerPanel (Heroicons: users, droplet, leaf, cloud, layers, map-pin)
- **Marker clustering** con `leaflet.markercluster` (ya instalado) para capas con muchos puntos
- **Escala gráfica**: `L.control.scale({ imperial: false })`
- **Toast de error** cuando una capa WMS falla al cargar
- **Capa seleccionada**: stroke blanco 3px en el elemento clickeado

---

### [UI-03] Navbar móvil con menú hamburguesa
**Prioridad:** P2

En pantallas < 768px los links del nav se cortan. Necesita menú desplegable hamburguesa.

---

### [UI-04] Bottom-sheet en móvil para paneles
**RF:** RNF-06 | **Prioridad:** P2

LayerPanel e InfoPanel como bottom-sheets con swipe en móvil, no paneles laterales que tapan el mapa.

---

### [UI-05] Botón de mapa base "Dark" en toolbar
**Prioridad:** P3

`MAPA_BASE_URLS.dark` existe pero no aparece como opción en `MapToolbar.tsx`. Agregar cuarta opción y ajustar paneles a tema oscuro cuando está activo.

---

## ACCESIBILIDAD — PENDIENTES

### [A11Y-02] Navegación por teclado completa
**RF:** RF-21 | **Prioridad:** P1

- Cerrar popup del mapa con `Escape`
- Cerrar InfoPanel con `Escape`
- Foco visible en todos los controles del LayerPanel
- Auditoría axe-core: 0 violaciones `keyboard`

---

## INFRAESTRUCTURA — PENDIENTES

### [INFRA-01] Pre-cache de tiles OSM zoom 10-14 para offline
**RF:** RF-19 | **Prioridad:** P1

Workbox solo cachea en runtime. Agregar estrategia de pre-cache de tiles para el bounding box de Sevilla en zoom 10-14.

---

### [INFRA-02] ESLint + Prettier + pre-commit hooks
**Prioridad:** P3

Instalar `husky` + `lint-staged`. El build tiene warnings menores de lint.

---

*Última actualización: 2026-04-25 — media fix: BUG-01 y BUG-02 resueltos*
