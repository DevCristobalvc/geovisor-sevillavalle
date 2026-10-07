import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useOffline } from '../hooks/useOffline'
import { useTema } from '../hooks/useTema'
import { LogoDex } from './Dex'

// ─── Geocoder ────────────────────────────────────────────────────────────────

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

function GeoSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = (q: string) => {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Sevilla Valle del Cauca Colombia')}&format=json&limit=4&accept-language=es`
        const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
        const data: NominatimResult[] = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    window.dispatchEvent(new CustomEvent('geocoderFlyTo', { detail: { lat, lng, zoom: 16 } }))
    setQuery(r.display_name.split(',')[0])
    setResults([])
    navigate('/visor')
  }

  return (
    <div className="relative hidden lg:block">
      <span
        className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-accent"
        aria-hidden="true"
      >
        &gt;
      </span>
      <input
        type="search"
        value={query}
        onChange={e => search(e.target.value)}
        placeholder="buscar lugar…"
        aria-label="Buscar lugar en el mapa"
        className="w-48 xl:w-56 rounded-lg border-2 border-line bg-surface2 pl-6 pr-3 py-1 font-ui text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      {searching && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-xs">…</div>
      )}
      {results.length > 0 && (
        <ul
          className="dex-card absolute top-full left-0 mt-2 z-50 min-w-full max-w-xs overflow-hidden"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2 font-ui text-xs text-ink hover:bg-accent-soft transition-colors"
                role="option"
              >
                {r.display_name.split(',').slice(0, 2).join(', ')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Interruptor día / noche ──────────────────────────────────────────────────

function TemaToggle() {
  const { tema, alternar } = useTema()
  const oscuro = tema === 'oscuro'
  return (
    <button
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a modo día' : 'Cambiar a modo noche (terminal)'}
      aria-pressed={oscuro}
      title={oscuro ? 'Modo día' : 'Modo noche'}
      className="group flex items-center gap-1.5 rounded-lg border-2 border-line bg-surface2 px-2 py-1 font-ui text-[11px] font-bold uppercase tracking-wider text-ink shadow-dex-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <svg
        viewBox="0 0 8 8"
        className="w-3.5 h-3.5"
        shapeRendering="crispEdges"
        fill="currentColor"
        aria-hidden="true"
      >
        {oscuro ? (
          // Sol pixelado
          <path d="M3 0h2v1H3zM3 7h2v1H3zM0 3h1v2H0zM7 3h1v2H7zM2 2h4v4H2zM1 1h1v1H1zM6 1h1v1H6zM1 6h1v1H1zM6 6h1v1H6z" />
        ) : (
          // Luna pixelada
          <path d="M3 0h3v1H3zM2 1h2v1H2zM1 2h2v4H1zM2 6h2v1H2zM3 7h3v1H3zM4 6h3v1H4zM6 5h1v1H6z" />
        )}
      </svg>
      <span className="hidden sm:inline">{oscuro ? 'Día' : 'Noche'}</span>
    </button>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/visor', label: 'Visor' },
  { to: '/recorridos', label: 'Recorridos' },
  { to: '/glosario', label: 'Glosario' },
  { to: '/guia', label: 'Guía' },
]

const esActivo = (to: string, pathname: string) =>
  to === '/' ? pathname === '/' : pathname.startsWith(to)

export default function Navbar() {
  const isOffline = useOffline()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  return (
    <header
      ref={menuRef}
      className="relative z-50 flex items-center justify-between gap-3 border-b-2 border-line bg-surface/95 px-3 sm:px-4 text-ink backdrop-blur"
      style={{ height: 'var(--header-height)', minHeight: 'var(--header-height)' }}
    >
      {/* Marca */}
      <Link
        to="/"
        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        aria-label="EcoDex Sevilla, inicio"
      >
        <LogoDex className="w-7 h-8 flex-shrink-0" />
        <div className="leading-none">
          <div className="font-pixel text-lg font-bold tracking-tight glow">
            Eco<span className="text-accent">Dex</span>
          </div>
          <div className="dex-kicker mt-0.5 text-[9px] tracking-[0.2em]">Sevilla · Valle</div>
        </div>
      </Link>

      {/* Navegación de escritorio */}
      <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
        {NAV_LINKS.map(({ to, label }) => {
          const activo = esActivo(to, pathname)
          return (
            <Link
              key={to}
              to={to}
              aria-current={activo ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 font-ui text-sm transition-colors ${
                activo
                  ? 'bg-ink text-bg font-semibold dark:bg-accent dark:text-on-accent'
                  : 'text-ink-soft hover:bg-surface2 hover:text-ink'
              }`}
            >
              {activo && <span aria-hidden="true">▸ </span>}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Lado derecho */}
      <div className="flex items-center gap-2">
        <GeoSearch />
        <span
          className="hidden sm:flex items-center gap-1.5 font-ui text-[10px] font-semibold uppercase tracking-wider text-muted"
          role="status"
        >
          <span
            className={`dex-led ${isOffline ? 'dex-led-warn' : 'dex-led-ok'}`}
            aria-hidden="true"
          />
          {isOffline ? 'Sin conexión' : 'En línea'}
        </span>
        <TemaToggle />

        <button
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="md:hidden rounded-lg border-2 border-line bg-surface2 p-1.5"
        >
          <svg
            viewBox="0 0 8 8"
            className="w-4 h-4"
            shapeRendering="crispEdges"
            fill="currentColor"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path d="M1 1h1v1H1zM2 2h1v1H2zM3 3h2v2H3zM5 2h1v1H5zM6 1h1v1H6zM2 5h1v1H2zM1 6h1v1H1zM5 5h1v1H5zM6 6h1v1H6z" />
            ) : (
              <path d="M0 1h8v1H0zM0 3.5h8v1H0zM0 6h8v1H0z" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className="absolute top-full left-0 right-0 z-40 overflow-hidden border-b-2 border-line bg-surface md:hidden"
        style={{
          maxHeight: mobileOpen ? '360px' : '0',
          transition: 'max-height 0.3s ease',
          borderBottomWidth: mobileOpen ? 2 : 0,
        }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col py-2 px-4" aria-label="Navegación móvil">
          {NAV_LINKS.map(({ to, label }) => {
            const activo = esActivo(to, pathname)
            return (
              <Link
                key={to}
                to={to}
                tabIndex={mobileOpen ? 0 : -1}
                aria-current={activo ? 'page' : undefined}
                className={`py-3 px-2 font-ui text-sm border-b border-line-soft last:border-0 ${
                  activo ? 'text-accent font-semibold' : 'text-ink-soft'
                }`}
              >
                {activo ? '▸ ' : ''}
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
