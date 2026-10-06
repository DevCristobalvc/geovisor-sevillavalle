import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  GeoJSON as LeafletGeoJSON,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import * as turf from '@turf/turf'
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
import type { LayerConfig, LayerStyle, WmsStatus } from '../types'

interface MapViewerProps {
  onFeatureClick?: (feature: GeoJSON.Feature, layer: LayerConfig) => void
  flyTarget?: { lat: number; lng: number; zoom: number } | null
  isMeasuring?: boolean
  onMeasureClear?: () => void
}

export default function MapViewer({
  onFeatureClick,
  flyTarget,
  isMeasuring = false,
  onMeasureClear,
}: MapViewerProps) {
  const { state } = useMapContext()
  const [searchParams] = useSearchParams()
  // MapContainer solo lee center/zoom al crearse: la vista de un enlace compartido (RF-18)
  // se toma de la URL en ese momento; useUrlSync se encarga del resto del estado.
  const [vistaInicial] = useState(() => {
    const lat = parseFloat(searchParams.get('lat') ?? '')
    const lng = parseFloat(searchParams.get('lng') ?? '')
    const zoom = parseInt(searchParams.get('zoom') ?? '')
    return {
      center: (!isNaN(lat) && !isNaN(lng) ? [lat, lng] : SEVILLA_CENTER) as [number, number],
      zoom:
        !isNaN(zoom) && zoom >= SEVILLA_MIN_ZOOM && zoom <= SEVILLA_MAX_ZOOM
          ? zoom
          : SEVILLA_DEFAULT_ZOOM,
    }
  })

  return (
    <MapContainer
      center={vistaInicial.center}
      zoom={vistaInicial.zoom}
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
      <PopupEscapeController />
      <ScaleControl />
      <ResetViewController />
      {flyTarget && <FlyController target={flyTarget} />}
      <SearchController />
      <MeasurementController active={isMeasuring} onClear={onMeasureClear ?? (() => {})} />
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

function ActiveLayers({
  onFeatureClick,
}: {
  onFeatureClick?: (f: GeoJSON.Feature, l: LayerConfig) => void
}) {
  const { activeLayers, getLayerOpacity } = useMapLayers()

  return (
    <>
      {activeLayers.map(layer => {
        const opacity = getLayerOpacity(layer.id)

        if (layer.tipo === 'wms') {
          return <WMSLayer key={layer.id} layer={layer} opacity={opacity} />
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

const WMS_TIMEOUT_MS = 12000

/**
 * Capa WMS con teselas de 512 px: cuatro veces menos peticiones que las de 256 px,
 * lo que importa porque el portal de la CVC limita la tasa de peticiones por IP y un
 * salón de clase comparte una sola IP. Informa su estado con el evento `wmsStatus`
 * para que el panel de capas avise cuando el servicio no responde.
 */
function WMSLayer({ layer, opacity }: { layer: LayerConfig; opacity: number }) {
  const counts = useRef({ ok: 0, error: 0 })
  // Un firewall puede dejar las peticiones colgadas sin responder ni fallar: en ese caso
  // Leaflet nunca emite `load`, así que se da el servicio por caído si en este plazo no
  // llegó ninguna tesela.
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null)

  const report = useCallback(
    (status: WmsStatus) =>
      window.dispatchEvent(new CustomEvent('wmsStatus', { detail: { id: layer.id, status } })),
    [layer.id]
  )

  const limpiarEspera = () => {
    if (espera.current) clearTimeout(espera.current)
    espera.current = null
  }

  useEffect(() => {
    report('cargando')
    return () => {
      if (espera.current) clearTimeout(espera.current)
      report('cargando')
    }
  }, [report])

  return (
    <WMSTileLayer
      url={layer.url}
      layers={layer.wmsLayers ?? ''}
      format={layer.wmsFormat ?? 'image/png'}
      transparent={true}
      version="1.1.1"
      tileSize={512}
      opacity={opacity * 0.85}
      attribution={`${layer.nombre}: ${layer.fuente.entidad}`}
      eventHandlers={{
        loading: () => {
          counts.current = { ok: 0, error: 0 }
          limpiarEspera()
          espera.current = setTimeout(() => {
            if (counts.current.ok === 0) report('error')
          }, WMS_TIMEOUT_MS)
        },
        tileload: () => {
          counts.current.ok++
          if (counts.current.ok === 1) report('ok')
        },
        tileerror: () => {
          counts.current.error++
        },
        load: () => {
          limpiarEspera()
          report(counts.current.ok > 0 || counts.current.error === 0 ? 'ok' : 'error')
        },
      }}
    />
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

  const style: Partial<LayerStyle> = layer.estilo ?? {}
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

const ETIQUETAS: Record<string, string> = {
  area_ha: 'Área (ha)',
  area_km2: 'Área (km²)',
  area_en_sevilla_ha: 'Área en Sevilla (ha)',
  area_total_ha: 'Área total (ha)',
  altitud_msnm: 'Altitud (m s. n. m.)',
  elevacion_msnm: 'Elevación (m s. n. m.)',
  profundidad_m: 'Profundidad (m)',
  codigo: 'Código',
  codigo_ideam: 'Código IDEAM',
  codigo_pozo: 'Código del pozo',
  codigo_predio: 'Código predial',
  nombre_cientifico: 'Nombre científico',
  nombre_comun: 'Nombre común',
  resolucion: 'Resolución',
  tipologia: 'Tipología',
  ambito: 'Ámbito',
  acto_administrativo: 'Acto administrativo',
  subzona_hidrografica: 'Subzona hidrográfica',
  estacion: 'Estación',
  anno_levantamiento: 'Año de levantamiento',
  anno_declaracion: 'Año de declaración',
  categoria: 'Categoría',
  categoria_amenaza: 'Categoría de amenaza',
  codigo_dane: 'Código DANE',
  estado_conservacion: 'Estado de conservación',
  fecha_declaracion: 'Fecha de declaración',
  fecha_muestreo: 'Fecha de muestreo',
  fuente_hidrica_protegida: 'Fuente hídrica protegida',
  nivel_freatico: 'Nivel freático',
  nombre_complejo: 'Complejo',
  nombre_vereda: 'Nombre',
  parametros: 'Parámetros',
  rio_principal: 'Río principal',
  altitud_rango: 'Rango altitudinal',
  tipo_actor: 'Tipo de actor',
}

function etiqueta(clave: string): string {
  if (ETIQUETAS[clave]) return ETIQUETAS[clave]
  const texto = clave.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Los valores vienen de servicios externos: se escapan antes de entrar al HTML del popup. */
function escapeHtml(valor: unknown): string {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatear(valor: unknown): string {
  // Años y códigos numéricos cortos se dejan tal cual; áreas y decimales con formato local
  if (typeof valor === 'number' && (!Number.isInteger(valor) || valor >= 10000)) {
    return valor.toLocaleString('es-CO', { maximumFractionDigits: 1 })
  }
  return escapeHtml(valor)
}

function buildPopupContent(feature: GeoJSON.Feature, layer: LayerConfig): string {
  const props = feature.properties ?? {}
  const atributos = layer.atributosPopup ?? Object.keys(props).slice(0, 4)
  const rows = atributos
    .filter(k => props[k] != null)
    .map(
      k =>
        `<tr><td class="text-gray-500 pr-2 text-xs align-top">${escapeHtml(etiqueta(k))}</td><td class="text-xs font-medium">${formatear(props[k])}</td></tr>`
    )
    .join('')

  const thumbnail = layer.miniatura
    ? `<img src="${layer.miniatura}" alt="Miniatura de ${escapeHtml(layer.nombre)}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:8px" onerror="this.style.display='none'" />`
    : ''

  const ilustrativo = layer.fuente.ilustrativo
    ? `<div style="background:#FEF3C7;color:#92400E;border-radius:4px;padding:3px 6px;margin-bottom:6px;font-size:11px">Dato ilustrativo: no proviene de una fuente oficial</div>`
    : ''

  return `
    <div>
      ${thumbnail}
      <div class="font-semibold text-sm mb-1" style="color:${layer.estilo?.color ?? '#2D6A4F'}">${escapeHtml(layer.nombre)}</div>
      ${ilustrativo}
      ${rows ? `<table class="w-full">${rows}</table>` : ''}
      <div style="color:#6B7280;font-size:10px;margin-top:6px">Fuente: ${escapeHtml(layer.fuente.entidad)}</div>
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
    zoomend: e => dispatch({ type: 'SET_ZOOM', zoom: e.target.getZoom() }),
    moveend: e => {
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
      const { lat, lng, zoom } = (e as CustomEvent<{ lat: number; lng: number; zoom: number }>)
        .detail
      map.flyTo([lat, lng], zoom, { duration: 1.2 })
    }
    window.addEventListener('geocoderFlyTo', handler)
    return () => window.removeEventListener('geocoderFlyTo', handler)
  }, [map])
  return null
}

function PopupEscapeController() {
  const map = useMap()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') map.closePopup()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [map])
  return null
}

function ScaleControl() {
  const map = useMap()
  useEffect(() => {
    const scale = L.control.scale({ imperial: false, position: 'bottomleft' })
    scale.addTo(map)
    return () => {
      scale.remove()
    }
  }, [map])
  return null
}

function ResetViewController() {
  const map = useMap()
  useEffect(() => {
    const handler = () => map.flyTo(SEVILLA_CENTER, SEVILLA_DEFAULT_ZOOM, { duration: 1.2 })
    window.addEventListener('mapResetView', handler)
    return () => window.removeEventListener('mapResetView', handler)
  }, [map])
  return null
}

function MeasurementController({ active, onClear }: { active: boolean; onClear: () => void }) {
  const map = useMap()
  const groupRef = useRef<L.LayerGroup | null>(null)
  const [points, setPoints] = useState<L.LatLng[]>([])
  const [stats, setStats] = useState('')
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const g = L.layerGroup().addTo(map)
    groupRef.current = g
    return () => {
      g.remove()
    }
  }, [map])

  const redraw = useCallback((pts: L.LatLng[]) => {
    const g = groupRef.current
    if (!g) return
    g.clearLayers()
    pts.forEach(p =>
      L.circleMarker(p, {
        radius: 5,
        color: '#e74c3c',
        fillColor: '#e74c3c',
        fillOpacity: 1,
        weight: 2,
      }).addTo(g)
    )
    if (pts.length >= 2) L.polyline(pts, { color: '#e74c3c', weight: 2, dashArray: '6,4' }).addTo(g)
  }, [])

  const computeStats = useCallback((pts: L.LatLng[]): string => {
    if (pts.length < 2) return ''
    const coords = pts.map(p => [p.lng, p.lat] as [number, number])
    const dist = turf.length(turf.lineString(coords), { units: 'kilometers' })
    if (pts.length >= 3) {
      const area = turf.area(turf.polygon([[...coords, coords[0]]])) / 10000
      return `${dist.toFixed(2)} km · ${area.toFixed(1)} ha`
    }
    return `${dist.toFixed(2)} km`
  }, [])

  const clearAll = useCallback(() => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current)
      pendingRef.current = null
    }
    groupRef.current?.clearLayers()
    setPoints([])
    setStats('')
  }, [])

  useEffect(() => {
    const container = map.getContainer()
    if (active) {
      container.style.cursor = 'crosshair'
      map.doubleClickZoom.disable()
    } else {
      container.style.cursor = ''
      map.doubleClickZoom.enable()
      clearAll()
    }
  }, [active, map, clearAll])

  useMapEvents({
    click: active
      ? e => {
          if (pendingRef.current) {
            clearTimeout(pendingRef.current)
            pendingRef.current = null
            return
          }
          pendingRef.current = setTimeout(() => {
            pendingRef.current = null
            setPoints(prev => {
              const next = [...prev, e.latlng]
              redraw(next)
              setStats(computeStats(next))
              return next
            })
          }, 220)
        }
      : () => {},
  })

  if (!active) return null

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto">
      <div className="bg-white/95 rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4 text-sm whitespace-nowrap">
        <span className="text-gris-texto">
          {stats ||
            (points.length === 0
              ? 'Haz clic para agregar puntos'
              : `${points.length} punto${points.length > 1 ? 's' : ''}`)}
        </span>
        <button
          onClick={() => {
            clearAll()
            onClear()
          }}
          className="text-red-500 hover:text-red-700 font-medium text-xs focus-visible:ring-2 focus-visible:ring-red-500 rounded"
          aria-label="Limpiar medición y salir"
        >
          <span className="flex items-center gap-1">
            Limpiar
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}

function CoordinatesDisplay() {
  const coordsRef = useRef<HTMLDivElement>(null)
  const map = useMap()

  useEffect(() => {
    const onMove = (e: LeafletMouseEvent) => {
      if (coordsRef.current) {
        coordsRef.current.textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
      }
    }
    map.on('mousemove', onMove)
    return () => {
      map.off('mousemove', onMove)
    }
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
