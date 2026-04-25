import { useMapContext } from '../context/MapContext'

interface MapToolbarProps {
  panelCollapsed: boolean
  onTogglePanel: () => void
}

export default function MapToolbar({ panelCollapsed, onTogglePanel }: MapToolbarProps) {
  const { state, dispatch } = useMapContext()

  const bases: { key: typeof state.mapaBase; label: string }[] = [
    { key: 'osm', label: 'Callejero' },
    { key: 'esri', label: 'Satélite' },
    { key: 'topo', label: 'Topográfico' },
  ]

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
      {/* Selector mapa base */}
      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        {bases.map(b => (
          <button
            key={b.key}
            onClick={() => dispatch({ type: 'SET_MAPA_BASE', base: b.key })}
            className={`block w-full px-3 py-1.5 text-xs text-left transition-colors ${
              state.mapaBase === b.key
                ? 'bg-verde-bosque text-white font-semibold'
                : 'text-gris-texto hover:bg-gray-50'
            }`}
            aria-pressed={state.mapaBase === b.key}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Toggle panel capas */}
      <button
        onClick={onTogglePanel}
        aria-label="Mostrar/ocultar panel de capas"
        className="bg-white border border-gray-200 rounded shadow px-3 py-1.5 text-xs text-gris-texto hover:bg-gray-50 transition-colors text-left"
      >
        {panelCollapsed ? '☰ Capas' : '✕ Capas'}
      </button>
    </div>
  )
}
