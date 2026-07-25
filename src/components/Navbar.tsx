import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useOffline } from '../hooks/useOffline'

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
    <div className="relative hidden md:block">
      <input
        type="search"
        value={query}
        onChange={e => search(e.target.value)}
        placeholder="Buscar lugar..."
        aria-label="Buscar lugar en el mapa"
        className="w-44 lg:w-56 bg-white/15 text-white placeholder-white/60 border border-white/30 rounded px-3 py-1 text-xs focus:outline-none focus:bg-white/25 focus:border-white/60 transition-colors"
      />
      {searching && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 text-xs">…</div>
      )}
      {results.length > 0 && (
        <ul
          className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg z-50 min-w-full max-w-xs"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2 text-xs text-gris-texto hover:bg-verde-palido transition-colors first:rounded-t last:rounded-b"
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

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/visor', label: 'Visor' },
  { to: '/recorridos', label: 'Recorridos' },
  { to: '/glosario', label: 'Glosario' },
  { to: '/guia', label: 'Guía' },
]

export default function Navbar() {
  const isOffline = useOffline()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // Close on outside click
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
      className="relative flex items-center justify-between px-4 text-white z-50"
      style={{
        height: 'var(--header-height)',
        minHeight: 'var(--header-height)',
        background: 'linear-gradient(90deg, #0c1c14 0%, #123526 100%)',
        borderBottom: '1px solid rgba(82,183,136,0.22)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9 flex-shrink-0" aria-hidden="true">
            <defs>
              <linearGradient
                id="logoGrad"
                x1="0"
                y1="0"
                x2="32"
                y2="32"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#52B788" />
                <stop offset="1" stopColor="#2D6A4F" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
            {/* Capas apiladas (glifo GIS) */}
            <path d="M16 6l8 4-8 4-8-4 8-4z" fill="#fff" />
            <path
              d="M8 14l8 4 8-4"
              stroke="#fff"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M8 18l8 4 8-4"
              stroke="#fff"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </svg>
          <div className="hidden sm:block">
            <div className="font-bold text-sm leading-tight tracking-tight">
              Geovisor Ecopedagógico
            </div>
            <div className="text-[11px] text-verde-claro/80 leading-tight tracking-wide">
              Sevilla, Valle del Cauca
            </div>
          </div>
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} current={pathname}>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <GeoSearch />
        {isOffline && (
          <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
            Sin conexión
          </span>
        )}
        <a
          href="https://geo.cvc.gov.co"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ir a GeoCVC (abre en nueva pestaña)"
          className="hidden md:block text-xs text-verde-palido hover:text-white transition-colors"
        >
          GeoCVC ↗
        </a>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 rounded hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className="absolute top-full left-0 right-0 border-t border-white/10 shadow-lg z-40 overflow-hidden md:hidden"
        style={{
          maxHeight: mobileOpen ? '320px' : '0',
          transition: 'max-height 0.3s ease',
          background: 'linear-gradient(90deg, #0c1c14 0%, #123526 100%)',
        }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col py-2 px-4" aria-label="Navegación móvil">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              aria-current={
                (to === '/' ? pathname === '/' : pathname.startsWith(to)) ? 'page' : undefined
              }
              className={`py-3 px-2 text-sm font-medium border-b border-white/10 last:border-0 transition-colors ${
                (to === '/' ? pathname === '/' : pathname.startsWith(to))
                  ? 'text-verde-claro font-semibold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          {/* Mobile geocoder */}
          <div className="py-3">
            <input
              type="search"
              placeholder="Buscar lugar en el mapa..."
              aria-label="Buscar lugar en el mapa"
              onChange={e => {
                if (e.target.value.length >= 3) {
                  // Reuse same search logic via event — navigation happens in visor
                  window.dispatchEvent(
                    new CustomEvent('mobileGeoSearch', { detail: e.target.value })
                  )
                }
              }}
              className="w-full bg-white/15 text-white placeholder-white/50 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:bg-white/25"
            />
          </div>
        </nav>
      </div>
    </header>
  )
}

function NavLink({
  to,
  current,
  children,
}: {
  to: string
  current: string
  children: React.ReactNode
}) {
  const isActive = to === '/' ? current === '/' : current.startsWith(to)
  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={`px-3 py-1.5 rounded text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
        isActive
          ? 'bg-white/15 text-white font-semibold border-b-2 border-verde-claro rounded-b-none'
          : 'text-verde-palido/90 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}
