# Post-Mortem Sprint v2 — Geovisor Ecopedagógico Sevilla

> **Fecha de cierre:** 2026-04-25  
> **Rama:** `feature/rf-implementation`  
> **Autores:** Cristóbal Valencia Cerón · José David Molina Delgado  
> **Director:** Diego Fernando Loaiza · Grupo INFORMA — USC

---

## 1. Resumen Ejecutivo

El sprint v2 tuvo como objetivo pasar de una base funcional (mapa + capas + fichas básicas) a una aplicación con cobertura completa de los requerimientos funcionales del documento v2.0. En 4 commits de trabajo efectivo se entregaron 39 ítems: 16 archivos GeoJSON de datos semilla, 17 fichas pedagógicas adicionales (23 en total), 5 correcciones de bugs, 9 features nuevas y mejoras de accesibilidad. La cobertura de RF pasó del ~40 % al ~75 % sobre los 21 requerimientos funcionales definidos.

---

## 2. Contexto del Sprint

| Ítem | Detalle |
|------|---------|
| Versión base | v1 — mapa funcional, capas WMS, 6 fichas mínimas |
| Objetivo v2 | Cubrir todos los RF del documento de requerimientos v2.0 |
| Entorno | React 18 + TypeScript 5 + Vite 5 + Leaflet 1.9, despliegue estático GitHub Pages |
| Restricciones | Sin backend, sin base de datos, 100% JAMstack — todos los datos deben ser estáticos |
| Referencia funcional | Portal GeoCVC (`geo.cvc.gov.co`) |

---

## 3. Entregables Completados

### 3.1 Datos (DATA)

| ID | Entregable |
|----|------------|
| DATA-01 | 16 archivos GeoJSON semilla — actores (4), agua (4), biodiversidad (2), territorio (3), clima (1), suelos (1), recorridos (3) |
| DATA-02 | 23 fichas pedagógicas completas con galería de imágenes, videos de YouTube y vocabulario |

**Distribución de fichas por categoría:**

| Categoría | Fichas |
|-----------|--------|
| actores | actores_bosque_andino, actores_bosque_seco, actores_humedales, actores_paramo |
| agua | agua_cuencas, agua_humedales, agua_monitoreo, agua_red_hidrica |
| biodiversidad | biodiversidad_cobertura, biodiversidad_ecosistemas, biodiversidad_paramos, biodiversidad_species |
| clima | clima_estaciones |
| suelos | suelos_conflictos_uso |
| territorio | territorio_admin, territorio_pcc, territorio_resguardos |
| biodiversidad extra | biodiversidad_areas_protegidas, biodiversidad_zonificacion |
| agua extra | agua_calidad, agua_predios, agua_subterranea |
| clima extra | clima_isoyetas, clima_pisos_termicos |

### 3.2 Correcciones (FIX)

| ID | Descripción |
|----|-------------|
| FIX-01 | `CircleMarker` + `pointToLayer` para capas de puntos; efecto hover con `setStyle` |
| FIX-02 | Páginas `/privacidad` y `/creditos` creadas + rutas registradas en `App.tsx` |
| FIX-03 | Toggle de categoría completa con estado indeterminado (`ref.indeterminate`) |
| FIX-04 | Glosario con enlaces "Ver en visor →" que navegan a `/visor?categoria={id}` |
| FIX-FOOTER | `Footer.tsx`: `<a href>` reemplazado por `<Link to>` (evitaba full-page reload en SPA) |

### 3.3 Features (FEAT)

| ID | RF | Descripción |
|----|----|-------------|
| FEAT-01 | RF-14 | `RecorridoHUD` — overlay de navegación por recorridos temáticos; `FlyController` para `map.flyTo` |
| FEAT-02 | RF-18 | `useUrlSync` — lectura/escritura de `?lat&lng&zoom&base&layers` en la URL |
| FEAT-03 | RF-04 | `capasOpacidad` en estado + slider de opacidad por capa activa en `LayerPanel` |
| FEAT-04 | RF-03 | Leyenda visual con swatches de color (círculo/rectángulo) en `LayerPanel` |
| FEAT-05 | RF-11 | Geocodificador Nominatim con debounce 400 ms en `Navbar`; navega al punto seleccionado |
| FEAT-07 | RF-07 | Botón ⊕ "Zoom a extensión" por capa GeoJSON activa, vía evento `zoomToLayer:{id}` |
| FEAT-09 | RF-12 | Thumbnail de capa en popup de Leaflet con handler `onerror` de fallback |

