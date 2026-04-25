# Geovisor Ecopedagógico — Backlog de Tareas
> Contrastado con Documento de Requerimientos v2.0 · Abril 2026
> Prioridad: P0 = bloqueante · P1 = alta · P2 = media · P3 = baja

---

## ESTADO ACTUAL DEL PROYECTO

| Módulo | RF cubiertos | RF pendientes | Avance |
|--------|-------------|---------------|--------|
| Visualización (RF-01..06) | RF-01, RF-06, RF-11 | RF-02*, RF-03, RF-04, RF-05 | 50 % |
| Consulta (RF-07..11) | RF-07, RF-11 | RF-08, RF-09, RF-10 | 40 % |
| Pedagógico (RF-12..16) | RF-12*, RF-16* | RF-13*, RF-14*, RF-15 | 30 % |
| Exportación / Compartir (RF-17..18) | — | RF-17, RF-18 | 0 % |
| Accesibilidad / Offline (RF-19..21) | RF-19* | RF-20*, RF-21* | 20 % |
| **TOTAL** | **7 / 21** | **14 / 21** | **~33 %** |

`*` = parcialmente implementado

---

## BLOQUE 0 — DATOS FALTANTES (P0 — bloquea el 75 % del mapa)

### [DATA-01] Crear 12 archivos GeoJSON faltantes
**RF:** RF-07, RF-12 | **Prioridad:** P0

Archivos en `public/data/` que el config referencia pero no existen.
Deben tener geometría real o representativa de Sevilla, Valle del Cauca.

| Archivo | Tipo geometría | Fuente sugerida |
|---------|---------------|-----------------|
| `actores/actores_humedales.json` | Point | CVC / Alcaldía |
| `actores/actores_paramo.json` | Point | CVC / SENA |
| `actores/actores_bosque_andino.json` | Point | CVC / IGAC |
| `actores/actores_bosque_seco.json` | Point | Alcaldía Sevilla |
| `agua/humedales.json` | Polygon | MADS / RAMSAR / CVC |
| `agua/calidad_agua.json` | Point | CVC / IDEAM |
| `agua/monitoreo_subterraneo.json` | Point | CVC |
| `agua/predios_art111.json` | Polygon | CVC / Alcaldía |
| `biodiversidad/especies.json` | Point | SiB Colombia / GBIF |
| `biodiversidad/areas_protegidas.json` | Polygon | RUNAP / MADS |
| `territorio/resguardos.json` | Polygon | DANE / MinInterior |
| `territorio/pcc.json` | Polygon | MinCultura / FNCC |

**Criterio de aceptación:**
- Cada archivo tiene ≥ 1 feature con propiedades correctas según `atributosPopup` de la capa.
- Tamaño < 2 MB por archivo.
- TypeScript y build pasan sin errores.
- Al activar la capa en el visor, la geometría aparece sobre Sevilla.

---

### [DATA-02] Crear 17 fichas pedagógicas faltantes
**RF:** RF-12 | **Prioridad:** P0

Archivos en `public/fichas/` referenciados por `fichaId` en `layers.config.ts`.

| fichaId | Capa |
|---------|------|
| `actores_paramo` | Actores Páramo |
| `actores_bosque_andino` | Actores Bosque Andino |
| `actores_bosque_seco` | Actores Bosque Seco |
| `agua_red_hidrica` | Red Hídrica (WMS) |
| `agua_humedales` | Humedales |
| `agua_calidad` | Calidad del Agua |
| `agua_monitoreo_subterraneo` | Monitoreo Subterráneo |
| `agua_predios_art111` | Predios Art. 111 |
| `biodiversidad_cobertura` | Cobertura Uso Suelo 50K (WMS) |
| `biodiversidad_ecosistemas` | Ecosistemas y Fragmentación (WMS) |
| `biodiversidad_especies` | Registro de Especies |
| `biodiversidad_areas_protegidas` | Áreas Protegidas |
| `biodiversidad_zonificacion_forestal` | Zonificación Forestal (WMS) |
| `clima_isoyetas` | Isoyetas de Precipitación (WMS) |
| `clima_pisos_termicos` | Pisos Térmicos (WMS) |
| `territorio_division` | División Político-Administrativa |
| `territorio_resguardos` | Resguardos Indígenas |

