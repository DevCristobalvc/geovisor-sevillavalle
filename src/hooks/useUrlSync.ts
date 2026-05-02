import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMapContext } from '../context/MapContext'
import type { MapState } from '../types'

const VALID_BASES: MapState['mapaBase'][] = ['osm', 'esri', 'topo', 'dark']

export function useUrlSync() {
  const { state, dispatch } = useMapContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const mountedRef = useRef(false)
  const writingRef = useRef(false)

  // On mount: read URL params and apply to state
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const lat = parseFloat(searchParams.get('lat') ?? '')
    const lng = parseFloat(searchParams.get('lng') ?? '')
    const zoom = parseInt(searchParams.get('zoom') ?? '')
    const base = searchParams.get('base') as MapState['mapaBase'] | null
    const layers = searchParams.get('layers')

    const partial: Partial<MapState> = {}
    if (!isNaN(lat) && !isNaN(lng)) partial.center = [lat, lng]
    if (!isNaN(zoom) && zoom >= 1 && zoom <= 22) partial.zoom = zoom
    if (base && VALID_BASES.includes(base)) partial.mapaBase = base
    if (layers) partial.capasActivas = layers.split(',').filter(Boolean)

    if (Object.keys(partial).length > 0) {
      dispatch({ type: 'SET_STATE_FROM_URL', state: partial })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On state change: write URL params
  useEffect(() => {
    if (!mountedRef.current) return
    writingRef.current = true

    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('lat', state.center[0].toFixed(4))
      next.set('lng', state.center[1].toFixed(4))
      next.set('zoom', String(state.zoom))
      next.set('base', state.mapaBase)
      if (state.capasActivas.length > 0) {
        next.set('layers', state.capasActivas.join(','))
      } else {
        next.delete('layers')
      }
      return next
    }, { replace: true })

    requestAnimationFrame(() => { writingRef.current = false })
  }, [state.center, state.zoom, state.mapaBase, state.capasActivas, setSearchParams])

  return null
}