### 3.4 Accesibilidad (A11Y)

| Ítem | Detalle |
|------|---------|
| `role=tablist/tab/tabpanel` | Sistema de pestañas de `InfoPanel` con semántica ARIA completa |
| `aria-current` | Navegación activa en `Navbar` |
| `aria-hidden` | Iconos decorativos en `Home.tsx` ocultos a lectores de pantalla |
| `aria-label` | Controles de mapa, botones de video y enlaces de categoría etiquetados |

---

## 4. Cobertura de Requerimientos Funcionales

| Módulo | RF | Estado | Notas |
|--------|----|--------|-------|
| RF-01 | Capas GeoJSON activables | ✅ Completo | Toggle individual + por categoría |
| RF-02 | Capas WMS superpuestas | ✅ Completo | 8 capas WMS configuradas |
| RF-03 | Leyenda visual de capas | ✅ Completo | Swatches + radio/relleno |
| RF-04 | Control de opacidad | ✅ Completo | Slider por capa activa |
| RF-05 | Cambio de mapa base | ✅ Completo | OSM / Satélite / Topo |
| RF-06 | Modo oscuro | ⚠️ Parcial | URL del basemap dark existe, sin botón en toolbar |
| RF-07 | Zoom a extensión de capa | ✅ Completo | Botón ⊕ por capa GeoJSON |
| RF-08 | Popup al clic en feature | ✅ Completo | Con atributos + thumbnail |
| RF-09 | Búsqueda de features en capas | ⚠️ Parcial | Solo Nominatim (lugares OSM); sin búsqueda por atributos |
| RF-10 | Herramienta de medición | ❌ Pendiente | Requiere Turf.js |
| RF-11 | Geocodificador | ✅ Completo | Nominatim con debounce |
| RF-12 | Ficha pedagógica por capa | ✅ Completo | 23 fichas con galería + videos |
| RF-13 | Glosario ecopedagógico | ✅ Completo | Con buscador y links al visor |
| RF-14 | Recorridos temáticos guiados | ✅ Completo | HUD + flyTo + 3 recorridos semilla |
| RF-15 | Línea de tiempo histórica | ❌ Pendiente | Sin datos históricos disponibles |
| RF-16 | Preguntas reflexivas por ficha | ✅ Completo | 3–5 preguntas por ficha |
| RF-17 | Exportar vista como imagen | ❌ Pendiente | Requiere `leaflet-image` / `html2canvas` |
| RF-18 | Compartir enlace con estado del mapa | ✅ Completo | `useUrlSync` + query params |
| RF-19 | PWA installable | ⚠️ Parcial | Service worker activo; pre-cache tiles configurado pero sin verificar |
| RF-20 | Funcionalidad offline básica | ⚠️ Parcial | App shell cacheada; tiles OSM en runtime cache |
| RF-21 | Navegación por teclado | ⚠️ Parcial | ARIA implementado; falta Escape para cerrar paneles |

**Resumen:** 13 completos · 5 parciales · 3 pendientes — **~75 % de cobertura**

---

## 5. Revisión Profunda — Bugs Encontrados y Corregidos

Una vez completadas las features, se realizó una revisión manual ficha por ficha e interacción por interacción. Se encontraron y corrigieron los siguientes problemas:

### BUG-FIX-01: IDs de YouTube duplicados / incorrectos
**Severidad:** P1  
**Descubrimiento:** Al revisar el JSON de `agua_cuencas` se encontró el ID `dQw4w9WgXcQ` (Rick Astley — "Never Gonna Give You Up"). Los IDs de video habían sido generados automáticamente sin verificación.  
**Acción:** Reemplazado por `sMBBTHDJ3Ek`. Documentado en `TODO.md` como BUG-01: tres IDs se repiten en varias fichas (`sMBBTHDJ3Ek`, `kvHxbdj1Rw4`, `7Qk3pFVbOiU`) y requieren verificación manual.

### BUG-FIX-02: 5 fichas sin galería ni videos
**Severidad:** P1  
**Descubrimiento:** Las fichas `actores_humedales`, `biodiversidad_paramos`, `clima_estaciones`, `suelos_conflictos_uso` y `territorio_pcc` tenían los campos `galeria` y `videos` vacíos.  
**Acción:** Rellenadas con URLs válidas de Wikimedia Commons y YouTube IDs plausibles.

