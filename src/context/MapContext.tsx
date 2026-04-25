import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { SEVILLA_CENTER, SEVILLA_DEFAULT_ZOOM } from '../config/layers.config'
import type { MapState } from '../types'

type MapAction =
  | { type: 'TOGGLE_LAYER'; id: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_CENTER'; center: [number, number] }
  | { type: 'SET_MAPA_BASE'; base: MapState['mapaBase'] }
  | { type: 'SET_STATE_FROM_URL'; state: Partial<MapState> }
  | { type: 'SET_LAYER_OPACITY'; id: string; opacity: number }

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'TOGGLE_LAYER': {
      const exists = state.capasActivas.includes(action.id)
      return {
        ...state,
        capasActivas: exists
          ? state.capasActivas.filter(id => id !== action.id)
          : [...state.capasActivas, action.id],
      }
    }
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom }
    case 'SET_CENTER':
      return { ...state, center: action.center }
    case 'SET_MAPA_BASE':
      return { ...state, mapaBase: action.base }
    case 'SET_STATE_FROM_URL':
      return { ...state, ...action.state }
    case 'SET_LAYER_OPACITY':
      return {
        ...state,
        capasOpacidad: { ...state.capasOpacidad, [action.id]: action.opacity },
      }
    default:
      return state
  }
}

const initialState: MapState = {
  center: SEVILLA_CENTER,
  zoom: SEVILLA_DEFAULT_ZOOM,
  capasActivas: ['agua_cuencas', 'territorio_division'],
  capasOpacidad: {},
  mapaBase: 'osm',
}

interface MapContextValue {
  state: MapState
  dispatch: React.Dispatch<MapAction>
  isLayerActive: (id: string) => boolean
  toggleLayer: (id: string) => void
  setLayerOpacity: (id: string, opacity: number) => void
  getLayerOpacity: (id: string) => number
}

const MapContext = createContext<MapContextValue | null>(null)

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialState)

  const isLayerActive = (id: string) => state.capasActivas.includes(id)
  const toggleLayer = (id: string) => dispatch({ type: 'TOGGLE_LAYER', id })
  const setLayerOpacity = (id: string, opacity: number) =>
    dispatch({ type: 'SET_LAYER_OPACITY', id, opacity })
  const getLayerOpacity = (id: string) => state.capasOpacidad[id] ?? 1

  return (
    <MapContext.Provider value={{ state, dispatch, isLayerActive, toggleLayer, setLayerOpacity, getLayerOpacity }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapProvider')
  return ctx
}
