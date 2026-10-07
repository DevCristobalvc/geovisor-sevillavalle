import { useState, useEffect, type CSSProperties } from 'react'
import type { FichaPedagogica } from '../types'
import { CATEGORIAS, LAYERS } from '../config/layers.config'
import { PixelIcon } from './Dex'

interface InfoPanelProps {
  fichaId: string | null
  onClose: () => void
}

const PESTANAS = [
  { id: 'descripcion', label: 'Ficha' },
  { id: 'galeria', label: 'Galería' },
  { id: 'vocabulario', label: 'Vocabulario' },
] as const

type Pestana = (typeof PESTANAS)[number]['id']

export default function InfoPanel({ fichaId, onClose }: InfoPanelProps) {
  const [ficha, setFicha] = useState<FichaPedagogica | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Pestana>('descripcion')

  useEffect(() => {
    if (!fichaId) {
      setFicha(null)
      return
    }
    setLoading(true)
    setActiveTab('descripcion')
    fetch(`/fichas/${fichaId}.json`)
      .then(r => r.json())
      .then((data: FichaPedagogica) => setFicha(data))
      .catch(() => setFicha(null))
      .finally(() => setLoading(false))
  }, [fichaId])

  const isOpen = !!fichaId
  const indice = LAYERS.findIndex(l => l.fichaId === fichaId)
  const capa = indice >= 0 ? LAYERS[indice] : undefined

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const tipo = ficha ? CATEGORIAS[ficha.categoria] : null

  return (
    <div
      className={`ficha-panel ${isOpen ? 'open' : ''}`}
      role="complementary"
      aria-label="Ficha pedagógica"
      aria-hidden={!isOpen}
    >
      {/* Cabezal */}
      <div className="sticky top-0 z-10 border-b-2 border-line bg-surface2 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted">
              Ficha pedagógica{' '}
              {indice >= 0 ? `· Capa N.º ${String(indice + 1).padStart(2, '0')}` : ''}
            </p>
            <h2 className="mt-0.5 font-pixel text-xl font-bold leading-tight text-ink glow">
              {ficha ? ficha.titulo : 'Ficha pedagógica'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ficha pedagógica"
            className="flex-shrink-0 rounded-md border-2 border-line bg-surface p-1 text-ink"
          >
            <svg
              viewBox="0 0 8 8"
              className="w-3.5 h-3.5"
              shapeRendering="crispEdges"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M1 1h1v1H1zM2 2h1v1H2zM3 3h2v2H3zM5 2h1v1H5zM6 1h1v1H6zM2 5h1v1H2zM1 6h1v1H1zM5 5h1v1H5zM6 6h1v1H6z" />
            </svg>
          </button>
        </div>
        {tipo && ficha && (
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border-2 border-line px-2 py-0.5 font-ui text-[11px] font-bold"
            style={{ backgroundColor: `${tipo.color}26`, color: 'rgb(var(--c-ink))' }}
          >
            <span className="tinta-tipo" style={{ '--tipo': tipo.color } as CSSProperties}>
              <PixelIcon nombre={ficha.categoria} className="w-3.5 h-3.5" />
            </span>
            Tipo {tipo.label}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex h-32 items-center justify-center font-ui text-sm text-muted">
          Cargando ficha<span className="animate-blink">▌</span>
        </div>
      )}

      {ficha && !loading && (
        <div className="pb-8">
          {/* Pestañas: menú de consola */}
          <div
            className="flex gap-1 border-b-2 border-line px-3 pt-3"
            role="tablist"
            aria-label="Secciones de la ficha"
          >
            {PESTANAS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-0.5 rounded-t-md border-2 px-3 py-1.5 font-ui text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-line border-b-surface bg-surface text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {activeTab === tab.id ? '▸ ' : ''}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'descripcion' && (
            <div
              id="tab-panel-descripcion"
              role="tabpanel"
              aria-labelledby="tab-descripcion"
              className="px-4 pt-4 font-pedagogica"
            >
              <p className="text-sm leading-relaxed text-ink">{ficha.descripcion}</p>

              <h3 className="mt-5 mb-2 font-pixel text-base font-bold text-accent glow">
                ¿Por qué es importante?
              </h3>
              <p className="text-sm leading-relaxed text-ink">{ficha.importancia}</p>

              <div className="dex-screen mt-5 p-3">
                <h3 className="mb-2 font-pixel text-base font-bold">
                  Misión: preguntas para reflexionar
                </h3>
                <ol className="space-y-2">
                  {ficha.preguntas_reflexivas.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <span className="flex-shrink-0 font-mono font-bold">▶{i + 1}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {ficha.videos.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 font-pixel text-base font-bold text-accent glow">Videos</h3>
                  <div className="space-y-2">
                    {ficha.videos.map(v => (
                      <a
                        key={v.youtube_id}
                        href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${v.titulo} (abre en YouTube)`}
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <span className="font-mono" aria-hidden="true">
                          ▶
                        </span>
                        <span>{v.titulo}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-1 border-t-2 border-line-soft pt-3 text-muted">
                {capa && (
                  <p className="text-xs leading-relaxed">
                    <strong className="text-ink-soft">Datos de la capa:</strong>{' '}
                    {capa.fuente.ilustrativo ? (
                      <span className="text-warn">{capa.fuente.detalle}</span>
                    ) : (
                      <>
                        {capa.fuente.entidad} — {capa.fuente.detalle}
                        {capa.fuente.url && (
                          <>
                            {' '}
                            <a
                              href={capa.fuente.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline"
                            >
                              (ver portal ↗)
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </p>
                )}
                <p className="text-xs leading-relaxed">
                  <strong className="text-ink-soft">Referencias:</strong> {ficha.fuente_datos}
                </p>
                <p className="text-xs leading-relaxed">
                  <strong className="text-ink-soft">Nivel:</strong> {ficha.nivel_educativo}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'galeria' && (
            <div
              id="tab-panel-galeria"
              role="tabpanel"
              aria-labelledby="tab-galeria"
              className="px-4 pt-4"
            >
              {ficha.galeria.length === 0 ? (
                <p className="text-sm text-muted">Sin imágenes disponibles.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {ficha.galeria.map((img, i) => (
                    <figure
                      key={i}
                      className="overflow-hidden rounded-lg border-2 border-line bg-surface2"
                    >
                      {/* object-contain: los mapas y diagramas se ven completos, sin recorte */}
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver imagen completa"
                      >
                        <img
                          src={img.url}
                          alt={img.titulo}
                          className="h-48 w-full bg-surface object-contain"
                          loading="lazy"
                          onError={e => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </a>
                      <figcaption className="px-2 py-1.5">
                        <div className="font-ui text-xs font-semibold text-ink">{img.titulo}</div>
                        <div className="font-ui text-[10px] text-muted">{img.credito}</div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vocabulario' && (
            <div
              id="tab-panel-vocabulario"
              role="tabpanel"
              aria-labelledby="tab-vocabulario"
              className="px-4 pt-4"
            >
              <dl className="space-y-3">
                {ficha.vocabulario.map((v, i) => (
                  <div key={i} className="rounded-lg border-2 border-line-soft bg-surface2/60 p-3">
                    <dt className="font-pixel text-sm font-bold text-ink">
                      <span className="mr-1 font-mono text-[10px] text-muted">
                        OBJ {String(i + 1).padStart(2, '0')}
                      </span>
                      {v.termino}
                    </dt>
                    <dd className="mt-1 font-pedagogica text-sm leading-relaxed text-ink-soft">
                      {v.definicion}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
