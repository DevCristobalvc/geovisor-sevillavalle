import { Link } from 'react-router-dom'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function IconCafe() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7.5V6a3 3 0 016 0v1.5M6 7.5h12l-1.5 10.5H7.5L6 7.5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 11.5c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5"
      />
    </svg>
  )
}

function IconAgua() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3C12 3 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 3 12 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5c.5 1.5 2 2.5 3.5 2" />
    </svg>
  )
}

function IconParamo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20L8 9l4 6 3-4 6 9H3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10l1.5-3 1.5 3" />
    </svg>
  )
}

function IconTerritorio() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-6 h-6"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3C12 3 8 8 8 12s4 9 4 9M12 3c0 0 4 5 4 9s-4 9-4 9"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15M4.5 16.5h15" />
    </svg>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const RECORRIDOS = [
  {
    id: 'huellas_cafe',
    titulo: 'Las huellas del café',
    descripcion:
      'Un recorrido por la historia cafetera de Sevilla: desde el Paisaje Cultural Cafetero hasta las transformaciones actuales del cultivo.',
    paradas: 4,
    duracion: '20 min',
    nivel: 'Grados 6–9',
    color: '#6D4C41',
    Icon: IconCafe,
  },
  {
    id: 'agua_sevilla',
    titulo: 'El agua en Sevilla',
    descripcion:
      'Conoce las cuencas hidrográficas, los humedales y las estaciones de monitoreo que custodian el recurso hídrico del municipio.',
    paradas: 5,
    duracion: '25 min',
    nivel: 'Grados 7–9',
    color: '#2E86C1',
    Icon: IconAgua,
  },
  {
    id: 'paramo_vida',
    titulo: 'El páramo: fábrica de agua',
    descripcion:
      'Explora los complejos de páramo Chili-Barragán y Las Hermosas, sus ecosistemas únicos y los actores que los protegen.',
    paradas: 3,
    duracion: '15 min',
    nivel: 'Grados 8–11',
    color: '#2D6A4F',
    Icon: IconParamo,
  },
  {
    id: 'territorios_vida',
    titulo: 'Territorios de vida',
    descripcion:
      'Un recorrido por los actores y comunidades del territorio sevillano: resguardos, comunidades cafeteras y su relación con el entorno natural.',
    paradas: 4,
    duracion: '20 min',
    nivel: 'Grados 8–11',
    color: '#1B4F72',
    Icon: IconTerritorio,
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function Recorridos() {
  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      {/* Page header */}
      <div className="bg-verde-bosque text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-verde-palido/70 text-xs font-medium uppercase tracking-widest mb-1">
            Geovisor Ecopedagógico
          </p>
          <h1 className="text-2xl font-bold leading-tight mb-2">Recorridos Guiados</h1>
          <p className="text-verde-palido/80 text-sm max-w-xl">
            Narrativas temáticas por el territorio de Sevilla. Disponibles sin conexión si visitaste
            el visor previamente.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Recorrido cards */}
        <div className="space-y-4">
          {RECORRIDOS.map(r => (
            <article
              key={r.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex">
                {/* Color accent bar */}
                <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: r.color }} />

                <div className="flex-1 p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: r.color + '18', color: r.color }}
                    >
                      <r.Icon />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-semibold text-gris-texto text-base leading-tight">
                          {r.titulo}
                        </h2>
                        <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">
                          {r.duracion}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed font-pedagogica">
                        {r.descripcion}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{r.paradas} paradas</span>
                          <span aria-hidden="true">·</span>
                          <span>{r.nivel}</span>
                        </div>
                        <Link
                          to={`/visor?recorrido=${r.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: r.color }}
                        >
                          Iniciar
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 8h10M9 4l4 4-4 4"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Offline notice */}
        <div className="mt-8 bg-azul-palido rounded-xl p-4 border border-azul-palido">
          <p className="text-sm text-azul-oscuro">
            <span className="font-semibold">Modo sin conexión:</span> Los recorridos funcionan
            offline si abriste el visor antes con internet. Las fotos de cada parada se cargan desde
            el caché del dispositivo.
          </p>
        </div>
      </div>
    </main>
  )
}
