import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useOffline } from '../hooks/useOffline'

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
    if (q.trim().length < 3) { setResults([]); return }

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

export default function Navbar() {
  const isOffline = useOffline()
  const { pathname } = useLocation()

  return (
    <header
      className="flex items-center justify-between px-4 bg-verde-bosque text-white shadow-md z-50"
      style={{ height: 'var(--header-height)', minHeight: 'var(--header-height)' }}
    >
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-verde-claro rounded-full flex items-center justify-center text-verde-bosque font-bold text-sm" aria-hidden="true">
            G
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-sm leading-tight">Geovisor Ecopedagógico</div>
            <div className="text-xs text-verde-palido leading-tight">Sevilla, Valle del Cauca</div>
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-1" aria-label="Navegación principal">
        <NavLink to="/visor" current={pathname}>Visor</NavLink>
        <NavLink to="/recorridos" current={pathname}>Recorridos</NavLink>
        <NavLink to="/glosario" current={pathname}>Glosario</NavLink>
        <NavLink to="/guia" current={pathname}>Guía</NavLink>
      </nav>

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
      </div>
    </header>
  )
}

function NavLink({ to, current, children }: { to: string; current: string; children: React.ReactNode }) {
  const isActive = current.startsWith(to)
  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={`px-3 py-1.5 rounded text-sm transition-colors ${
        isActive
          ? 'bg-verde-claro text-verde-bosque font-semibold'
          : 'text-verde-palido hover:bg-verde-bosque/80 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}
