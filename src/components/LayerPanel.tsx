import { useState } from 'react'
import { useMapLayers } from '../hooks/useMapLayers'
import type { Categoria, LayerConfig } from '../types'

// ─── Category icons ───────────────────────────────────────────────────────────

const CATEGORIA_ICONS: Record<Categoria, React.ReactNode> = {
  actores: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="w-3.5 h-3.5"
    >
      <circle cx="6" cy="5" r="2" />
      <path strokeLinecap="round" d="M2 13c0-2.2 1.8-4 4-4" />
      <circle cx="11" cy="5" r="2" />
      <path strokeLinecap="round" d="M14 13c0-2.2-1.8-4-4-4" />
    </svg>
  ),
  agua: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="w-3.5 h-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2C8 2 3 7 3 10.5a5 5 0 0010 0C13 7 8 2 8 2z"
      />
    </svg>
  ),
  biodiversidad: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="w-3.5 h-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13C3 13 4 6 8 4c4-2 7 1 5 5s-6 2-6 2"
      />
      <path strokeLinecap="round" d="M8 13V9" />
    </svg>
  ),
  clima: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="w-3.5 h-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10a4 4 0 017.8-1.2A3 3 0 1112 15H4a3 3 0 01-1-5.8"
      />
    </svg>
  ),
  suelos: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="w-3.5 h-3.5"
    >
      <path strokeLinecap="round" d="M2 5h12M2 8.5h12M2 12h12" />
    </svg>
  ),
  territorio: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="w-3.5 h-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z"
      />
      <circle cx="8" cy="6" r="1.2" />
    </svg>
  ),
}

interface LayerPanelProps {
  collapsed: boolean
  onToggleCollapse: () => void
  highlightCategoria?: string | null
}

const CATEGORIA_ORDER: Categoria[] = [
  'actores',
  'agua',
  'biodiversidad',
  'clima',
  'suelos',
  'territorio',
]

