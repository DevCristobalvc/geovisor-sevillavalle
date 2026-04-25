import { Link, useLocation } from 'react-router-dom'
import { useOffline } from '../hooks/useOffline'

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
          <div className="w-8 h-8 bg-verde-claro rounded-full flex items-center justify-center text-verde-bosque font-bold text-sm">
            G
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-sm leading-tight">Geovisor Ecopedagógico</div>
            <div className="text-xs text-verde-palido leading-tight">Sevilla, Valle del Cauca</div>
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-1">
        <NavLink to="/visor" current={pathname}>Visor</NavLink>
        <NavLink to="/recorridos" current={pathname}>Recorridos</NavLink>
        <NavLink to="/glosario" current={pathname}>Glosario</NavLink>
        <NavLink to="/guia" current={pathname}>Guía</NavLink>
      </nav>

      <div className="flex items-center gap-2">
        {isOffline && (
          <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
            Sin conexión
          </span>
        )}
        <a
          href="https://geo.cvc.gov.co"
          target="_blank"
          rel="noopener noreferrer"
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