**Criterio de aceptación:**
- Cada ficha tiene: `descripcion` ≥ 150 palabras, ≥ 3 `preguntas_reflexivas`, ≥ 3 `vocabulario`, `galeria` con ≥ 1 imagen CC-BY/BY-SA, `nivel_educativo`.
- Al hacer clic en "Ver ficha pedagógica" de cualquier capa, el panel derecho carga sin error 404.

---

## BLOQUE 1 — CORRECCIONES DE BUGS (P0-P1)

### [FIX-01] Renderizado de capas de puntos (CircleMarker)
**RF:** RF-07 | **Prioridad:** P0

`GeoJSONLayer` en [src/components/MapViewer.tsx](src/components/MapViewer.tsx) no implementa `pointToLayer`. Las capas de tipo Point (actores, estaciones, calidad agua, especies) usan el marcador por defecto de Leaflet en lugar de un `CircleMarker` estilizado con `radius` y colores de categoría.

**Criterio de aceptación:**
- Capas de tipo Point renderizan un `CircleMarker` con `radius` y `color` tomados de `layer.estilo`.
- El hover aumenta el radio en 2px.
- No aparece el ícono de pin por defecto de Leaflet.

---

### [FIX-02] Rutas `/privacidad` y `/creditos` inexistentes
**RF:** RNF-13 | **Prioridad:** P1

[src/components/Footer.tsx](src/components/Footer.tsx) enlaza a `/privacidad` y `/creditos` pero esas rutas no están definidas en [src/App.tsx](src/App.tsx).

**Criterio de aceptación:**
- Existe una página `Privacidad.tsx` básica con política de datos (Ley 1581/2012) enlazada desde el footer.
- Existe una página `Creditos.tsx` con atribuciones de fuentes de datos y autores.
- Ambas rutas definidas en `App.tsx`.

---

### [FIX-03] Toggle de categoría completa en LayerPanel
**RF:** RF-02 | **Prioridad:** P1

El documento especifica que el toggle de una categoría debe activar/desactivar **todas sus subcapas a la vez**. Actualmente el clic en la cabecera solo expande/colapsa el acordeón, sin efecto sobre las capas.

**Criterio de aceptación:**
- Un checkbox o switch en la cabecera de cada categoría activa/desactiva todas las subcapas de esa categoría en un solo clic.
- El estado del switch refleja si hay ≥1 subcapa activa en esa categoría.

---

### [FIX-04] Glosario sin enlace a fichas pedagógicas
**RF:** RF-16 | **Prioridad:** P2

El requisito dice: "Al hacer clic en un término, abre la ficha de la capa relacionada." Actualmente los términos del glosario son solo texto estático sin acciones.

**Criterio de aceptación:**
- Los términos con `categoria` válida muestran un botón o enlace que navega a `/visor` y abre la ficha pedagógica de la capa principal de esa categoría.

---

## BLOQUE 2 — FUNCIONALIDADES NO IMPLEMENTADAS (P1-P2)

### [FEAT-01] Recorridos guiados — lógica de reproducción
**RF:** RF-14 | **Prioridad:** P1

La página [src/pages/Recorridos.tsx](src/pages/Recorridos.tsx) lista los recorridos pero "Iniciar recorrido" solo navega a `/visor` sin leer el query param `?recorrido=id`. No existe lógica de paradas, flyTo, ni narración.

**Subtareas:**
- [ ] Leer `?recorrido=id` en [src/pages/Visor.tsx](src/pages/Visor.tsx) al montar.
- [ ] Crear `public/data/recorridos/{id}.json` con las paradas (según interfaz `Recorrido` / `RecorridoParada`).
- [ ] Componente `RecorridoPlayer.tsx`: overlay inferior con nombre de parada, narración, botones Anterior/Siguiente/Cerrar.
- [ ] `map.flyTo([lat, lng], zoom)` con animación 800 ms al cambiar parada.
- [ ] Mensaje "Sin conexión — descargue el video" si `navigator.onLine === false`.

