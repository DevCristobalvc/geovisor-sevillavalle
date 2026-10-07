import { useState, useEffect, useRef } from 'react'
import { useMapLayers } from '../hooks/useMapLayers'
import * as turf from '@turf/turf'

interface SearchResult {
  layerName: string
  label: string
  lat: number
  lng: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function FeatureSearchPanel({ isOpen, onClose }: Props) {
  const { activeLayers } = useMapLayers()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [geoData, setGeoData] = useState<Map<string, GeoJSON.FeatureCollection>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)

  // Load GeoJSON for active layers on demand
  useEffect(() => {
    activeLayers
      .filter(l => l.tipo === 'geojson')
      .forEach(async layer => {
        if (geoData.has(layer.id)) return
        try {
          const data: GeoJSON.FeatureCollection = await fetch(layer.url).then(r => r.json())
          setGeoData(prev => new Map(prev).set(layer.id, data))
        } catch {
          // skip silently
        }
      })
  }, [activeLayers]) // eslint-disable-line react-hooks/exhaustive-deps

  // Search through loaded feature properties
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const found: SearchResult[] = []

    for (const layer of activeLayers) {
      if (layer.tipo !== 'geojson') continue
      const data = geoData.get(layer.id)
      if (!data) continue

      for (const feature of data.features) {
        const props = feature.properties ?? {}
        const match = Object.values(props).some(v => String(v).toLowerCase().includes(q))
        if (!match) continue

        try {
          const center = turf.centroid(feature as turf.AllGeoJSON)
          const [lng, lat] = center.geometry.coordinates
          const principal = layer.atributosPopup?.[0]
          const label = String(
            (principal && props[principal]) ?? Object.values(props).find(Boolean) ?? layer.nombre
          )
          found.push({ layerName: layer.nombre, label, lat, lng })
          if (found.length >= 10) break
        } catch {
          /* skip */
        }
      }
      if (found.length >= 10) break
    }
    setResults(found)
  }, [query, geoData, activeLayers])

  const select = (r: SearchResult) => {
    window.dispatchEvent(
      new CustomEvent('geocoderFlyTo', { detail: { lat: r.lat, lng: r.lng, zoom: 15 } })
    )
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activeGeoJsonCount = activeLayers.filter(l => l.tipo === 'geojson').length

  return (
    <div
      className="dex-card absolute top-3 left-1/2 -translate-x-1/2 z-[999] w-80 overflow-hidden"
      role="dialog"
      aria-label="Buscar en capas activas"
    >
      <div className="flex items-center gap-2 border-b-2 border-line bg-surface2 px-3 py-2">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-4 h-4 text-accent flex-shrink-0"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="4" />
          <path strokeLinecap="round" d="M10 10l3 3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="> buscar corregimiento, especie…"
          className="flex-1 bg-transparent font-ui text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Buscar dentro de capas activas"
          autoComplete="off"
        />
        <button
          onClick={onClose}
          aria-label="Cerrar búsqueda"
          className="rounded p-0.5 text-muted hover:text-ink"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      {activeGeoJsonCount === 0 && (
        <p className="px-4 py-3 font-ui text-sm text-muted">
          Activa alguna capa GeoJSON para buscar en ella.
        </p>
      )}

      {activeGeoJsonCount > 0 && query.length >= 2 && results.length === 0 && (
        <p className="px-4 py-3 font-ui text-sm text-muted">Sin resultados para «{query}»</p>
      )}

      {activeGeoJsonCount > 0 && query.length < 2 && (
        <p className="px-4 py-3 font-ui text-xs text-muted">
          Busca en {activeGeoJsonCount} capa{activeGeoJsonCount > 1 ? 's' : ''} activa
          {activeGeoJsonCount > 1 ? 's' : ''} — escribe al menos 2 caracteres.
        </p>
      )}

      {results.length > 0 && (
        <ul className="max-h-64 overflow-y-auto" role="listbox" aria-label="Resultados">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => select(r)}
                className="w-full border-b border-line-soft px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-accent-soft"
                role="option"
              >
                <div className="truncate font-ui text-sm font-semibold text-ink">{r.label}</div>
                <div className="mt-0.5 font-ui text-[11px] text-muted">{r.layerName}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
