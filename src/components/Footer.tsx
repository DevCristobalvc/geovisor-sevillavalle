import { Link } from 'react-router-dom'
import { PORTAL_GEOCVC } from '../config/layers.config'

export default function Footer() {
  return (
    <footer
      className="z-50 flex items-center justify-between gap-3 border-t-2 border-line bg-surface px-3 sm:px-4 font-ui text-[11px] text-muted"
      style={{ height: 'var(--footer-height)' }}
    >
      <span className="truncate">
        <span className="font-pixel font-bold text-ink">EcoDex</span>
        <span className="hidden sm:inline"> · Explora · Pregunta · Cuida</span>
      </span>
      <span className="hidden md:block">Fuentes: CVC · IDEAM · IGAC · OSM</span>
      <div className="flex gap-3">
        <Link to="/privacidad" className="hover:text-ink transition-colors">
          Privacidad
        </Link>
        <Link to="/creditos" className="hover:text-ink transition-colors">
          Créditos
        </Link>
        <a
          href={PORTAL_GEOCVC}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ir a GeoCVC (abre en nueva pestaña)"
          className="hidden sm:inline hover:text-ink transition-colors"
        >
          GeoCVC ↗
        </a>
      </div>
    </footer>
  )
}