**Criterio de aceptación:**
- Al hacer clic en "Iniciar recorrido" desde Recorridos, el visor carga, el mapa vuela a la primera parada y muestra el overlay con narración.
- Siguiente/Anterior navegan entre paradas con animación flyTo.
- Funciona offline si los GeoJSON están cacheados.

---

### [FEAT-02] Compartir URL de vista (query params)
**RF:** RF-18 | **Prioridad:** P1

El contexto tiene la acción `SET_STATE_FROM_URL` pero nunca se llama. La URL no refleja el estado del mapa.

**Subtareas:**
- [ ] Al montar `Visor.tsx`, leer `?layers=...&zoom=...&lat=...&lng=...&base=...` y despachar `SET_STATE_FROM_URL`.
- [ ] Al cambiar el estado del mapa (capa toggled, zoom, pan), actualizar la URL con `window.history.replaceState`.
- [ ] Botón "Compartir" en la toolbar que copia la URL al portapapeles y muestra toast de confirmación.

**Criterio de aceptación:**
- URL ejemplo: `?layers=agua_cuencas,biodiversidad_paramos&zoom=14&lat=4.2710&lng=-75.9366&base=esri`
- Al pegar esa URL en otro navegador, el mapa carga con el mismo estado.

---

### [FEAT-03] Control de opacidad por capa
**RF:** RF-03 | **Prioridad:** P2

Cada capa activa en [src/components/LayerPanel.tsx](src/components/LayerPanel.tsx) debe tener un slider 0–100% para ajustar opacidad en tiempo real.

**Subtareas:**
- [ ] Añadir `opacidad: Record<string, number>` al `MapState` (default 1.0 por capa).
- [ ] Acción `SET_LAYER_OPACITY` en el reducer.
- [ ] Slider `<input type="range">` en `LayerItem` (visible solo cuando la capa está activa).
- [ ] `GeoJSONLayer` y `WMSTileLayer` en MapViewer leen la opacidad del estado.

**Criterio de aceptación:**
- El slider de una capa activa ajusta la opacidad del layer en el mapa frame-a-frame sin lag.
- La opacidad se serializa en la URL (RF-18).

---

### [FEAT-04] Leyenda dinámica de capas
**RF:** RF-04 | **Prioridad:** P2

No existe leyenda visual. Las capas WMS tienen `GetLegendGraphic`; las GeoJSON pueden tener leyenda generada desde su paleta.

**Subtareas:**
- [ ] Sección "Leyenda" en la parte inferior del panel de capas, visible solo cuando hay capas activas.
- [ ] Para capas GeoJSON: mostrar parche de color (rect o circle según geometría) + nombre de capa.
- [ ] Para capas WMS: cargar imagen de `{url}?REQUEST=GetLegendGraphic&LAYER={wmsLayers}&FORMAT=image/png`.
- [ ] Skeleton loader mientras carga la imagen WMS.

**Criterio de aceptación:**
- Al activar cualquier capa, su entrada de leyenda aparece en el panel en < 500 ms.
- La leyenda WMS carga en < 2 s.

---

### [FEAT-05] Búsqueda de lugares (geocoder Nominatim)
**RF:** RF-08 | **Prioridad:** P2

El header no tiene buscador. Nominatim (OSM geocoder) es gratuito y no requiere API key.

**Subtareas:**
- [ ] Campo de búsqueda en [src/components/Navbar.tsx](src/components/Navbar.tsx) (visible en escritorio, icono en móvil).
- [ ] Debounce 300 ms → fetch a `https://nominatim.openstreetmap.org/search?q={q}&countrycodes=co&viewbox=-76.08,4.44,-75.78,4.10&bounded=1&format=json`.
- [ ] Dropdown con resultados; al seleccionar, `map.flyTo(lat, lng, 15)`.

**Criterio de aceptación:**
- Al escribir ≥ 3 caracteres, resultados aparecen en < 1 s.
- Los resultados están filtrados al municipio de Sevilla (bounding box).

---

### [FEAT-06] Herramienta de medición
**RF:** RF-10 | **Prioridad:** P2

