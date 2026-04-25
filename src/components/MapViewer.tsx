import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON as LeafletGeoJSON, WMSTileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
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
  flyTarget?: { lat: number; lng: number; zoom: number } | null
}

export default function MapViewer({ onFeatureClick, flyTarget }: MapViewerProps) {
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
      {flyTarget && <FlyController target={flyTarget} />}
      <SearchController />
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
  const { activeLayers, getLayerOpacity } = useMapLayers()

  return (
    <>
      {activeLayers.map(layer => {
        const opacity = getLayerOpacity(layer.id)

        if (layer.tipo === 'wms') {
          return (
            <WMSTileLayer
              key={layer.id}
              url={layer.url}
              layers={layer.wmsLayers ?? ''}
              format={layer.wmsFormat ?? 'image/png'}
              transparent={true}
              version="1.1.1"
              opacity={opacity * 0.85}
            />
          )
        }

        if (layer.tipo === 'geojson') {
          return (
            <GeoJSONLayer
              key={layer.id}
              layer={layer}
              opacity={opacity}
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
  opacity,
  onFeatureClick,
}: {
  layer: LayerConfig
  opacity: number
  onFeatureClick?: (f: GeoJSON.Feature, l: LayerConfig) => void
}) {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null)
  const map = useMap()

  useEffect(() => {
    fetch(layer.url)
      .then(r => r.json())
      .then((json: GeoJSON.FeatureCollection) => setData(json))
      .catch(err => console.warn(`Error cargando ${layer.url}:`, err))
  }, [layer.url])

  useEffect(() => {
    if (!data) return
    const handler = () => {
      const bounds = L.geoJSON(data).getBounds()
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
    window.addEventListener(`zoomToLayer:${layer.id}`, handler)
    return () => window.removeEventListener(`zoomToLayer:${layer.id}`, handler)
  }, [map, data, layer.id])

  if (!data) return null

  const style = layer.estilo ?? {}
  const baseStyle = {
    color: style.color ?? '#2D6A4F',
    weight: style.weight ?? 1.5,
    fillOpacity: (style.fillOpacity ?? 0.45) * opacity,
    fillColor: style.fillColor ?? style.color ?? '#2D6A4F',
    dashArray: style.dashArray,
    opacity,
  }

  return (
    <LeafletGeoJSON
      data={data}
      style={() => baseStyle}
      pointToLayer={(_feature, latlng) =>
        L.circleMarker(latlng, { ...baseStyle, radius: style.radius ?? 8 })
      }
      onEachFeature={(feature, leafletLayer) => {
        const path = leafletLayer as unknown as L.Path
        leafletLayer.on('click', () => onFeatureClick?.(feature, layer))
        leafletLayer.on('mouseover', () =>
          path.setStyle({ fillOpacity: Math.min((style.fillOpacity ?? 0.45) * opacity + 0.25, 1) })
        )
        leafletLayer.on('mouseout', () =>
          path.setStyle({ fillOpacity: (style.fillOpacity ?? 0.45) * opacity })
        )
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

  const thumbnail = layer.miniatura
    ? `<img src="${layer.miniatura}" alt="Miniatura de ${layer.nombre}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:8px" onerror="this.style.display='none'" />`
    : ''

  return `
    <div>
      ${thumbnail}
      <div class="font-semibold text-sm mb-1" style="color:${layer.estilo?.color ?? '#2D6A4F'}">${layer.nombre}</div>
      ${rows ? `<table class="w-full">${rows}</table>` : ''}
      <button
        onclick="window.dispatchEvent(new CustomEvent('openFicha', { detail: '${layer.fichaId}' }))"
        style="background:#2D6A4F;color:white;border:none;cursor:pointer;padding:4px 8px;border-radius:4px;width:100%;margin-top:8px;font-size:12px"
        aria-label="Ver ficha pedagógica de ${layer.nombre}"
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

function FlyController({ target }: { target: { lat: number; lng: number; zoom: number } }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.4 })
  }, [map, target.lat, target.lng, target.zoom])
  return null
}

function SearchController() {
  const map = useMap()
  useEffect(() => {
    const handler = (e: Event) => {
      const { lat, lng, zoom } = (e as CustomEvent<{ lat: number; lng: number; zoom: number }>).detail
      map.flyTo([lat, lng], zoom, { duration: 1.2 })
    }
    window.addEventListener('geocoderFlyTo', handler)
    return () => window.removeEventListener('geocoderFlyTo', handler)
  }, [map])
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
