export type LayerType = 'geojson' | 'wms' | 'xyz'

export type Categoria =
  | 'actores'
  | 'agua'
  | 'biodiversidad'
  | 'clima'
  | 'suelos'
  | 'territorio'

export interface LayerStyle {
  color: string
  weight?: number
  fillOpacity?: number
  fillColor?: string
  dashArray?: string
  radius?: number
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
  fuente_datos: string
  nivel_educativo: string
}

export interface RecorridoParada {
  feature_id: string
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
  mapaBase: 'osm' | 'esri' | 'topo' | 'dark'
}
