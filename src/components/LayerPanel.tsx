import { useEffect, useState, type CSSProperties } from 'react'
import { useMapLayers } from '../hooks/useMapLayers'
import { LAYERS, wmsLegendUrl } from '../config/layers.config'
import { PixelIcon } from './Dex'
import type { Categoria, LayerConfig, WmsStatus } from '../types'

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

/** Número de dex de cada capa (#01–#23), según su orden en layers.config.ts */
const NUMERO = Object.fromEntries(
  LAYERS.map((l, i) => [l.id, `#${String(i + 1).padStart(2, '0')}`])
)

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
    activeLayers,
  } = useMapLayers()

  const defaultExpanded = new Set<Categoria>(['agua', 'territorio'])
  if (highlightCategoria && CATEGORIA_ORDER.includes(highlightCategoria as Categoria)) {
    defaultExpanded.add(highlightCategoria as Categoria)
  }
  const [expanded, setExpanded] = useState<Set<Categoria>>(defaultExpanded)
  const [wmsStatus, setWmsStatus] = useState<Record<string, WmsStatus>>({})

  // MapViewer informa si cada servicio WMS respondió (evento `wmsStatus`)
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, status } = (e as CustomEvent<{ id: string; status: WmsStatus }>).detail
      setWmsStatus(prev => (prev[id] === status ? prev : { ...prev, [id]: status }))
    }
    window.addEventListener('wmsStatus', handler)
    return () => window.removeEventListener('wmsStatus', handler)
  }, [])

  const toggleAccordion = (cat: Categoria) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const activas = activeLayers.length
  const segmentos = 23

  return (
    <>
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir panel de capas' : 'Colapsar panel de capas'}
        className="absolute top-3 z-10 rounded-lg border-2 border-line bg-surface p-1.5 text-ink shadow-dex-sm transition-[left] duration-300"
        style={{ left: collapsed ? '10px' : 'calc(var(--panel-width) + 10px)' }}
      >
        <svg
          viewBox="0 0 8 8"
          className="w-3.5 h-3.5"
          shapeRendering="crispEdges"
          fill="currentColor"
          aria-hidden="true"
        >
          {collapsed ? (
            <path d="M2 1h1v1H2zM3 2h1v1H3zM4 3h1v2H4zM3 5h1v1H3zM2 6h1v1H2z" />
          ) : (
            <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
          )}
        </svg>
      </button>

      <aside
        className="layer-panel absolute top-0 left-0 z-10 flex flex-col"
        style={{
          transform: collapsed
            ? `translateX(calc(-1 * var(--panel-width) - 4px))`
            : 'translateX(0)',
        }}
        aria-label="Panel de capas geográficas"
      >
        {/* Cabezal del dex */}
        <div className="border-b-2 border-line bg-surface2 px-4 py-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-pixel text-lg font-bold text-ink glow">Capas geográficas</h2>
            <span className="font-ui text-[11px] font-semibold text-muted">
              {String(activas).padStart(2, '0')}/{LAYERS.length} activas
            </span>
          </div>
          <div className="mt-2 flex gap-[2px]" aria-hidden="true">
            {Array.from({ length: segmentos }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-[1px] ${i < activas ? 'bg-accent' : 'bg-line/15'}`}
              />
            ))}
          </div>
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
              <div key={cat} className="border-b border-line-soft">
                <div
                  className={`flex items-center ${cat === highlightCategoria ? 'bg-accent-soft' : ''}`}
                >
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
                      className="h-4 w-4 cursor-pointer"
                      style={{ accentColor: info.color }}
                    />
                  </div>

                  <button
                    onClick={() => toggleAccordion(cat)}
                    className="flex-1 flex items-center justify-between px-2 py-2.5 hover:bg-surface2 transition-colors"
                    aria-expanded={open}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="tinta-tipo flex h-7 w-7 items-center justify-center rounded-md border-2 border-line"
                        style={
                          {
                            '--tipo': info.color,
                            backgroundColor: `${info.color}26`,
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <PixelIcon nombre={cat} className="w-4 h-4" />
                      </span>
                      <span className="font-ui text-sm font-semibold text-ink">{info.label}</span>
                      {count > 0 && (
                        <span className="rounded bg-accent px-1.5 py-px font-ui text-[10px] font-bold text-on-accent">
                          {count}
                        </span>
                      )}
                    </span>
                    <span
                      className={`mr-1 font-mono text-xs text-muted transition-transform ${open ? 'rotate-90' : ''}`}
                      aria-hidden="true"
                    >
                      ▶
                    </span>
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
                        status={wmsStatus[layer.id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t-2 border-line bg-surface2 px-4 py-2 text-center font-ui text-[11px] text-muted">
          Fuentes: CVC · IGAC · IDEAM
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
  status,
}: {
  layer: LayerConfig
  active: boolean
  onToggle: () => void
  color: string
  opacity: number
  onOpacityChange: (v: number) => void
  status?: WmsStatus
}) {
  const isPoint = (layer.estilo?.radius ?? 0) > 0
  const isGeoJSON = layer.tipo === 'geojson'
  const isWMS = layer.tipo === 'wms'
  const [legendOpen, setLegendOpen] = useState(false)

  const led =
    isWMS && active
      ? status === 'error'
        ? 'dex-led-error'
        : status === 'ok'
          ? 'dex-led-ok'
          : 'dex-led-warn animate-led-pulse'
      : null

  return (
    <div className={`px-3 py-2 ${active ? 'bg-accent-soft/60' : 'hover:bg-surface2'}`}>
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={active}
          onChange={onToggle}
          className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer"
          style={{ accentColor: color }}
          aria-label={`Activar capa ${layer.nombre}`}
        />
        <div className="mt-1 flex-shrink-0" aria-hidden="true">
          {isPoint ? (
            <div
              className="h-3 w-3 rounded-full border border-line/60"
              style={{ backgroundColor: layer.estilo?.fillColor ?? color }}
            />
          ) : (
            <div
              className="h-3 w-4 rounded-sm border"
              style={{
                backgroundColor: layer.estilo?.fillColor ?? color,
                borderColor: layer.estilo?.color ?? color,
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[10px] text-muted">{NUMERO[layer.id]}</span>
            <span className="font-ui text-sm font-medium text-ink leading-tight">
              {layer.nombre}
            </span>
          </div>
          {layer.descripcionBreve && (
            <div className="mt-0.5 text-xs text-ink-soft leading-snug">
              {layer.descripcionBreve}
            </div>
          )}
          <div className="mt-1 flex items-center gap-1.5" title={layer.fuente.detalle}>
            {layer.fuente.ilustrativo ? (
              <span className="dex-chip border-warn/50 bg-warn/10 text-warn">Ilustrativo</span>
            ) : (
              <span className="flex items-center gap-1.5 font-ui text-[10px] text-muted">
                {led && <span className={`dex-led ${led}`} aria-hidden="true" />}
                {layer.fuente.entidad} · {isWMS ? 'WMS en vivo' : 'GeoJSON'}
              </span>
            )}
          </div>
        </div>
        {active && isGeoJSON && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent(`zoomToLayer:${layer.id}`))}
            aria-label={`Zoom a extensión de ${layer.nombre}`}
            title="Zoom a extensión"
            className="mt-0.5 flex-shrink-0 rounded p-0.5 text-muted hover:text-accent transition-colors"
          >
            <svg
              viewBox="0 0 8 8"
              className="w-3.5 h-3.5"
              shapeRendering="crispEdges"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0 0h3v1H1v2H0zM5 0h3v3H7V1H5zM0 5h1v2h2v1H0zM7 5h1v3H5V7h2z" />
            </svg>
          </button>
        )}
      </div>

      {active && (
        <div className="mt-1.5 flex items-center gap-2 pl-[3.25rem]">
          <span className="w-14 font-ui text-[10px] uppercase tracking-wide text-muted">
            Opacidad
          </span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            onChange={e => onOpacityChange(Number(e.target.value))}
            className="h-1 flex-1"
            aria-label={`Opacidad de ${layer.nombre}`}
          />
          <span className="w-8 text-right font-mono text-[10px] text-muted">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      )}

      {active && isWMS && status === 'error' && (
        <p className="mt-1.5 pl-[3.25rem] font-ui text-xs text-danger leading-snug" role="status">
          El servicio de {layer.fuente.entidad} no respondió. Revisa la conexión o intenta más
          tarde.
        </p>
      )}

      {active && isWMS && (
        <div className="mt-1.5 pl-[3.25rem]">
          <button
            onClick={() => setLegendOpen(v => !v)}
            aria-expanded={legendOpen}
            className="font-ui text-xs font-semibold text-accent hover:underline rounded"
          >
            {legendOpen ? 'Ocultar leyenda' : 'Ver leyenda'}
          </button>
          {legendOpen && <WmsLegend layer={layer} />}
        </div>
      )}
    </div>
  )
}

function WmsLegend({ layer }: { layer: LayerConfig }) {
  if (layer.leyenda) {
    return (
      <ul className="mt-1.5 space-y-1" aria-label={`Leyenda de ${layer.nombre}`}>
        {layer.leyenda.map(item => (
          <li key={item.etiqueta} className="flex items-center gap-2 font-ui text-xs text-ink">
            <span
              className="h-3 w-3.5 flex-shrink-0 rounded-sm border border-line/50"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.etiqueta}
          </li>
        ))}
      </ul>
    )
  }

  // Sin leyenda propia: la imagen que publica el propio servicio (GetLegendGraphic)
  const subcapas = (layer.wmsLayers ?? '').split(',').filter(Boolean)
  return (
    <div className="mt-1.5 max-h-56 overflow-y-auto rounded-md border-2 border-line bg-white p-1">
      {subcapas.map(sub => (
        <img
          key={sub}
          src={wmsLegendUrl(layer, sub)}
          alt={`Leyenda de ${layer.nombre}`}
          loading="lazy"
          className="max-w-full"
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      ))}
    </div>
  )
}
