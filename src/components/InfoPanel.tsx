import { useState, useEffect } from 'react'
import type { FichaPedagogica } from '../types'
import { CATEGORIAS } from '../config/layers.config'

interface InfoPanelProps {
  fichaId: string | null
  onClose: () => void
}

export default function InfoPanel({ fichaId, onClose }: InfoPanelProps) {
  const [ficha, setFicha] = useState<FichaPedagogica | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'descripcion' | 'galeria' | 'vocabulario'>('descripcion')

  useEffect(() => {
    if (!fichaId) { setFicha(null); return }
    setLoading(true)
    setActiveTab('descripcion')
    fetch(`/fichas/${fichaId}.json`)
      .then(r => r.json())
      .then((data: FichaPedagogica) => setFicha(data))
      .catch(() => setFicha(null))
      .finally(() => setLoading(false))
  }, [fichaId])

  const isOpen = !!fichaId

  return (
    <div
      className={`ficha-panel ${isOpen ? 'open' : ''}`}
      role="complementary"
      aria-label="Ficha pedagógica"
      aria-hidden={!isOpen}
    >
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <h2 className="text-sm font-bold text-gris-texto truncate">
          {ficha ? ficha.titulo : 'Ficha pedagógica'}
        </h2>
        <button
          onClick={onClose}
          aria-label="Cerrar ficha pedagógica"
          className="text-gray-400 hover:text-gris-texto transition-colors p-1"
        >
          ✕
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          Cargando ficha...
        </div>
      )}

      {ficha && !loading && (
        <div className="pb-8">
          {/* Badge categoría */}
          <div className="px-4 pt-4">
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: CATEGORIAS[ficha.categoria].color }}
            >
              {CATEGORIAS[ficha.categoria].label}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 mt-3 px-2">
            {(['descripcion', 'galeria', 'vocabulario'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-verde-bosque text-verde-bosque'
                    : 'text-gray-400 hover:text-gris-texto'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'descripcion' && (
            <div className="px-4 pt-4 font-pedagogica">
              <p className="text-sm text-gris-texto leading-relaxed">{ficha.descripcion}</p>

              <h3 className="text-sm font-bold text-verde-bosque mt-4 mb-2">
                ¿Por qué es importante?
              </h3>
              <p className="text-sm text-gris-texto leading-relaxed">{ficha.importancia}</p>

              <h3 className="text-sm font-bold text-verde-bosque mt-4 mb-2">
                Preguntas para reflexionar
              </h3>
              <ul className="space-y-2">
                {ficha.preguntas_reflexivas.map((p, i) => (
                  <li key={i} className="text-sm text-gris-texto leading-relaxed flex gap-2">
                    <span className="text-verde-bosque font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              {ficha.videos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-verde-bosque mb-2">Videos</h3>
                  <div className="space-y-2">
                    {ficha.videos.map(v => (
                      <a
                        key={v.youtube_id}
                        href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-azul-medio hover:underline"
                      >
                        <span>▶</span>
                        <span>{v.titulo}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                <strong>Fuente:</strong> {ficha.fuente_datos}<br />
                <strong>Nivel:</strong> {ficha.nivel_educativo}
              </div>
            </div>
          )}

          {activeTab === 'galeria' && (
            <div className="px-4 pt-4">
              {ficha.galeria.length === 0 ? (
                <p className="text-sm text-gray-400">Sin imágenes disponibles.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {ficha.galeria.map((img, i) => (
                    <div key={i} className="rounded overflow-hidden border border-gray-100">
                      <img
                        src={img.url}
                        alt={img.titulo}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                      <div className="px-2 py-1.5">
                        <div className="text-xs font-medium text-gris-texto">{img.titulo}</div>
                        <div className="text-xs text-gray-400">{img.credito}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vocabulario' && (
            <div className="px-4 pt-4">
              <div className="space-y-3">
                {ficha.vocabulario.map((v, i) => (
                  <div key={i} className="border-l-2 pl-3" style={{ borderColor: CATEGORIAS[ficha.categoria].color }}>
                    <div className="text-sm font-bold text-gris-texto">{v.termino}</div>
                    <div className="text-sm text-gray-500 font-pedagogica leading-relaxed">{v.definicion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
