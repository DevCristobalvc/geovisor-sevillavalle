export type LayerType = 'geojson' | 'wms' | 'xyz'

export type Categoria = 'actores' | 'agua' | 'biodiversidad' | 'clima' | 'suelos' | 'territorio'

export interface LayerStyle {
  color: string
  weight?: number
  fillOpacity?: number
  fillColor?: string
  dashArray?: string
  radius?: number
}

/** Estado de carga de una capa WMS, difundido con el evento `wmsStatus` */
export type WmsStatus = 'cargando' | 'ok' | 'error'

export interface LeyendaItem {
  color: string
  etiqueta: string
}

/** Procedencia de los datos de una capa, visible en el panel, el popup y la ficha. */
export interface FuenteCapa {
  /** Entidad productora, p. ej. "CVC" */
  entidad: string
  /** Conjunto de datos o servicio, p. ej. "Red Hídrica (GeoCVC)" */
  detalle: string
  /** Enlace al servicio o portal de origen */
  url?: string
  /**
   * true cuando los datos fueron elaborados por el equipo con fines de prototipo y no
   * provienen de una fuente oficial. La interfaz los rotula como "Ilustrativo".
   */
  ilustrativo?: boolean
}

export interface LayerConfig {
  id: string
  nombre: string
  categoria: Categoria
  tipo: LayerType
  url: string
  wmsLayers?: string
  wmsFormat?: string
  visibleDefault: boolean
  fichaId: string
  atributosPopup?: string[]
  miniatura?: string
  estilo?: LayerStyle
  descripcionBreve?: string
  fuente: FuenteCapa
  /** Leyenda propia (WMS). Si falta, se usa GetLegendGraphic del servicio. */
  leyenda?: LeyendaItem[]
}

export interface VocabularioItem {
  termino: string
  definicion: string
}

export interface GaleriaItem {
  url: string
  titulo: string
  credito: string
}

export interface VideoItem {
  youtube_id: string
  titulo: string
}

export interface FichaPedagogica {
  id: string
  titulo: string
  categoria: Categoria
  descripcion: string
  importancia: string
  preguntas_reflexivas: string[]
  vocabulario: VocabularioItem[]
  galeria: GaleriaItem[]
  videos: VideoItem[]
  /** Referencias del contenido pedagógico (no la procedencia de los datos de la capa) */
  fuente_datos: string
  nivel_educativo: string
}

export interface RecorridoParada {
  id: number
  titulo: string
  narracion: string
  lat: number
  lng: number
  zoom: number
}

export interface Recorrido {
  id: string
  titulo: string
  descripcion: string
  paradas: RecorridoParada[]
}

export interface MapState {
  center: [number, number]
  zoom: number
  capasActivas: string[]
  capasOpacidad: Record<string, number>
  mapaBase: 'osm' | 'esri' | 'topo' | 'dark'
}