Medición de distancias (km) y áreas (ha) trazando sobre el mapa. Usar Turf.js (ya disponible como dependencia transitiva de Leaflet).

**Subtareas:**
- [ ] Botón "Medir" en la toolbar del mapa.
- [ ] Al activar: cursor cambia a crosshair, clic agrega vértices, doble clic cierra.
- [ ] Resultado mostrado en un tooltip sobre el trazado.
- [ ] Botón "Limpiar medición".

**Criterio de aceptación:**
- Medir el perímetro del municipio da ≈ 140 km ± 1%.
- Error máximo en área conocida: ≤ 0.01%.

---

### [FEAT-07] Zoom a extensión de capa
**RF:** RF-05 | **Prioridad:** P2

Botón en cada capa activa del panel para hacer `map.fitBounds(layer.getBounds())`.

**Criterio de aceptación:**
- Al hacer clic en el ícono de zoom de una capa activa, el mapa anima (300 ms) a la bounding box de esa capa.
- Funciona para GeoJSON y WMS (WMS usa la bounding box estimada del config).

---

### [FEAT-08] Exportar vista como imagen PNG
**RF:** RF-17 | **Prioridad:** P2

Botón en la toolbar para capturar el mapa (canvas Leaflet) y descargarlo como PNG.

**Subtareas:**
- [ ] Instalar `leaflet-image` o usar `html2canvas`.
- [ ] Botón en `MapToolbar.tsx`: "📷 Exportar".
- [ ] Incluir escala gráfica y créditos en la imagen.

**Criterio de aceptación:**
- La imagen descargada tiene resolución ≥ 1920×1080 px.
- Se descarga en < 3 s en hardware estándar.

---

### [FEAT-09] Multimedia en popup (thumbnail + video)
**RF:** RF-13 | **Prioridad:** P2

Los popups actuales solo muestran atributos de texto. El documento especifica thumbnail de imagen y botón play para video.

**Subtareas:**
- [ ] Agregar campo `media?: { imagen?: string; youtube_id?: string }` a `LayerConfig`.
- [ ] Actualizar `buildPopupContent` en MapViewer para mostrar `<img>` lazy-loaded (max 100px alto) si existe.
- [ ] Botón "▶ Ver video" que abre un modal con `react-player` (ya instalado).

**Criterio de aceptación:**
- Si la capa tiene `media.imagen`, el popup muestra el thumbnail.
- Si la capa tiene `media.youtube_id`, el popup muestra botón de video que abre modal.
- Sin autoplay.

---

### [FEAT-10] Línea de tiempo (timeline slider)
**RF:** RF-15 | **Prioridad:** P2

Control de años para capas con datos históricos (cobertura del suelo por año).

**Subtareas:**
- [ ] Añadir campo `historico?: { años: number[]; urlPattern: string }` a `LayerConfig`.
- [ ] Componente `TimelineSlider.tsx` visible en la toolbar si hay ≥1 capa histórica activa.
- [ ] Al mover el slider, la capa WMS cambia su parámetro `TIME` o se carga el GeoJSON del año correspondiente.

**Criterio de aceptación:**
- El slider tiene los años disponibles como snapshots.
- El cambio de snapshot actualiza la capa en < 1 s.

---

### [FEAT-11] Búsqueda en capas GeoJSON
**RF:** RF-09 | **Prioridad:** P2

Campo de búsqueda en el panel de capas que filtre elementos por nombre o atributo.

**Criterio de aceptación:**
- Resultados filtrados en tiempo real mientras escribe.
- Al seleccionar un resultado, el mapa vuela al elemento y resalta su polígono/punto.

---

## BLOQUE 3 — DISEÑO Y UX (P1-P2)

### [UI-01] Animaciones y diseño página de inicio (Home)
**Prioridad:** P1

La página principal es funcional pero plana. Necesita animaciones de entrada y más personalidad visual.

