import { useState, type ReactNode } from 'react'
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

// ─── Íconos pixelados (8×8) ───────────────────────────────────────────────────

const ICONO: Record<string, string> = {
  capas: 'M3 0h2v1h2v1h1v1H7v1H5v1H3V4H1V3H0V2h1V1h2zM0 5h1v1h2v1h2V6h2V5h1v1H7v1H5v1H3V7H1V6H0z',
  buscar: 'M1 0h4v1h1v4H5v1H1V5H0V1h1zM1 1v4h4V1zM5 5h1v1h1v1h1v1H7V7H6V6H5z',
  medir: 'M0 2h8v4H0zM1 3v2h6V3zM2 3h1v1H2zM4 3h1v1H4zM6 3h1v1H6z',
  exportar: 'M3 0h2v4h2v1H6v1H5v1H3V6H2V5H1V4h2zM0 7h8v1H0z',
  centrar: 'M3 0h2v2H3zM3 6h2v2H3zM0 3h2v2H0zM6 3h2v2H6zM3 3h2v2H3z',
}

function Icono({ nombre }: { nombre: keyof typeof ICONO }) {
  return (
    <svg
      viewBox="0 0 8 8"
      className="w-3.5 h-3.5 flex-shrink-0"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={ICONO[nombre]} />
    </svg>
  )
}

function BotonHerramienta({
  onClick,
  label,
  activo = false,
  aria,
  children,
}: {
  onClick: () => void
  label: string
  activo?: boolean
  aria?: { label?: string; pressed?: boolean }
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={aria?.label ?? label}
      aria-pressed={aria?.pressed}
      className={`flex w-full items-center gap-2 rounded-lg border-2 border-line px-3 py-1.5 font-ui text-xs font-semibold shadow-dex-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
        activo ? 'bg-accent text-on-accent' : 'bg-surface text-ink hover:bg-surface2'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MapToolbar({
  panelCollapsed: _panelCollapsed,
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

  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className="absolute top-3 right-3 z-[2] flex flex-col items-end">
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Mostrar herramientas' : 'Ocultar herramientas'}
        className="mb-2 rounded-lg border-2 border-line bg-surface p-1.5 text-ink shadow-dex-sm"
      >
        <svg
          viewBox="0 0 8 8"
          className="w-3.5 h-3.5"
          shapeRendering="crispEdges"
          fill="currentColor"
          aria-hidden="true"
        >
          {collapsed ? (
            <path d="M1 2h1v1H1zM2 3h1v1H2zM3 4h2v1H3zM5 3h1v1H5zM6 2h1v1H6z" />
          ) : (
            <path d="M1 5h1v1H1zM2 4h1v1H2zM3 3h2v1H3zM5 4h1v1H5zM6 5h1v1H6z" />
          )}
        </svg>
      </button>

      <div
        className={`flex w-36 flex-col gap-2 transition-all duration-200 origin-top ${
          collapsed ? 'pointer-events-none h-0 scale-y-0 opacity-0' : 'scale-y-100 opacity-100'
        }`}
      >
        {/* Mapa base: selector segmentado */}
        <div
          className="overflow-hidden rounded-lg border-2 border-line bg-surface shadow-dex-sm"
          role="group"
          aria-label="Mapa base"
        >
          {bases.map(b => (
            <button
              key={b.key}
              onClick={() => dispatch({ type: 'SET_MAPA_BASE', base: b.key })}
              className={`block w-full px-3 py-1.5 text-left font-ui text-xs transition-colors ${
                state.mapaBase === b.key
                  ? 'bg-ink text-bg font-semibold dark:bg-accent dark:text-on-accent'
                  : 'text-ink-soft hover:bg-surface2'
              }`}
              aria-pressed={state.mapaBase === b.key}
            >
              {state.mapaBase === b.key ? '▸ ' : ''}
              {b.label}
            </button>
          ))}
        </div>

        <BotonHerramienta
          onClick={onTogglePanel}
          label="Capas"
          aria={{ label: 'Mostrar/ocultar panel de capas' }}
        >
          <Icono nombre="capas" />
          Capas
        </BotonHerramienta>

        <BotonHerramienta
          onClick={onToggleFeatureSearch}
          label="Buscar"
          activo={isFeatureSearchOpen}
          aria={{ label: 'Buscar dentro de capas activas', pressed: isFeatureSearchOpen }}
        >
          <Icono nombre="buscar" />
          Buscar
        </BotonHerramienta>

        <BotonHerramienta
          onClick={onToggleMeasure}
          label="Medir"
          activo={isMeasuring}
          aria={{
            label: isMeasuring ? 'Desactivar herramienta de medición' : 'Medir distancia y área',
            pressed: isMeasuring,
          }}
        >
          <Icono nombre="medir" />
          {isMeasuring ? 'Midiendo…' : 'Medir'}
        </BotonHerramienta>

        <BotonHerramienta
          onClick={onExportPNG}
          label="Exportar PNG"
          aria={{ label: 'Exportar vista del mapa como imagen PNG' }}
        >
          <Icono nombre="exportar" />
          Exportar PNG
        </BotonHerramienta>

        <BotonHerramienta
          onClick={() => window.dispatchEvent(new CustomEvent('mapResetView'))}
          label="Ver municipio"
          aria={{ label: 'Centrar el mapa en el municipio de Sevilla' }}
        >
          <Icono nombre="centrar" />
          Ver municipio
        </BotonHerramienta>
      </div>
    </aside>
  )
}
