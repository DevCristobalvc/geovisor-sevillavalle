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
          const label = String(Object.values(props).find(Boolean) ?? layer.nombre)
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
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[999] bg-white rounded-lg shadow-xl border border-gray-200 w-80"
      role="dialog"
      aria-label="Buscar en capas activas"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <span className="text-gray-400 text-sm" aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar vereda, especie, municipio…"
          className="flex-1 text-sm outline-none text-gris-texto placeholder-gray-400 bg-transparent"
          aria-label="Buscar dentro de capas activas"
          autoComplete="off"
        />
        <button
          onClick={onClose}
          aria-label="Cerrar búsqueda"
          className="text-gray-400 hover:text-gris-texto p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-bosque"
        >
          ✕
        </button>
      </div>

      {activeGeoJsonCount === 0 && (
        <p className="px-4 py-3 text-sm text-gray-400">
          Activa alguna capa GeoJSON para buscar en ella.
        </p>
      )}

      {activeGeoJsonCount > 0 && query.length >= 2 && results.length === 0 && (
        <p className="px-4 py-3 text-sm text-gray-400">Sin resultados para «{query}»</p>
      )}

      {activeGeoJsonCount > 0 && query.length < 2 && (
        <p className="px-4 py-3 text-xs text-gray-400">
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
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                role="option"
              >
                <div className="text-sm font-medium text-gris-texto truncate">{r.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{r.layerName}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