**Subtareas:**
- [ ] **Hero con fondo animado**: degradado animado o imagen de Sevilla (webp) con overlay verde semitransparente.
- [ ] **Fade-in escalonado** del título, subtítulo y botones CTA usando CSS `@keyframes` + `animation-delay`.
- [ ] **Counter animation** en una sección de estadísticas (ej: "22 capas · 6 categorías · 15 términos").
- [ ] **Hover lift** en las tarjetas de categoría: `transform: translateY(-4px)` + `box-shadow` más intensa.
- [ ] **Slide-in** de las cards al hacer scroll (Intersection Observer, sin dependencia extra).
- [ ] Sección "Cómo funciona" con 3 pasos visuales (icono + texto) antes del footer.

**Criterio de aceptación:**
- Las animaciones duran ≤ 400 ms y respetan `prefers-reduced-motion`.
- Lighthouse Performance ≥ 90 después de los cambios.
- No hay layout shift (CLS = 0).

---

### [UI-02] Mejoras visuales del Visor
**Prioridad:** P1

**Subtareas:**
- [ ] **Iconos SVG por categoría** en el panel de capas (el doc especifica Heroicons: users, droplet, leaf, cloud, layers, map-pin). Actualmente hay círculos de color sin icono.
- [ ] **Hover sobre polígonos**: `fillOpacity` aumenta de 0.45 a 0.7 al pasar el cursor (`onEachFeature` → `mouseover`/`mouseout`).
- [ ] **Capa seleccionada**: stroke blanco 3px en el elemento clickeado hasta que se abra otra ficha.
- [ ] **Cluster de marcadores**: activar `leaflet.markercluster` (ya instalado) para capas de puntos (actores, especies). Color del cluster según `CATEGORIAS[capa.categoria].color`.
- [ ] **Escala gráfica**: añadir `L.control.scale({ imperial: false })` al mapa.
- [ ] **Control de norte**: indicador de norte estático en esquina superior izquierda del mapa.
- [ ] **Toast de advertencia** cuando una capa WMS falla al cargar (en lugar de silencio total).

**Criterio de aceptación:**
- Al pasar el cursor sobre un polígono, se ve el aumento de opacidad.
- Las capas de puntos con ≥ 10 features muestran clusters.
- Si una WMS falla, aparece un toast "Capa no disponible (sin conexión)" en la esquina inferior.

---

### [UI-03] Navbar mejorada
**Prioridad:** P2

**Subtareas:**
- [ ] Añadir `backdrop-blur` y ligera sombra a la navbar para que flote visualmente sobre el mapa en `/visor`.
- [ ] En móvil: menú hamburguesa que despliega los links verticalmente.
- [ ] Indicador de progreso de carga de capas (thin progress bar debajo del header).

**Criterio de aceptación:**
- En `/visor` la navbar se ve como una barra flotante con blur.
- En móvil < 768px, los links del nav se colapsan en un menú desplegable.

---

### [UI-04] Mobile bottom-sheet para paneles
**RF:** RNF-06 | **Prioridad:** P2

En móvil (< 768px) el LayerPanel y el InfoPanel deben ser bottom-sheets con swipe gesture, no paneles laterales que tapan el mapa.

**Criterio de aceptación:**
- En pantallas < 768px, el LayerPanel aparece como sheet que sale desde abajo al tocar el botón "☰ Capas".
- Se puede cerrar con swipe down o botón ✕.
- El mapa permanece visible parcialmente detrás.

---

### [UI-05] Modo oscuro del mapa
**RF:** RF-06 (selector de mapa base) | **Prioridad:** P3

El mapa base "dark" (CartoDB Dark Matter) ya está en `MAPA_BASE_URLS` pero no aparece en `MapToolbar.tsx`.

**Subtareas:**
- [ ] Añadir "Dark" como cuarta opción en el selector de mapa base.
- [ ] Cuando el mapa dark está activo, cambiar el panel lateral a fondo `#1A1A2E` con texto blanco.

**Criterio de aceptación:**
- Al seleccionar "Dark", el mapa base cambia a CartoDB Dark Matter.
- Los paneles laterales cambian a tema oscuro.

---

## BLOQUE 4 — ACCESIBILIDAD Y CALIDAD (P1-P2)

### [A11Y-01] Alt text en todas las imágenes
**RF:** RF-20 | **Prioridad:** P1