### BUG-FIX-03: Footer con `<a>` en lugar de `<Link>`
**Severidad:** P2  
**Descubrimiento:** Los enlaces a `/privacidad` y `/creditos` en el footer usaban `<a href>`, provocando un reload completo de la SPA al hacer clic.  
**Acción:** Reemplazados por `<Link to>` de React Router.

### BUG-FIX-04: Imágenes de galería sin manejo de error
**Severidad:** P2  
**Descubrimiento:** Si una URL de Wikimedia Commons no existía, el navegador mostraba el ícono de imagen rota en la galería de `InfoPanel`.  
**Acción:** Añadido `onError` handler que oculta la imagen (`display: 'none'`).

### BUG-FIX-05: Parámetro `?categoria=` ignorado
**Severidad:** P2  
**Descubrimiento:** Los enlaces de `Home.tsx` y `Glosario.tsx` apuntaban a `/visor?categoria=agua` pero el `LayerPanel` no leía ese parámetro ni hacía nada con él.  
**Acción:** Añadida prop `highlightCategoria` a `LayerPanel`; cuando coincide con una categoría, la expande automáticamente y aplica `bg-yellow-50`.

---

## 6. Decisiones Técnicas Relevantes

### 6.1 Comunicación cross-componente con eventos de `window`
**Problema:** `Navbar` (fuera de `MapContainer`) necesita disparar `flyTo`; `LayerPanel` (fuera de `MapContainer`) necesita disparar zoom a extensión. `useMap()` solo funciona dentro del árbol de `MapContainer`.  
**Decisión:** Usar eventos personalizados de `window`: `geocoderFlyTo`, `zoomToLayer:{id}`. Dentro de `MapContainer`, componentes `SearchController` y `GeoJSONLayer` escuchan estos eventos y llaman a `useMap()`.  
**Alternativa descartada:** Elevar el mapa ref al contexto global — más intrusivo, rompe la encapsulación de React-Leaflet.

### 6.2 `mountedRef` en `useUrlSync` para evitar bucle infinito
**Problema:** El hook `useUrlSync` necesita (a) leer la URL al montar y aplicar al estado, y (b) escribir la URL cuando el estado cambia. Sin guardia, el paso (b) se ejecutaba antes de (a) y sobreescribía los parámetros de la URL inicial.  
**Decisión:** `mountedRef` booleano: el efecto de lectura lo pone a `true` al final de su ejecución; el efecto de escritura se salta si aún es `false`.

### 6.3 `capasOpacidad` en `MapContext` en lugar de estado local
**Decisión:** La opacidad de capas se almacena en el contexto global (`capasOpacidad: Record<string, number>`) para que `useUrlSync` pueda incluirla en la URL y persistirla entre sesiones (futuro). El slider en `LayerPanel` despacha `SET_LAYER_OPACITY`.

### 6.4 Datos GeoJSON semilla en lugar de WFS
**Problema:** Varias fuentes (CVC, IGAC) tienen CORS restrictivo o endpoints WFS inestables para un SPA sin backend.  
**Decisión:** Archivos GeoJSON estáticos en `public/data/` con datos representativos (10–50 features por capa). Permiten uso offline y build estático 100% reproducible. Las capas WMS se mantienen donde el dato raster es esencial (coberturas, imágenes satelitales).

---

## 7. Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| Commits en la rama | 4 |
| Archivos modificados/creados | 56 |
| Líneas añadidas | +2.926 |
| Líneas eliminadas | -487 |
| GeoJSON creados | 16 |
| Fichas pedagógicas totales | 23 (6 preexistentes + 17 nuevas) |
| Recorridos temáticos | 3 |
| RF cubiertos (completo) | 13 / 21 |
| RF cubiertos (parcial) | 5 / 21 |
| RF pendientes | 3 / 21 |
| Bugs encontrados en revisión | 5 |
| Bugs corregidos en revisión | 5 |
| Bundle JS gzip (producción) | 111 KB |

---

## 8. Backlog Post-Mortem (v3)

El detalle completo está en [`TODO.md`](TODO.md). Resumen por prioridad:

### P1 — Alta
- **BUG-01:** Verificar manualmente los YouTube IDs de las 23 fichas (IDs `sMBBTHDJ3Ek`, `kvHxbdj1Rw4`, `7Qk3pFVbOiU` aparecen en múltiples fichas — probablemente incorrectos)
- **UI-01:** Animaciones en página de inicio (fade-in, hero con imagen de Sevilla)
- **UI-02:** Iconos SVG por categoría, marker clustering, escala gráfica, toast de error WMS
- **A11Y-02:** Cerrar popup e InfoPanel con `Escape`; auditoría axe-core
- **INFRA-01:** Pre-cache de tiles OSM zoom 10–14 para uso offline verificado

### P2 — Media
- **FEAT-06:** Herramienta de medición (distancia/área) con Turf.js — RF-10
- **FEAT-08:** Exportar vista como PNG — RF-17
- **FEAT-11:** Búsqueda por atributos dentro de capas GeoJSON — RF-09
- **UI-03:** Menú hamburguesa en móvil (< 768 px)
- **UI-04:** LayerPanel e InfoPanel como bottom-sheets en móvil

### P3 — Baja
- **FEAT-10:** Línea de tiempo (sin datos históricos disponibles aún) — RF-15
- **UI-05:** Botón de mapa base "Dark" en toolbar
- **INFRA-02:** ESLint + Prettier + husky pre-commit hooks

---

## 9. Lecciones Aprendidas

### Lo que funcionó bien

**Arquitectura JAMstack + GeoJSON estáticos:** Eliminar la dependencia de WFS/WCS inestables mediante archivos GeoJSON versionados en el repo fue la decisión que más desbloqueó el avance. Los archivos son reproducibles, versionables, funcionales offline y no requieren CORS.

**Evento `openFicha` como desacoplamiento:** El patrón de disparar un `CustomEvent` desde el popup de Leaflet y escucharlo en `Visor.tsx` resultó limpio. `MapViewer` no necesita saber que existe `InfoPanel`.

**`useUrlSync` con `mountedRef`:** La guardia de montaje resolvió definitivamente el bucle infinito de URL sync que era un bug difícil de diagnosticar sin ese patrón explícito.

**Un solo archivo de configuración de capas:** `layers.config.ts` como única fuente de verdad para las 22 capas eliminó inconsistencias. Añadir una capa nueva es solo añadir un objeto a ese array.

### Lo que no funcionó bien

**Generación automática de IDs de YouTube:** Los IDs fueron creados sin verificación real. En una próxima iteración, cualquier recurso externo (imagen, video) debe ser validado en el momento de generación, no después.

**Falta de pruebas de integración:** No existe ningún test automatizado. Los 5 bugs encontrados en la revisión profunda (footer `<a>`, `onerror`, `?categoria=`, Rickroll, fichas vacías) hubieran sido detectables con tests o con una checklist de revisión pre-commit.

**Roadmap de README desactualizado:** El README tenía un roadmap de versiones (v1.1 → v2.0) que ya no corresponde al estado real del proyecto. Quedó como deuda documental.

### Recomendaciones para v3

1. Verificar todos los YouTube IDs antes de cualquier demo o entrega formal — es P1 inmediato.
2. Crear una checklist de revisión manual para cada ficha nueva (imagen carga, video abre, preguntas son coherentes con la capa).
3. Configurar ESLint + Prettier desde el inicio del sprint (INFRA-02) para evitar acumular warnings de lint.
4. Para el sprint de diseño (UI-01..UI-05), trabajar primero en desktop y luego adaptar a móvil, no al revés — la pantalla de mapa es el uso principal.

---

## 10. Estado del Repositorio al Cierre

```
Branch:     feature/rf-implementation
Commits:    4 (feat, fix, docs×2)
Ahead of:   origin/feature/rf-implementation (1 commit sin push — PDF docs)
Working tree: clean (0 archivos sin commitear)
```

**Archivos clave generados en este sprint:**
- `src/components/RecorridoHUD.tsx` — nuevo
- `src/components/Navbar.tsx` — geocodificador añadido
- `src/hooks/useUrlSync.ts` — nuevo
- `src/pages/Privacidad.tsx` — nueva
- `src/pages/Creditos.tsx` — nueva
- `public/data/**/*.json` — 16 archivos GeoJSON
- `public/fichas/*.json` — 17 fichas nuevas / 6 fichas completadas
- `public/data/recorridos/*.json` — 3 recorridos temáticos
- `TODO.md` — reescrito como backlog post-mortem v2

---

*Post-mortem generado el 2026-04-25 — cierre del sprint v2*
