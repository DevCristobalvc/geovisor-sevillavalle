import { useMapContext } from '../context/MapContext'

interface MapToolbarProps {
  panelCollapsed: boolean
  onTogglePanel: () => void
  isMeasuring: boolean
  onToggleMeasure: () => void
  onExportPNG: () => void
  isFeatureSearchOpen: boolean
  onToggleFeatureSearch: () => void
}

export default function MapToolbar({
  panelCollapsed,
  onTogglePanel,
  isMeasuring,
  onToggleMeasure,
  onExportPNG,
  isFeatureSearchOpen,
  onToggleFeatureSearch,
}: MapToolbarProps) {
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
            className={`block w-full px-3 py-1.5 text-xs text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-verde-bosque ${
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
        className="bg-white border border-gray-200 rounded shadow px-3 py-1.5 text-xs text-gris-texto hover:bg-gray-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque"
      >
        {panelCollapsed ? '☰ Capas' : '✕ Capas'}
      </button>

      {/* Buscar en capas */}
      <button
        onClick={onToggleFeatureSearch}
        aria-label="Buscar dentro de capas activas"
        aria-pressed={isFeatureSearchOpen}
        className={`border rounded shadow px-3 py-1.5 text-xs transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque ${
          isFeatureSearchOpen
            ? 'bg-verde-bosque text-white border-verde-bosque'
            : 'bg-white border-gray-200 text-gris-texto hover:bg-gray-50'
        }`}
      >
        🔍 Buscar
      </button>

      {/* Herramienta de medición */}
      <button
        onClick={onToggleMeasure}
        aria-label={isMeasuring ? 'Desactivar herramienta de medición' : 'Medir distancia y área'}
        aria-pressed={isMeasuring}
        className={`border rounded shadow px-3 py-1.5 text-xs transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque ${
          isMeasuring
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white border-gray-200 text-gris-texto hover:bg-gray-50'
        }`}
      >
        {isMeasuring ? '📏 Midiendo…' : '📏 Medir'}
      </button>

      {/* Exportar PNG */}
      <button
        onClick={onExportPNG}
        aria-label="Exportar vista del mapa como imagen PNG"
        className="bg-white border border-gray-200 rounded shadow px-3 py-1.5 text-xs text-gris-texto hover:bg-gray-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque"
      >
        ⬇ Exportar PNG
      </button>
    </div>
  )
}
