import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-4 bg-negro text-white text-xs z-50"
      style={{ height: 'var(--footer-height)' }}
    >
      <span className="text-gray-400">
        Fuentes: CVC · IGAC · IDEAM · GBIF · OSM
      </span>
      <span className="hidden sm:block text-gray-500">
        Geovisor Ecopedagógico · USC · v2.0
      </span>
      <div className="flex gap-3">
        <Link to="/privacidad" className="text-gray-400 hover:text-white transition-colors">
          Privacidad
        </Link>
        <Link to="/creditos" className="text-gray-400 hover:text-white transition-colors">
          Créditos
        </Link>
      </div>
    </footer>
  )
}
