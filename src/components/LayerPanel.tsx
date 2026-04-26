import { useState } from 'react'
import { useMapLayers } from '../hooks/useMapLayers'
import type { Categoria, LayerConfig } from '../types'

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
        <span className="text-gris-texto text-xs font-mono">{collapsed ? '›' : '‹'}</span>
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
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
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
                    <span className="text-gray-400 text-xs mr-2">{open ? '▲' : '▼'}</span>
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
            className="flex-shrink-0 text-gray-400 hover:text-verde-bosque transition-colors text-xs mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque rounded"
          >
            ⊕
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
