import { useState } from 'react'
import { useMapLayers } from '../hooks/useMapLayers'
import type { Categoria, LayerConfig } from '../types'

interface LayerPanelProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const CATEGORIA_ORDER: Categoria[] = [
  'actores', 'agua', 'biodiversidad', 'clima', 'suelos', 'territorio',
]

export default function LayerPanel({ collapsed, onToggleCollapse }: LayerPanelProps) {
  const { categorias, layersByCategory, isLayerActive, toggleLayer, countByCategory } = useMapLayers()
  const [expanded, setExpanded] = useState<Set<Categoria>>(new Set(['agua', 'territorio']))

  const toggleCategoria = (cat: Categoria) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <>
      {/* Botón colapsar */}
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir panel de capas' : 'Colapsar panel de capas'}
        className="absolute top-3 left-3 z-10 bg-white border border-gray-200 rounded p-1.5 shadow hover:bg-gray-50 transition-colors"
        style={{ left: collapsed ? '8px' : 'calc(var(--panel-width) + 8px)' }}
      >
        <span className="text-gris-texto text-xs font-mono">
          {collapsed ? '›' : '‹'}
        </span>
      </button>

      <aside
        className="layer-panel absolute top-0 left-0 z-10 flex flex-col"
        style={{ transform: collapsed ? `translateX(calc(-1 * var(--panel-width)))` : 'translateX(0)' }}
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

            return (
              <div key={cat} className="border-b border-gray-100">
                <button
                  onClick={() => toggleCategoria(cat)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
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
                  <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
                </button>

                {open && (
                  <div className="pb-2">
                    {layers.map(layer => (
                      <LayerItem
                        key={layer.id}
                        layer={layer}
                        active={isLayerActive(layer.id)}
                        onToggle={() => toggleLayer(layer.id)}
                        color={info.color}
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
}: {
  layer: LayerConfig
  active: boolean
  onToggle: () => void
  color: string
}) {
  return (
    <label className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer group">
      <input
        type="checkbox"
        checked={active}
        onChange={onToggle}
        className="mt-0.5 flex-shrink-0 rounded"
        style={{ accentColor: color }}
        aria-label={`Activar capa ${layer.nombre}`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gris-texto font-medium leading-tight">{layer.nombre}</div>
        {layer.descripcionBreve && (
          <div className="text-xs text-gray-400 mt-0.5 leading-tight">{layer.descripcionBreve}</div>
        )}
        <div className="text-xs text-gray-300 mt-0.5 uppercase tracking-wide">{layer.tipo}</div>
      </div>
    </label>
  )
}
