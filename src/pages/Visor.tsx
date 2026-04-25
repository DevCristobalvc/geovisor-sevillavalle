import { useState, useEffect } from 'react'
import MapViewer from '../components/MapViewer'
import LayerPanel from '../components/LayerPanel'
import InfoPanel from '../components/InfoPanel'
import MapToolbar from '../components/MapToolbar'
import { useIsMobile } from '../hooks/useMediaQuery'

export default function Visor() {
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [fichaAbierta, setFichaAbierta] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) setPanelCollapsed(true)
  }, [isMobile])

  // Escucha eventos del popup del mapa
  useEffect(() => {
    const handler = (e: Event) => {
      setFichaAbierta((e as CustomEvent<string>).detail)
    }
    window.addEventListener('openFicha', handler)
    return () => window.removeEventListener('openFicha', handler)
  }, [])

  return (
    <div
      className="relative flex overflow-hidden bg-gris-claro"
      style={{ height: 'calc(100vh - var(--header-height) - var(--footer-height))' }}
    >
      {/* Panel de capas */}
      <LayerPanel
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed(v => !v)}
      />

      {/* Área del mapa */}
      <div
        className="flex-1 relative transition-all duration-300"
        style={{ marginLeft: panelCollapsed ? 0 : 'var(--panel-width)' }}
      >
        <MapViewer
          onFeatureClick={(_feature, layer) => setFichaAbierta(layer.fichaId)}
        />
        <MapToolbar
          panelCollapsed={panelCollapsed}
          onTogglePanel={() => setPanelCollapsed(v => !v)}
        />
      </div>

      {/* Panel de ficha pedagógica */}
      <InfoPanel
        fichaId={fichaAbierta}
        onClose={() => setFichaAbierta(null)}
      />
    </div>
  )
}
