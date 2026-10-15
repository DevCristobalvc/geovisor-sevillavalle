# Trazabilidad de requisitos funcionales

Generado por `tests/e2e/requisitos.mjs` el 2026-10-15 contra https://www.refiup.app.
Criterios de aceptación tomados del *Documento de Requerimientos v2* (sección 7).
Datos crudos: [`requisitos/resultados.json`](requisitos/resultados.json).

## Resumen

| Resultado | RF |
|---|---|
| Cumple | 11 |
| Parcial | 8 |
| No cumple | 2 |
| Error de la prueba | 0 |
| **% de RF que cumplen su criterio** | **52,4 %** (11 de 21) |

"Parcial" significa que la función existe y se usa, pero no cumple todo el criterio del SRS
(la nota de cada fila explica qué falta). Para el indicador solo cuenta "Cumple".

## Detalle

| RF | Nombre | Criterio de aceptación (SRS) | Prueba | Medición | Resultado |
|---|---|---|---|---|---|
| RF-01 | Mapa base interactivo | Mapa cargado en < 3 s (10 Mbps); zoom responde en < 100 ms; zoom 10–18 | requisitos.mjs RF-01<br>validar.mjs: Mapa: elementos vectoriales dibujados | primera tesela en 1125 ms · zoom responde en 11 ms · rango 10–18: sí<br>*Medido con la conexión del equipo de prueba, no con un enlace de 10 Mbps controlado* | **Cumple** |
| RF-02 | Panel de capas jerárquico | 6 categorías en acordeón; la capa aparece/desaparece en < 500 ms; el toggle de categoría activa todas sus subcapas | requisitos.mjs RF-02<br>validar.mjs: GeoJSON: se pidieron las 16 capas<br>validar.mjs: Panel: capas GeoJSON oficiales marcadas CVC<br>validar.mjs: Panel: fuente de las WMS visible | 6 categorías · aparece en 210 ms (incluye descargar el GeoJSON) · desaparece en 4 ms · categoría Agua activa 6/6 capas | **Cumple** |
| RF-03 | Control de opacidad | Slider 0–100 % en tiempo real, sin lag perceptible (60 fps) | requisitos.mjs RF-03 | 5 cambios de opacidad · peor caso 1.2 ms (un cuadro a 60 fps = 16,7 ms) | **Cumple** |
| RF-04 | Leyenda dinámica | La leyenda aparece con la capa; la imagen GetLegendGraphic carga en < 2 s | requisitos.mjs RF-04<br>validar.mjs: Leyenda propia de pisos térmicos<br>validar.mjs: Leyenda propia de conflictos de uso<br>validar.mjs: Leyenda GetLegendGraphic (IDEAM cobertura) carga | GetLegendGraphic del IDEAM en 1019 ms · leyenda visible al activar la capa: no<br>*En las capas WMS la leyenda se abre con el botón "Ver leyenda"; las GeoJSON muestran su color junto al nombre* | **Parcial** |
| RF-05 | Zoom a extensión de capa | Fly-to con animación suave (300 ms) a la extensión de la capa | requisitos.mjs RF-05 | el mapa llega a la extensión en 11 ms · zoom 11 → 16<br>*Llega a la extensión correcta, pero de un salto: Leaflet no anima cambios de más de 4 niveles de zoom (fitBounds)* | **Parcial** |
| RF-06 | Selector de mapa base | OSM / satélite / topográfico; el cambio ocurre en < 1 s sin perder las capas activas | requisitos.mjs RF-06 | mediana de 3 cambios: Satélite 22 ms · Topográfico 26 ms · Callejero 17 ms · capas activas conservadas: sí | **Cumple** |
| RF-07 | Consulta de atributos al clic | Popup en < 200 ms para GeoJSON; GetFeatureInfo WMS en < 1,5 s | requisitos.mjs RF-07<br>validar.mjs: Popup oficial: atributos legibles y fuente CVC<br>validar.mjs: Popup ilustrativo: aviso visible y sin nombres de personas | popup GeoJSON en 15 ms · 3 atributos · botón de ficha: sí · GetFeatureInfo WMS: no implementado<br>*Las 7 capas WMS solo tienen leyenda; no consultan atributos al clic* | **Parcial** |
| RF-08 | Búsqueda de lugares | Sugerencias en < 1 s al escribir ≥ 3 caracteres; al elegir, el mapa vuela al lugar | requisitos.mjs RF-08 | sugerencias 826 ms después de la última tecla (escritura 372 ms) · vuelo al lugar: 1228 ms<br>*Incluye la espera de 400 ms antes de consultar Nominatim (servicio externo)* | **Cumple** |
| RF-09 | Búsqueda en capas GeoJSON | Filtra en tiempo real mientras se escribe y resalta el elemento en el mapa | requisitos.mjs RF-09 | filtra mientras se escribe: sí · vuela al elemento: sí · resalta el elemento: no | **Parcial** |
| RF-10 | Herramienta de medición | Distancias (km) y áreas (ha) con Turf.js; error ≤ 0,01 % frente a una referencia | requisitos.mjs RF-10 | 28.56 km · 10148.1 ha · referencia haversine 28.55 km · diferencia 0.046 %<br>*La referencia usa las coordenadas del cursor (4 decimales, ±6 m), así que la diferencia mide sobre todo ese redondeo; tolerancia 0,5 %* | **Cumple** |
| RF-11 | Coordenadas del cursor | Se actualizan en cada mousemove con 4 decimales | requisitos.mjs RF-11 | "4.1828, -75.8970" → "4.1793, -75.8901" al mover el cursor 20 px | **Cumple** |
| RF-12 | Fichas pedagógicas | Panel lateral; ≥ 150 palabras, ≥ 1 imagen (≤ 5), 3–5 preguntas, 5–8 términos | requisitos.mjs RF-12<br>validar.mjs: Ficha: muestra "Datos de la capa: CVC" y "Referencias"<br>validar.mjs: Ficha <id> (23 fichas: 3–5 preguntas, imágenes de Wikimedia) | 23 fichas revisadas · 0 fuera de criterio · se abre en panel lateral | **Cumple** |
| RF-13 | Contenido multimedia en popup | Miniatura lazy en el popup; videos en modal (react-player) sin autoplay | requisitos.mjs RF-13 | miniatura en popup: sí (lazy: no) · videos: 2 enlaces a YouTube en la ficha · autoplay: no<br>*Los videos abren en YouTube en vez de un modal con react-player, y el popup no tiene botón de reproducción* | **Parcial** |
| RF-14 | Modo recorrido guiado | Botones Siguiente/Anterior; flyTo de 800 ms; funciona sin conexión con GeoJSON en caché | requisitos.mjs RF-14 | Siguiente/Anterior: sí · vuelo a la parada en 1427 ms (SRS: 800 ms ± 200)<br>*El uso sin conexión se verifica en RF-19* | **Parcial** |
| RF-15 | Línea de tiempo | Slider de años; el cambio de año actualiza la capa en < 1 s | requisitos.mjs RF-15 | no hay control de línea de tiempo<br>*No implementado (ver plan-geo2, bloque 4)* | **No cumple** |
| RF-16 | Glosario territorial | Buscable por texto; al hacer clic en un término abre la ficha de la capa relacionada | requisitos.mjs RF-16 | 15 términos · búsqueda "páramo" → 2 · el enlace abre el visor en la categoría (?categoria=biodiversidad&lat=4.1600&lng=-75.8900&zoom=11&base=osm&layers=agua_cuencas%2Cterritorio_division) | **Parcial** |
| RF-17 | Exportar vista como imagen | PNG descargado en < 3 s; resolución mínima 1920 × 1080 px | requisitos.mjs RF-17 | PNG descargado en 1095 ms · 1416 × 780 px (ventana de 1440 × 900)<br>*La imagen tiene el tamaño del mapa en pantalla; no alcanza 1920 × 1080* | **Parcial** |
| RF-18 | Compartir URL de vista | La URL (capas, zoom, centro) restaura el mismo estado en otro navegador | requisitos.mjs RF-18<br>validar.mjs: RF-18: el enlace restaura lat/lng/zoom | en otra sesión: capas agua_cuencas,territorio_division, zoom 12, centro 4.0500, -75.8500, mapa satélite: sí | **Cumple** |
| RF-19 | Modo offline básico | Tras la primera visita funciona sin conexión con GeoJSON y teselas z10–14; aviso claro si una WMS no está disponible | requisitos.mjs RF-19 | 571 teselas precargadas · sin conexión: inicio abre, enlace directo al visor abre, visor desde el menú abre · en z13: 21 elementos GeoJSON, 35 teselas OSM cargadas y 0 sin cargar dentro de la zona precargada · aviso WMS: sí | **Cumple** |
| RF-20 | Ajuste de imagen alt text | axe-core: 0 violaciones image-alt | requisitos.mjs RF-20 | 7 páginas (visor con popup y ficha abiertos) · 0 violaciones de texto alternativo | **Cumple** |
| RF-21 | Navegación por teclado | axe-core: 0 violaciones de teclado; foco visible en todos los controles | requisitos.mjs RF-21 | 7 páginas · 3 violaciones de teclado (axe) · 59 controles recorridos con Tab, 0 sin foco visible<br>*/visor: region (1); /guia: scrollable-region-focusable (1); /privacidad: scrollable-region-focusable (1)* | **No cumple** |

## Cómo regenerar

```bash
BASE=https://www.refiup.app npm run test:rf
```

`validar.mjs` es la prueba de regresión (debe pasar siempre); `requisitos.mjs` mide cada RF
contra su criterio y puede reportar "Parcial" o "No cumple" sin que eso sea una regresión.