**Criterio de aceptación:**
- Auditoría axe-core: 0 violaciones `image-alt`.
- Todas las imágenes en `InfoPanel` (galería), `Home` y thumbnails tienen `alt` descriptivo en español.

---

### [A11Y-02] Navegación por teclado completa
**RF:** RF-21 | **Prioridad:** P1

**Subtareas:**
- [ ] Todos los controles del LayerPanel son accesibles con Tab + Enter/Space.
- [ ] El popup del mapa se puede cerrar con Escape.
- [ ] El InfoPanel se puede cerrar con Escape.
- [ ] Foco visible en todos los controles (no solo `outline: none`).

**Criterio de aceptación:**
- Auditoría axe-core: 0 violaciones `keyboard`.
- Se puede navegar toda la UI sin ratón.

---

### [A11Y-03] Página de política de privacidad
**RF:** RNF-13 | **Prioridad:** P2

**Criterio de aceptación:**
- Existe `/privacidad` con política básica cumpliendo Ley 1581/2012.
- El footer enlaza correctamente a esta página.

---

## BLOQUE 5 — INFRAESTRUCTURA Y MANTENIBILIDAD (P2-P3)

### [INFRA-01] Configurar WMS tile caching offline (zoom 10-14)
**RF:** RF-19 | **Prioridad:** P1

El `vite.config.ts` tiene un `runtimeCaching` para OSM tiles, pero no pre-cachea tiles de forma proactiva. El Workbox precache config solo incluye archivos del build.

**Subtareas:**
- [ ] Agregar estrategia de pre-cache de tiles OSM para bounding box `[-76.08, 4.10, -75.78, 4.44]`, zoom 10-14 (~50 MB) usando `workbox-precaching` con una lista de URLs generada por script.
- [ ] Mostrar mensaje claro en el mapa cuando una capa WMS no carga offline.

**Criterio de aceptación:**
- Tras la primera visita con conexión, las capas GeoJSON y tiles OSM zoom 10-14 cargan offline.
- Capas WMS muestran mensaje "No disponible sin conexión" en lugar de spinner infinito.

---

### [INFRA-02] JSDoc en componentes y hooks
**RF:** RNF-16 | **Prioridad:** P3

El documento especifica JSDoc en todos los componentes y hooks.

**Criterio de aceptación:**
- Cada componente y hook tiene un comentario JSDoc de una línea describiendo su propósito.
- README tiene instrucciones actualizadas de desarrollo y despliegue.

---

### [INFRA-03] ESLint y Prettier configurados con hooks pre-commit
**RF:** RNF (Mantenibilidad) | **Prioridad:** P3

El documento especifica Husky + Prettier pre-commit.

**Subtareas:**
- [ ] Instalar `prettier` y `.prettierrc`.
- [ ] Instalar `husky` + `lint-staged` para ejecutar `prettier --write` y `eslint --fix` en pre-commit.

**Criterio de aceptación:**
- `git commit` ejecuta prettier y eslint automáticamente.
- El build no tiene warnings de lint.

---

## RESUMEN DE SPRINTS SUGERIDOS

### Sprint 1 — Datos y correcciones críticas
`DATA-01` · `DATA-02` · `FIX-01` · `FIX-02`

### Sprint 2 — Funcionalidades core faltantes
`FEAT-01` (recorridos) · `FEAT-02` (URL sharing) · `FEAT-03` (opacidad) · `FEAT-04` (leyenda)

### Sprint 3 — Diseño y UX
`UI-01` (home animaciones) · `UI-02` (visor mejoras) · `UI-03` (navbar) · `A11Y-01` · `A11Y-02`

### Sprint 4 — Funcionalidades secundarias
`FEAT-05` (geocoder) · `FEAT-06` (medición) · `FEAT-07` (zoom a capa) · `FEAT-08` (exportar PNG) · `FEAT-09` (multimedia popup)

### Sprint 5 — Accesibilidad, offline y calidad
`INFRA-01` (offline tiles) · `A11Y-03` (privacidad) · `UI-04` (mobile) · `UI-05` (dark mode) · `INFRA-02-03`

---

*Última actualización: 2026-04-25*
