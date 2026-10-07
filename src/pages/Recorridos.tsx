import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, PixelIcon, type NombreIcono } from '../components/Dex'

const RECORRIDOS: {
  id: string
  titulo: string
  descripcion: string
  paradas: number
  duracion: string
  nivel: string
  color: string
  icono: NombreIcono
}[] = [
  {
    id: 'huellas_cafe',
    titulo: 'Las huellas del café',
    descripcion:
      'Un recorrido por la historia cafetera de Sevilla: desde el Paisaje Cultural Cafetero hasta las transformaciones actuales del cultivo.',
    paradas: 4,
    duracion: '20 min',
    nivel: 'Grados 6–9',
    color: '#6D4C41',
    icono: 'ruta',
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
    icono: 'agua',
  },
  {
    id: 'paramo_vida',
    titulo: 'El páramo: fábrica de agua',
    descripcion:
      'Explora los complejos de páramo Chilí-Barragán y Las Hermosas, sus ecosistemas únicos y los actores que los protegen.',
    paradas: 3,
    duracion: '15 min',
    nivel: 'Grados 8–9',
    color: '#2D6A4F',
    icono: 'biodiversidad',
  },
  {
    id: 'territorios_vida',
    titulo: 'Territorios de vida',
    descripcion:
      'Un recorrido por los actores y comunidades del territorio sevillano: resguardos, comunidades cafeteras y su relación con el entorno natural.',
    paradas: 4,
    duracion: '20 min',
    nivel: 'Grados 8–9',
    color: '#1B4F72',
    icono: 'territorio',
  },
]

export default function Recorridos() {
  return (
    <main className="h-full overflow-y-auto">
      <PageHeader
        kicker="Modo aventura"
        icono="ruta"
        titulo="Recorridos guiados"
        descripcion="Narrativas por el territorio de Sevilla. El mapa vuela a cada parada y te cuenta su historia."
      />

      <div className="max-w-3xl mx-auto px-5 pb-10">
        <ol className="space-y-4">
          {RECORRIDOS.map((r, i) => (
            <li key={r.id} className="dex-card overflow-hidden">
              <article className="flex">
                {/* Lomo del cartucho */}
                <div
                  className="tinta-tipo flex w-12 flex-shrink-0 flex-col items-center justify-between border-r-2 border-line py-3"
                  style={{ '--tipo': r.color, backgroundColor: `${r.color}26` } as CSSProperties}
                >
                  <PixelIcon nombre={r.icono} className="w-6 h-6" />
                  <span className="font-pixel text-sm font-bold text-ink" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 p-4">
                  <p className="dex-kicker">Ruta {String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-1 font-pixel text-xl font-bold text-ink">{r.titulo}</h2>
                  <p className="mt-1.5 font-pedagogica text-sm leading-relaxed text-ink-soft">
                    {r.descripcion}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 text-muted">
                      <span className="dex-chip">{r.paradas} paradas</span>
                      <span className="dex-chip">{r.duracion}</span>
                      <span className="dex-chip">{r.nivel}</span>
                    </div>
                    <Link
                      to={`/visor?recorrido=${r.id}`}
                      className="dex-btn-primary px-3 py-1.5 text-xs"
                    >
                      ▶ Iniciar
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="dex-screen mt-6 p-4">
          <p className="font-ui text-xs leading-relaxed">
            <span className="font-bold">Modo sin conexión:</span> los recorridos funcionan offline
            si abriste el visor antes con internet. Las capas WMS y los videos sí necesitan
            conexión.
          </p>
        </div>
      </div>
    </main>
  )
}
