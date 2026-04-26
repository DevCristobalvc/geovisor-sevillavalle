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

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconLayers() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3.5 h-3.5 inline-block mr-1.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 5.5L8 2l7 3.5-7 3.5-7-3.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 9.5l7 3.5 7-3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12.5l7 3.5 7-3.5" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3.5 h-3.5 inline-block mr-1.5"
    >
      <circle cx="6.5" cy="6.5" r="4" />
      <path strokeLinecap="round" d="M10 10l3 3" />
    </svg>
  )
}

function IconRuler() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3.5 h-3.5 inline-block mr-1.5"
    >
      <rect x="1" y="5" width="14" height="6" rx="1" />
      <path strokeLinecap="round" d="M4 5V8M7 5V7M10 5V8M13 5V7" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3.5 h-3.5 inline-block mr-1.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v8M5 7l3 3 3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h12" />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

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
        className="bg-white border border-gray-200 rounded shadow px-3 py-1.5 text-xs text-gris-texto hover:bg-gray-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque flex items-center"
      >
        <IconLayers />
        Capas
      </button>

      {/* Buscar en capas */}
      <button
        onClick={onToggleFeatureSearch}
        aria-label="Buscar dentro de capas activas"
        aria-pressed={isFeatureSearchOpen}
        className={`border rounded shadow px-3 py-1.5 text-xs transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque flex items-center ${
          isFeatureSearchOpen
            ? 'bg-verde-bosque text-white border-verde-bosque'
            : 'bg-white border-gray-200 text-gris-texto hover:bg-gray-50'
        }`}
      >
        <IconSearch />
        Buscar
      </button>

      {/* Herramienta de medición */}
      <button
        onClick={onToggleMeasure}
        aria-label={isMeasuring ? 'Desactivar herramienta de medición' : 'Medir distancia y área'}
        aria-pressed={isMeasuring}
        className={`border rounded shadow px-3 py-1.5 text-xs transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque flex items-center ${
          isMeasuring
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white border-gray-200 text-gris-texto hover:bg-gray-50'
        }`}
      >
        <IconRuler />
        {isMeasuring ? 'Midiendo…' : 'Medir'}
      </button>

      {/* Exportar PNG */}
      <button
        onClick={onExportPNG}
        aria-label="Exportar vista del mapa como imagen PNG"
        className="bg-white border border-gray-200 rounded shadow px-3 py-1.5 text-xs text-gris-texto hover:bg-gray-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque flex items-center"
      >
        <IconDownload />
        Exportar PNG
      </button>
    </div>
  )
}
