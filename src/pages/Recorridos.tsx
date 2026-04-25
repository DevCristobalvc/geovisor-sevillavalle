import { Link } from 'react-router-dom'

const RECORRIDOS = [
  {
    id: 'huellas_cafe',
    titulo: 'Las huellas del café',
    descripcion: 'Un recorrido por la historia cafetera de Sevilla: desde el Paisaje Cultural Cafetero hasta las transformaciones actuales del cultivo.',
    paradas: 4,
    duracion: '20 min',
    nivel: 'Grados 6–9',
    color: '#6D4C41',
    emoji: '☕',
  },
  {
    id: 'agua_sevilla',
    titulo: 'El agua en Sevilla',
    descripcion: 'Conoce las cuencas hidrográficas, los humedales y las estaciones de monitoreo que custodian el recurso hídrico del municipio.',
    paradas: 5,
    duracion: '25 min',
    nivel: 'Grados 7–9',
    color: '#1E88E5',
    emoji: '💧',
  },
  {
    id: 'paramo_vida',
    titulo: 'El páramo: fábrica de agua',
    descripcion: 'Explora los complejos de páramo Chili-Barragán y Las Hermosas, sus ecosistemas únicos y los actores que los protegen.',
    paradas: 3,
    duracion: '15 min',
    nivel: 'Grados 8–11',
    color: '#388E3C',
    emoji: '🌿',
  },
]

export default function Recorridos() {
  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-verde-bosque mb-2">Recorridos Guiados</h1>
        <p className="text-sm text-gris-texto mb-6">
          Narrativas temáticas por el territorio de Sevilla. Disponibles sin conexión si
          visitaste el visor previamente.
        </p>

        <div className="space-y-4">
          {RECORRIDOS.map(r => (
            <article
              key={r.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden flex"
            >
              <div
                className="w-2 flex-shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-2xl mr-2">{r.emoji}</span>
                    <h2 className="inline font-bold text-gris-texto text-base">{r.titulo}</h2>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{r.duracion}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed font-pedagogica">{r.descripcion}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>{r.paradas} paradas</span>
                    <span>·</span>
                    <span>{r.nivel}</span>
                  </div>
                  <Link
                    to={`/visor?recorrido=${r.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: r.color }}
                  >
                    Iniciar recorrido →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 bg-azul-palido rounded-xl p-4 text-sm text-azul-oscuro">
          <strong>Modo sin conexión:</strong> Los recorridos funcionan offline si abriste el
          visor antes con internet. Las fotos de cada parada se cargan desde el caché del dispositivo.
        </div>
      </div>
    </main>
  )
}