export default function LayerPanel({
  collapsed,
  onToggleCollapse,
  highlightCategoria,
}: LayerPanelProps) {
  const {
    categorias,
    layersByCategory,
    isLayerActive,
    toggleLayer,
    toggleCategory,
    isCategoryFullyActive,
    isCategoryPartiallyActive,
    countByCategory,
    setLayerOpacity,
    getLayerOpacity,
  } = useMapLayers()

  const defaultExpanded = new Set<Categoria>(['agua', 'territorio'])
  if (highlightCategoria && CATEGORIA_ORDER.includes(highlightCategoria as Categoria)) {
    defaultExpanded.add(highlightCategoria as Categoria)
  }
  const [expanded, setExpanded] = useState<Set<Categoria>>(defaultExpanded)

  const toggleAccordion = (cat: Categoria) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  return (
    <>
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir panel de capas' : 'Colapsar panel de capas'}
        className="absolute top-3 z-10 bg-white border border-gray-200 rounded p-1.5 shadow hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque"
        style={{ left: collapsed ? '8px' : 'calc(var(--panel-width) + 8px)' }}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-3.5 h-3.5 text-gris-texto"
        >
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4l4 4-4 4" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 4L6 8l4 4" />
          )}
        </svg>
      </button>

      <aside
        className="layer-panel absolute top-0 left-0 z-10 flex flex-col"
        style={{
          transform: collapsed ? `translateX(calc(-1 * var(--panel-width)))` : 'translateX(0)',
        }}
        aria-label="Panel de capas geográficas"
      >
        <div className="px-4 py-3 border-b border-gray-100 bg-verde-bosque text-white">
          <h2 className="text-sm font-bold uppercase tracking-wide">Capas Geográficas</h2>
          <p className="text-xs text-verde-palido mt-0.5">Selecciona las capas a visualizar</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CATEGORIA_ORDER.map(cat => {
            const info = categorias[cat]
            const layers = layersByCategory(cat)
            const count = countByCategory(cat)
            const open = expanded.has(cat)
            const fullyActive = isCategoryFullyActive(cat)
            const partiallyActive = isCategoryPartiallyActive(cat)

            return (
              <div key={cat} className="border-b border-gray-100">
                <div
                  className={`flex items-center ${cat === highlightCategoria ? 'bg-yellow-50' : ''}`}
                >
                  {/* Category-level toggle */}
                  <div className="pl-3 pr-1 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={fullyActive}
                      ref={el => {
                        if (el) el.indeterminate = partiallyActive
                      }}
                      onChange={e => {
                        e.stopPropagation()
                        toggleCategory(cat)
                      }}
                      onClick={e => e.stopPropagation()}
                      aria-label={`Activar todas las capas de ${info.label}`}
                      style={{ accentColor: info.color }}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Accordion toggle */}
                  <button
                    onClick={() => toggleAccordion(cat)}
                    className="flex-1 flex items-center justify-between px-2 py-3 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-verde-bosque"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex-shrink-0"
                        style={{ color: info.color }}
                        aria-hidden="true"
                      >
                        {CATEGORIA_ICONS[cat]}
                      </span>
                      <span className="text-sm font-semibold text-gris-texto">{info.label}</span>
                      {count > 0 && (
                        <span
                          className="text-xs text-white px-1.5 py-0.5 rounded-full leading-none"
                          style={{ backgroundColor: info.color }}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`w-3.5 h-3.5 text-gray-400 mr-2 transition-transform ${open ? 'rotate-180' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
                    </svg>
                  </button>
                </div>

                {open && (
                  <div className="pb-2">
                    {layers.map(layer => (
                      <LayerItem
                        key={layer.id}
                        layer={layer}
                        active={isLayerActive(layer.id)}
                        onToggle={() => toggleLayer(layer.id)}
                        color={info.color}
                        opacity={getLayerOpacity(layer.id)}
                        onOpacityChange={v => setLayerOpacity(layer.id, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-center">
          Fuentes: CVC · IGAC · IDEAM · GBIF
        </div>
      </aside>
    </>
  )
}

function LayerItem({
  layer,
  active,
  onToggle,
  color,
  opacity,
  onOpacityChange,
}: {
  layer: LayerConfig
  active: boolean
  onToggle: () => void
  color: string
  opacity: number
  onOpacityChange: (v: number) => void
}) {
  const isPoint = (layer.estilo?.radius ?? 0) > 0
  const isGeoJSON = layer.tipo === 'geojson'

  return (
    <div className="px-4 py-2 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={active}
          onChange={onToggle}
          className="mt-1 flex-shrink-0 rounded cursor-pointer"
          style={{ accentColor: color }}
          aria-label={`Activar capa ${layer.nombre}`}
        />
        {/* Legend swatch */}
        <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
          {isPoint ? (
            <div
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{
                backgroundColor: layer.estilo?.fillColor ?? color,
                opacity: active ? 1 : 0.4,
              }}
            />
          ) : (
            <div
              className="w-4 h-3 rounded-sm border shadow-sm"
              style={{
                backgroundColor: layer.estilo?.fillColor ?? color,
                borderColor: layer.estilo?.color ?? color,
                opacity: active ? 1 : 0.4,
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gris-texto font-medium leading-tight">{layer.nombre}</div>
          {layer.descripcionBreve && (
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">
              {layer.descripcionBreve}
            </div>
          )}
        </div>
        {active && isGeoJSON && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent(`zoomToLayer:${layer.id}`))}
            aria-label={`Zoom a extensión de ${layer.nombre}`}
            title="Zoom a extensión"
            className="flex-shrink-0 text-gray-400 hover:text-verde-bosque transition-colors mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque rounded p-0.5"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2 2h4M2 2v4M14 2h-4M14 2v4M2 14h4M2 14v-4M14 14h-4M14 14v-4"
              />
            </svg>
          </button>
        )}
      </div>

      {active && (
        <div className="mt-1.5 flex items-center gap-2 pl-7">
          <span className="text-xs text-gray-400 w-14">Opacidad</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            onChange={e => onOpacityChange(Number(e.target.value))}
            className="flex-1 h-1"
            style={{ accentColor: color }}
            aria-label={`Opacidad de ${layer.nombre}`}
          />
          <span className="text-xs text-gray-400 w-8 text-right">{Math.round(opacity * 100)}%</span>
        </div>
      )}
    </div>
  )
}
