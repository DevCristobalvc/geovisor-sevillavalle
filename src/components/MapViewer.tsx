import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON as LeafletGeoJSON, WMSTileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import { useMapContext } from '../context/MapContext'
import { useMapLayers } from '../hooks/useMapLayers'
import {
  MAPA_BASE_URLS,
  MAPA_BASE_ATTRIBUTION,
  SEVILLA_CENTER,
  SEVILLA_DEFAULT_ZOOM,
  SEVILLA_MIN_ZOOM,
  SEVILLA_MAX_ZOOM,
} from '../config/layers.config'
import type { LayerConfig } from '../types'

interface MapViewerProps {
  onFeatureClick?: (feature: GeoJSON.Feature, layer: LayerConfig) => void
}

export default function MapViewer({ onFeatureClick }: MapViewerProps) {
  const { state } = useMapContext()

  return (
    <MapContainer
      center={SEVILLA_CENTER}
      zoom={SEVILLA_DEFAULT_ZOOM}
      minZoom={SEVILLA_MIN_ZOOM}
      maxZoom={SEVILLA_MAX_ZOOM}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      <MapBaseLayer base={state.mapaBase} />
      <ActiveLayers onFeatureClick={onFeatureClick} />
      <MapEventSync />
      <CoordinatesDisplay />
    </MapContainer>
  )
}

function MapBaseLayer({ base }: { base: 'osm' | 'esri' | 'topo' | 'dark' }) {
  return (
    <TileLayer
      url={MAPA_BASE_URLS[base]}
      attribution={MAPA_BASE_ATTRIBUTION[base]}
      maxZoom={SEVILLA_MAX_ZOOM}
    />
  )
}

function ActiveLayers({ onFeatureClick }: { onFeatureClick?: (f: GeoJSON.Feature, l: LayerConfig) => void }) {
  const { activeLayers } = useMapLayers()

  return (
    <>
      {activeLayers.map(layer => {
        if (layer.tipo === 'wms') {
          return (
            <WMSTileLayer
              key={layer.id}
              url={layer.url}
              layers={layer.wmsLayers ?? ''}
              format={layer.wmsFormat ?? 'image/png'}
              transparent={true}
              version="1.1.1"
              opacity={0.85}
            />
          )
        }

        if (layer.tipo === 'geojson') {
          return (
            <GeoJSONLayer
              key={layer.id}
              layer={layer}
              onFeatureClick={onFeatureClick}
            />
          )
        }

        return null
      })}
    </>
  )
}

function GeoJSONLayer({
  layer,
  onFeatureClick,
}: {
  layer: LayerConfig
  onFeatureClick?: (f: GeoJSON.Feature, l: LayerConfig) => void
}) {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null)

  useEffect(() => {
    fetch(layer.url)
      .then(r => r.json())
      .then((json: GeoJSON.FeatureCollection) => setData(json))
      .catch(err => console.warn(`Error cargando ${layer.url}:`, err))
  }, [layer.url])

  if (!data) return null

  const style = layer.estilo ?? {}

  return (
    <LeafletGeoJSON
      data={data}
      style={() => ({
        color: style.color ?? '#2D6A4F',
        weight: style.weight ?? 1.5,
        fillOpacity: style.fillOpacity ?? 0.45,
        fillColor: style.fillColor ?? style.color ?? '#2D6A4F',
        dashArray: style.dashArray,
      })}
      onEachFeature={(feature, leafletLayer) => {
        leafletLayer.on('click', () => onFeatureClick?.(feature, layer))
        if (feature.properties) {
          const popupContent = buildPopupContent(feature, layer)
          leafletLayer.bindPopup(popupContent, { maxWidth: 320 })
        }
      }}
    />
  )
}

function buildPopupContent(feature: GeoJSON.Feature, layer: LayerConfig): string {
  const props = feature.properties ?? {}
  const atributos = layer.atributosPopup ?? Object.keys(props).slice(0, 4)
  const rows = atributos
    .filter(k => props[k] != null)
    .map(k => `<tr><td class="text-gray-500 pr-2 text-xs">${k}</td><td class="text-xs font-medium">${props[k]}</td></tr>`)
    .join('')

  return `
    <div>
      <div class="font-semibold text-sm mb-1" style="color:${layer.estilo?.color ?? '#2D6A4F'}">${layer.nombre}</div>
      ${rows ? `<table class="w-full">${rows}</table>` : ''}
      <button
        onclick="window.dispatchEvent(new CustomEvent('openFicha', { detail: '${layer.fichaId}' }))"
        style="background:#2D6A4F;color:white;border:none;cursor:pointer;padding:4px 8px;border-radius:4px;width:100%;margin-top:8px;font-size:12px"
      >
        Ver ficha pedagógica →
      </button>
    </div>
  `
}

function MapEventSync() {
  const { dispatch } = useMapContext()
  useMapEvents({
    zoomend: (e) => dispatch({ type: 'SET_ZOOM', zoom: e.target.getZoom() }),
    moveend: (e) => {
      const c = e.target.getCenter()
      dispatch({ type: 'SET_CENTER', center: [c.lat, c.lng] })
    },
  })
  return null
}

function CoordinatesDisplay() {
  const coordsRef = useRef<HTMLDivElement>(null)
  const map = useMap()

  useEffect(() => {
    const onMove = (e: LeafletMouseEvent) => {
      if (coordsRef.current) {
        coordsRef.current.textContent =
          `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
      }
    }
    map.on('mousemove', onMove)
    return () => { map.off('mousemove', onMove) }
  }, [map])

  return (
    <div
      ref={coordsRef}
      className="font-mono-coords absolute bottom-8 right-2 z-[1000] bg-white/90 px-2 py-0.5 rounded text-gray-600 shadow text-xs pointer-events-none"
      aria-live="polite"
      aria-label="Coordenadas del cursor"
    />
  )
}
