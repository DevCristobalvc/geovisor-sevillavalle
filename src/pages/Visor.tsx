import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import MapViewer from '../components/MapViewer'
import LayerPanel from '../components/LayerPanel'
import InfoPanel from '../components/InfoPanel'
import MapToolbar from '../components/MapToolbar'
import RecorridoHUD from '../components/RecorridoHUD'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useUrlSync } from '../hooks/useUrlSync'
import type { Recorrido } from '../types'

export default function Visor() {
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [fichaAbierta, setFichaAbierta] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  useUrlSync()

  // Recorrido state
  const [recorrido, setRecorrido] = useState<Recorrido | null>(null)
  const [paradaIndex, setParadaIndex] = useState(0)

  useEffect(() => {
    if (isMobile) setPanelCollapsed(true)
  }, [isMobile])

  // Listen for popup ficha events
  useEffect(() => {
    const handler = (e: Event) => {
      setFichaAbierta((e as CustomEvent<string>).detail)
    }
    window.addEventListener('openFicha', handler)
    return () => window.removeEventListener('openFicha', handler)
  }, [])

  // Load recorrido from ?recorrido= query param
  useEffect(() => {
    const recorridoId = searchParams.get('recorrido')
    if (!recorridoId) { setRecorrido(null); return }

    fetch(`/data/recorridos/${recorridoId}.json`)
      .then(r => r.json())
      .then((data: Recorrido) => { setRecorrido(data); setParadaIndex(0) })
      .catch(() => setRecorrido(null))
  }, [searchParams])

  const currentParada = recorrido ? recorrido.paradas[paradaIndex] : null

  const exitRecorrido = () => {
    setRecorrido(null)
    setParadaIndex(0)
    const next = new URLSearchParams(searchParams)
    next.delete('recorrido')
    setSearchParams(next)
  }

  return (
    <div className="relative flex overflow-hidden bg-gris-claro h-full">
      {/* Panel de capas */}
      <LayerPanel
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed(v => !v)}
      />

      {/* Área del mapa */}
      <div
        className="flex-1 relative transition-all duration-300"
        style={{ marginLeft: panelCollapsed ? 0 : 'var(--panel-width)', height: '100%' }}
      >
        <MapViewer
          onFeatureClick={(_feature, layer) => setFichaAbierta(layer.fichaId)}
          flyTarget={currentParada ? { lat: currentParada.lat, lng: currentParada.lng, zoom: currentParada.zoom } : null}
        />
        <MapToolbar
          panelCollapsed={panelCollapsed}
          onTogglePanel={() => setPanelCollapsed(v => !v)}
        />

        {/* Recorrido HUD */}
        {recorrido && (
          <RecorridoHUD
            recorrido={recorrido}
            paradaIndex={paradaIndex}
            onPrev={() => setParadaIndex(i => Math.max(0, i - 1))}
            onNext={() => setParadaIndex(i => Math.min(recorrido.paradas.length - 1, i + 1))}
            onExit={exitRecorrido}
          />
        )}
      </div>

      {/* Panel de ficha pedagógica */}
      <InfoPanel
        fichaId={fichaAbierta}
        onClose={() => setFichaAbierta(null)}
      />
    </div>
  )
}
