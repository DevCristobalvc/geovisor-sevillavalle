import type { LayerConfig, Categoria, FuenteCapa } from '../types'

export const CATEGORIAS: Record<
  Categoria,
  { label: string; color: string; icono: string; descripcion: string }
> = {
  actores: {
    label: 'Actores Sociales',
    color: '#6D4C41',
    icono: 'users',
    descripcion:
      'Comunidades, ONGs, líderes y organizaciones con presencia en los ecosistemas de Sevilla',
  },
  agua: {
    label: 'Agua',
    color: '#2E86C1',
    icono: 'droplet',
    descripcion: 'Cuencas, ríos, humedales y sistemas de monitoreo hídrico del municipio',
  },
  biodiversidad: {
    label: 'Biodiversidad',
    color: '#2D6A4F',
    icono: 'leaf',
    descripcion:
      'Ecosistemas, coberturas del suelo, páramos, áreas protegidas y registros de especies',
  },
  clima: {
    label: 'Cambio Climático',
    color: '#F39C12',
    icono: 'cloud',
    descripcion: 'Estaciones hidroclimatológicas, isoyetas y pisos térmicos del territorio',
  },
  suelos: {
    label: 'Suelos',
    color: '#8B6914',
    icono: 'layers',
    descripcion: 'Conflictos de uso del suelo y su relación con las actividades productivas',
  },
  territorio: {
    label: 'Territorio',
    color: '#1B4F72',
    icono: 'map-pin',
    descripcion:
      'División político-administrativa, resguardos indígenas y Paisaje Cultural Cafetero',
  },
}

// ─── Servicios oficiales ──────────────────────────────────────────────────────
// Verificados el 2026-10-05: todos responden GetMap sobre Sevilla en EPSG:3857.
// El antiguo GeoCVC (geo.cvc.gov.co) y geoservicios.igac.gov.co / geoserver.ideam.gov.co
// ya no existen; estas son sus direcciones vigentes.

export const PORTAL_GEOCVC = 'https://portal-geo.cvc.gov.co'
const CVC_WMS = `${PORTAL_GEOCVC}/server/services`
const IDEAM_WMS = 'https://visualizador.ideam.gov.co/gisserver/services'
const IGAC_WMS = 'https://mapas.igac.gov.co/server/services'

/** Capas GeoJSON extraídas de la CVC con scripts/datos/build_capas_oficiales.py */
const cvc = (conjunto: string): FuenteCapa => ({
  entidad: 'CVC',
  detalle: `${conjunto} (Portal GeoCVC), recortado a Sevilla`,
  url: PORTAL_GEOCVC,
})

/** Capas sin registros oficiales para Sevilla: elaboradas por el equipo para el prototipo */
const ILUSTRATIVO: FuenteCapa = {
  entidad: 'Equipo del proyecto',
  detalle:
    'Datos ilustrativos elaborados para el prototipo. No provienen de una fuente oficial; se reemplazarán con la cartografía social de la tesis colaboradora.',
  ilustrativo: true,
}

export const LAYERS: LayerConfig[] = [
  // ── ACTORES SOCIALES ────────────────────────────────────────────────────────
  {
    id: 'actores_humedales',
    nombre: 'Actores — Humedales',
    categoria: 'actores',
    tipo: 'geojson',
    url: '/data/actores/actores_humedales.json',
    estilo: { color: '#6D4C41', fillColor: '#6D4C41', fillOpacity: 0.7, weight: 1.5, radius: 8 },
    visibleDefault: false,
    fichaId: 'actores_humedales',
    atributosPopup: ['nombre', 'tipo_actor', 'ecosistema'],
    miniatura: '/images/actores/humedales_thumb.webp',
    descripcionBreve: 'Tipos de actores con incidencia en los humedales',
    fuente: ILUSTRATIVO,
  },
  {
    id: 'actores_paramo',
    nombre: 'Actores — Páramo',
    categoria: 'actores',
    tipo: 'geojson',
    url: '/data/actores/actores_paramo.json',
    estilo: { color: '#6D4C41', fillColor: '#8D6E63', fillOpacity: 0.7, weight: 1.5, radius: 8 },
    visibleDefault: false,
    fichaId: 'actores_paramo',
    atributosPopup: ['nombre', 'tipo_actor', 'ecosistema'],
    miniatura: '/images/actores/paramo_thumb.webp',
    descripcionBreve: 'Tipos de actores en la alta montaña de Sevilla',
    fuente: ILUSTRATIVO,
  },
  {
    id: 'actores_bosque_andino',
    nombre: 'Actores — Bosque Andino',
    categoria: 'actores',
    tipo: 'geojson',
    url: '/data/actores/actores_bosque_andino.json',
    estilo: { color: '#5D4037', fillColor: '#5D4037', fillOpacity: 0.7, weight: 1.5, radius: 8 },
    visibleDefault: false,
    fichaId: 'actores_bosque_andino',
    atributosPopup: ['nombre', 'categoria', 'rol', 'ambito'],
    miniatura: '/images/actores/bosque_andino_thumb.webp',
    descripcionBreve: 'Entidades públicas registradas por la CVC en Sevilla',
    fuente: cvc('Actores sociales del bosque de zona andina'),
  },
  {
    id: 'actores_bosque_seco',
    nombre: 'Actores — Bosque Seco',
    categoria: 'actores',
    tipo: 'geojson',
    url: '/data/actores/actores_bosque_seco.json',
    estilo: { color: '#4E342E', fillColor: '#4E342E', fillOpacity: 0.7, weight: 1.5, radius: 8 },
    visibleDefault: false,
    fichaId: 'actores_bosque_seco',
    atributosPopup: ['nombre', 'tipo_actor', 'ecosistema'],
    miniatura: '/images/actores/bosque_seco_thumb.webp',
    descripcionBreve: 'Tipos de actores en las zonas bajas y secas',
    fuente: ILUSTRATIVO,
  },

  // ── AGUA ────────────────────────────────────────────────────────────────────
  {
    id: 'agua_cuencas',
    nombre: 'Cuencas Hidrográficas',
    categoria: 'agua',
    tipo: 'geojson',
    url: '/data/agua/cuencas.json',
    estilo: { color: '#2E86C1', fillColor: '#5DADE2', fillOpacity: 0.35, weight: 2 },
    visibleDefault: true,
    fichaId: 'agua_cuencas',
    atributosPopup: ['nombre', 'subzona_hidrografica', 'area_en_sevilla_ha'],
    miniatura: '/images/agua/cuencas_thumb.webp',
    descripcionBreve: 'Bugalagrande, La Paila, Las Cañas y La Vieja dentro del municipio',
    fuente: cvc('Cuencas hidrográficas'),
  },
  {
    id: 'agua_red_hidrica',
    nombre: 'Red Hídrica',
    categoria: 'agua',
    tipo: 'wms',
    url: `${CVC_WMS}/Agua/Red_Hidrica/MapServer/WMSServer`,
    wmsLayers: '0,1,2',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'agua_red_hidrica',
    miniatura: '/images/agua/red_hidrica_thumb.webp',
    descripcionBreve: 'Ríos, quebradas y otros drenajes del Valle del Cauca',
    fuente: {
      entidad: 'CVC',
      detalle: 'Red Hídrica — servicio WMS del Portal GeoCVC',
      url: PORTAL_GEOCVC,
    },
  },
  {
    id: 'agua_humedales',
    nombre: 'Humedales',
    categoria: 'agua',
    tipo: 'geojson',
    url: '/data/agua/humedales.json',
    estilo: { color: '#0277BD', fillColor: '#29B6F6', fillOpacity: 0.45, weight: 1.5 },
    visibleDefault: false,
    fichaId: 'agua_humedales',
    atributosPopup: ['nombre', 'categoria', 'origen', 'area_ha'],
    miniatura: '/images/agua/humedales_thumb.webp',
    descripcionBreve: 'Humedal Siracusa, inventariado por la CVC',
    fuente: cvc('Huella de humedales'),
  },
  {
    id: 'agua_calidad',
    nombre: 'Calidad del Agua',
    categoria: 'agua',
    tipo: 'geojson',
    url: '/data/agua/calidad_agua.json',
    estilo: { color: '#006064', fillColor: '#00ACC1', fillOpacity: 0.8, weight: 1.5, radius: 10 },
    visibleDefault: false,
    fichaId: 'agua_calidad',
    atributosPopup: ['estacion', 'corriente', 'altitud_msnm'],
    miniatura: '/images/agua/calidad_thumb.webp',
    descripcionBreve: 'Estaciones de muestreo en las quebradas San José y Las Cañas',
    fuente: cvc('Estaciones de muestreo de calidad del agua'),
  },
  {
    id: 'agua_monitoreo_subterraneo',
    nombre: 'Monitoreo Subterráneo',
    categoria: 'agua',
    tipo: 'geojson',
    url: '/data/agua/monitoreo_subterraneo.json',
    estilo: { color: '#01579B', fillColor: '#039BE5', fillOpacity: 0.9, weight: 2, radius: 10 },
    visibleDefault: false,
    fichaId: 'agua_monitoreo_subterraneo',
    atributosPopup: ['codigo_pozo', 'estado', 'profundidad_m', 'actividad_monitoreo'],
    miniatura: '/images/agua/monitoreo_thumb.webp',
    descripcionBreve: 'Pozo de monitoreo de agua subterránea vs-pm-1',
    fuente: cvc('Pozos de monitoreo de agua subterránea'),
  },
  {
    id: 'agua_predios_art111',
    nombre: 'Predios Art. 111 Ley 99/93',
    categoria: 'agua',
    tipo: 'geojson',
    url: '/data/agua/predios_art111.json',
    estilo: { color: '#1B4F72', fillColor: '#2E86C1', fillOpacity: 0.3, weight: 2 },
    visibleDefault: false,
    fichaId: 'agua_predios_art111',
    atributosPopup: ['corregimiento', 'cuenca', 'area_ha', 'ecosistema'],
    miniatura: '/images/agua/predios_thumb.webp',
    descripcionBreve: 'Predios adquiridos para proteger fuentes que abastecen acueductos',
    fuente: cvc('Predios Art. 111 Ley 99 de 1993'),
  },

  // ── BIODIVERSIDAD ───────────────────────────────────────────────────────────
  {
    id: 'biodiversidad_cobertura_50k',
    nombre: 'Cobertura de la Tierra 2024',
    categoria: 'biodiversidad',
    tipo: 'wms',
    url: `${IDEAM_WMS}/Estado_Cobertura_Tierra/MapServer/WMSServer`,
    wmsLayers: '1',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'biodiversidad_cobertura',
    miniatura: '/images/biodiversidad/cobertura_thumb.webp',
    descripcionBreve:
      'Corine Land Cover 1:100.000: territorios artificializados, agrícolas y naturales',
    fuente: {
      entidad: 'IDEAM',
      detalle: 'Cobertura de la tierra 1:100.000, periodo 2024 (Corine Land Cover) — servicio WMS',
      url: 'https://visualizador.ideam.gov.co',
    },
  },
  {
    id: 'biodiversidad_ecosistemas',
    nombre: 'Ecosistemas',
    categoria: 'biodiversidad',
    tipo: 'wms',
    url: `${CVC_WMS}/Biodiversidad/Ecosistemas/MapServer/WMSServer`,
    wmsLayers: '1',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'biodiversidad_ecosistemas',
    miniatura: '/images/biodiversidad/ecosistemas_thumb.webp',
    descripcionBreve: 'Ecosistemas del Valle del Cauca según clima, relieve y suelo',
    fuente: {
      entidad: 'CVC',
      detalle: 'Ecosistemas — servicio WMS del Portal GeoCVC',
      url: PORTAL_GEOCVC,
    },
  },
  {
    id: 'biodiversidad_paramos',
    nombre: 'Páramos',
    categoria: 'biodiversidad',
    tipo: 'geojson',
    url: '/data/biodiversidad/paramos.json',
    estilo: { color: '#2E7D32', fillColor: '#66BB6A', fillOpacity: 0.35, weight: 2 },
    visibleDefault: false,
    fichaId: 'biodiversidad_paramos',
    atributosPopup: ['complejo', 'resolucion', 'area_en_sevilla_ha'],
    miniatura: '/images/biodiversidad/paramos_thumb.webp',
    descripcionBreve: 'Complejos de páramo Las Hermosas y Chilí-Barragán delimitados por el MADS',
    fuente: cvc('Páramos'),
  },
  {
    id: 'biodiversidad_especies',
    nombre: 'Registro de Especies',
    categoria: 'biodiversidad',
    tipo: 'geojson',
    url: '/data/biodiversidad/especies.json',
    estilo: { color: '#1B5E20', fillColor: '#43A047', fillOpacity: 0.85, weight: 1, radius: 7 },
    visibleDefault: false,
    fichaId: 'biodiversidad_especies',
    atributosPopup: ['nombre_cientifico', 'nombre_comun', 'familia', 'localidad'],
    miniatura: '/images/biodiversidad/especies_thumb.webp',
    descripcionBreve: 'Registros biológicos de flora documentados por la CVC en Sevilla',
    fuente: cvc('Registro de especies'),
  },
  {
    id: 'biodiversidad_areas_protegidas',
    nombre: 'Áreas Protegidas',
    categoria: 'biodiversidad',
    tipo: 'geojson',
    url: '/data/biodiversidad/areas_protegidas.json',
    estilo: { color: '#33691E', fillColor: '#8BC34A', fillOpacity: 0.3, weight: 2 },
    visibleDefault: false,
    fichaId: 'biodiversidad_areas_protegidas',
    atributosPopup: ['nombre', 'categoria', 'acto_administrativo', 'area_en_sevilla_ha'],
    miniatura: '/images/biodiversidad/areas_protegidas_thumb.webp',
    descripcionBreve: 'PNN Las Hermosas, DRMI, reservas de la sociedad civil y Reserva Ley 2.ª',
    fuente: cvc('Sistema de áreas protegidas y Reserva Forestal Ley 2.ª de 1959'),
  },
  {
    id: 'biodiversidad_zonificacion_forestal',
    nombre: 'Zonificación Forestal',
    categoria: 'biodiversidad',
    tipo: 'wms',
    url: `${CVC_WMS}/Biodiversidad/Uso_Potencial__Zonificacion_Forestal/MapServer/WMSServer`,
    wmsLayers: '0',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'biodiversidad_zonificacion_forestal',
    miniatura: '/images/biodiversidad/zonificacion_thumb.webp',
    descripcionBreve: 'Uso potencial del suelo y zonificación forestal 1:100.000',
    fuente: {
      entidad: 'CVC',
      detalle: 'Uso potencial y zonificación forestal — servicio WMS del Portal GeoCVC',
      url: PORTAL_GEOCVC,
    },
  },

  // ── CAMBIO CLIMÁTICO ────────────────────────────────────────────────────────
  {
    id: 'clima_isoyetas',
    nombre: 'Isoyetas de Precipitación',
    categoria: 'clima',
    tipo: 'wms',
    url: `${CVC_WMS}/Cambio_Climatico/Precipitacion_Isoyetas_Multianuales_2016/MapServer/WMSServer`,
    wmsLayers: '25',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'clima_isoyetas',
    miniatura: '/images/clima/isoyetas_thumb.webp',
    descripcionBreve: 'Precipitación media anual (mm), isoyetas multianuales 2016 — zona Cauca',
    fuente: {
      entidad: 'CVC',
      detalle: 'Isoyetas multianuales 2016 — servicio WMS del Portal GeoCVC',
      url: PORTAL_GEOCVC,
    },
  },
  {
    id: 'clima_estaciones',
    nombre: 'Estaciones Hidroclimatológicas',
    categoria: 'clima',
    tipo: 'geojson',
    url: '/data/clima/estaciones_hidroclimatologicas.json',
    estilo: { color: '#E65100', fillColor: '#FF9800', fillOpacity: 0.9, weight: 2, radius: 10 },
    visibleDefault: false,
    fichaId: 'clima_estaciones',
    atributosPopup: ['nombre', 'codigo', 'tipo', 'estado'],
    miniatura: '/images/clima/estaciones_thumb.webp',
    descripcionBreve: 'Estaciones pluviométricas y pluviográficas de la red de la CVC',
    fuente: cvc('Red hidroclimatológica'),
  },
  {
    id: 'clima_pisos_termicos',
    nombre: 'Pisos Térmicos',
    categoria: 'clima',
    tipo: 'wms',
    url: `${IDEAM_WMS}/Clima_Temperatura/MapServer/WMSServer`,
    wmsLayers: '3',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'clima_pisos_termicos',
    miniatura: '/images/clima/pisos_termicos_thumb.webp',
    descripcionBreve: 'Temperatura media anual y pisos térmicos, de templado a páramo',
    fuente: {
      entidad: 'IDEAM',
      detalle: 'Temperatura media anual y pisos térmicos, periodo 1971–2000 — servicio WMS',
      url: 'https://visualizador.ideam.gov.co',
    },
    leyenda: [
      { color: '#FFFF73', etiqueta: 'Cálido · más de 24 °C' },
      { color: '#98E600', etiqueta: 'Templado · 18 a 24 °C' },
      { color: '#C2FBFE', etiqueta: 'Frío · 12 a 18 °C' },
      { color: '#BED2FF', etiqueta: 'Muy frío (páramo bajo) · 6 a 12 °C' },
      { color: '#0181FE', etiqueta: 'Extremadamente frío (páramo alto) · 0 a 6 °C' },
      { color: '#E600FF', etiqueta: 'Nival · menos de 0 °C' },
    ],
  },

  // ── SUELOS ──────────────────────────────────────────────────────────────────
  {
    id: 'suelos_conflictos_uso',
    nombre: 'Conflictos de Uso del Suelo',
    categoria: 'suelos',
    tipo: 'wms',
    url: `${IGAC_WMS}/agrologia/conflictos2012territorionacional/MapServer/WMSServer`,
    wmsLayers: '1',
    wmsFormat: 'image/png',
    visibleDefault: false,
    fichaId: 'suelos_conflictos_uso',
    miniatura: '/images/suelos/conflictos_thumb.webp',
    descripcionBreve: 'Uso adecuado, subutilización y sobreutilización de la tierra (2012)',
    fuente: {
      entidad: 'IGAC',
      detalle: 'Conflictos de uso de la tierra 2012, escala 1:100.000 — servicio WMS',
      url: 'https://mapas.igac.gov.co',
    },
    leyenda: [
      { color: '#B4FF1A', etiqueta: 'Uso adecuado o sin conflicto' },
      { color: '#FFFF1A', etiqueta: 'Subutilización (ligera, moderada o severa)' },
      { color: '#FF1A1A', etiqueta: 'Sobreutilización y otros conflictos' },
      { color: '#D1D1D1', etiqueta: 'Áreas protegidas, zona urbana o sin determinar' },
      { color: '#A1DFF3', etiqueta: 'Cuerpos de agua' },
    ],
  },

  // ── TERRITORIO ADMINISTRATIVO ────────────────────────────────────────────────
  {
    id: 'territorio_division',
    nombre: 'División Político-Administrativa',
    categoria: 'territorio',
    tipo: 'geojson',
    url: '/data/territorio/division_administrativa.json',
    estilo: { color: '#1B4F72', fillColor: '#2980B9', fillOpacity: 0.1, weight: 2, dashArray: '4' },
    visibleDefault: true,
    fichaId: 'territorio_division',
    atributosPopup: ['nombre', 'clase', 'codigo', 'area_km2'],
    miniatura: '/images/territorio/division_thumb.webp',
    descripcionBreve: 'Corregimientos y cabecera municipal de Sevilla',
    fuente: cvc('División político-administrativa'),
  },
  {
    id: 'territorio_resguardos',
    nombre: 'Resguardos Indígenas',
    categoria: 'territorio',
    tipo: 'geojson',
    url: '/data/territorio/resguardos.json',
    estilo: { color: '#1A237E', fillColor: '#3F51B5', fillOpacity: 0.3, weight: 2 },
    visibleDefault: false,
    fichaId: 'territorio_resguardos',
    atributosPopup: ['nombre', 'pueblo', 'acto_administrativo', 'area_ha'],
    miniatura: '/images/territorio/resguardos_thumb.webp',
    descripcionBreve: 'Resguardo Indígena Ancore Drua (pueblo Embera Chamí)',
    fuente: cvc('Resguardos indígenas — Agencia Nacional de Tierras'),
  },
  {
    id: 'territorio_pcc',
    nombre: 'Paisaje Cultural Cafetero',
    categoria: 'territorio',
    tipo: 'geojson',
    url: '/data/territorio/pcc.json',
    estilo: { color: '#283593', fillColor: '#7986CB', fillOpacity: 0.25, weight: 2 },
    visibleDefault: false,
    fichaId: 'territorio_pcc',
    atributosPopup: ['zona', 'documento', 'area_en_sevilla_ha'],
    miniatura: '/images/territorio/pcc_thumb.webp',
    descripcionBreve: 'Área principal y de amortiguamiento del PCC (UNESCO 2011)',
    fuente: cvc('Paisaje Cultural Cafetero'),
  },
]

export const MAPA_BASE_URLS = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  esri: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

export const MAPA_BASE_ATTRIBUTION = {
  osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  esri: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  topo: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

// Vista inicial: todo el municipio (límite oficial de la CVC), no solo el casco urbano
export const SEVILLA_CENTER: [number, number] = [4.16, -75.89]
export const SEVILLA_DEFAULT_ZOOM = 11
export const SEVILLA_MIN_ZOOM = 10
export const SEVILLA_MAX_ZOOM = 18
// Extensión del límite municipal oficial (CVC): lat 3,90–4,41 · lon −76,04 a −75,74
export const SEVILLA_BOUNDS: [[number, number], [number, number]] = [
  [3.88, -76.06],
  [4.43, -75.72],
]

/** URL de la leyenda (GetLegendGraphic) de una subcapa WMS */
export function wmsLegendUrl(layer: LayerConfig, subcapa: string): string {
  const params = new URLSearchParams({
    service: 'WMS',
    request: 'GetLegendGraphic',
    version: '1.3.0',
    format: 'image/png',
    sld_version: '1.1.0',
    layer: subcapa,
  })
  return `${layer.url}?${params}`
}
