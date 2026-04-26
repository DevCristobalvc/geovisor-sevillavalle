import { useState } from 'react'
import { Link } from 'react-router-dom'

const TERMINOS = [
  {
    termino: 'Cuenca hidrográfica',
    definicion:
      'Territorio que drena sus aguas hacia un mismo río, delimitado por las divisorias de aguas (montañas y cerros).',
    categoria: 'agua',
    visorCategoria: 'agua',
  },
  {
    termino: 'Caudal',
    definicion:
      'Volumen de agua que pasa por un punto determinado de un río en una unidad de tiempo, expresado en m³/s.',
    categoria: 'agua',
    visorCategoria: 'agua',
  },
  {
    termino: 'Páramo',
    definicion:
      'Ecosistema de alta montaña con clima frío y húmedo, regula el ciclo del agua y alberga flora y fauna únicas como los frailejones.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'Bosque andino',
    definicion:
      'Tipo de bosque que crece en las laderas de los Andes entre los 1000 y 3500 m.s.n.m., caracterizado por niebla y gran biodiversidad.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'CORINE Land Cover',
    definicion:
      'Sistema europeo de clasificación de coberturas del suelo adoptado en Colombia. Identifica superficies construidas, agrícolas y naturales.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'WMS',
    definicion:
      'Web Map Service: estándar OGC que permite obtener imágenes de mapas desde un servidor a través de internet, en tiempo real.',
    categoria: 'tecnologia',
    visorCategoria: null,
  },
  {
    termino: 'GeoJSON',
    definicion:
      'Formato estándar basado en JSON para representar datos geográficos (puntos, líneas y polígonos) con sus atributos.',
    categoria: 'tecnologia',
    visorCategoria: null,
  },
  {
    termino: 'Fragmentación ecosistémica',
    definicion:
      'División de hábitats naturales continuos en parches más pequeños y aislados, lo que reduce la biodiversidad y la conectividad ecológica.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'Isoyeta',
    definicion:
      'Línea en un mapa que une puntos con igual precipitación (cantidad de lluvia) en un período determinado.',
    categoria: 'clima',
    visorCategoria: 'clima',
  },
  {
    termino: 'Conflicto de uso del suelo',
    definicion:
      'Situación donde el uso actual de un terreno no coincide con su vocación o uso potencial natural, lo que puede causar degradación ambiental.',
    categoria: 'suelos',
    visorCategoria: 'suelos',
  },
  {
    termino: 'Paisaje Cultural Cafetero',
    definicion:
      'Patrimonio Cultural de la Humanidad (UNESCO 2011) que reconoce la cultura cafetera de seis departamentos colombianos, incluyendo parte del Valle del Cauca.',
    categoria: 'territorio',
    visorCategoria: 'territorio',
  },
  {
    termino: 'Resguardo indígena',
    definicion:
      'Institución legal que ampara la propiedad colectiva de una comunidad indígena sobre un territorio reconocido por el Estado colombiano.',
    categoria: 'territorio',
    visorCategoria: 'territorio',
  },
  {
    termino: 'Ecopedagogía',
    definicion:
      'Enfoque educativo que articula educación, territorio y ecología para formar conciencia ecológica crítica (Zimmermann, 2005).',
    categoria: 'pedagogia',
    visorCategoria: null,
  },
  {
    termino: 'Área Protegida',
    definicion:
      'Zona del territorio declarada por el Estado para conservar la naturaleza y sus servicios ecosistémicos, con restricciones de uso.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'Piso térmico',
    definicion:
      'Zona altitudinal con características climáticas similares. En Colombia se distinguen: cálido, templado, frío, páramo y pico de nieve.',
    categoria: 'clima',
    visorCategoria: 'clima',
  },
]

const CATEGORIAS_GLOSARIO: Record<string, string> = {
  agua: '#2E86C1',
  biodiversidad: '#2D6A4F',
  clima: '#F39C12',
  suelos: '#8B6914',
  territorio: '#1B4F72',
  tecnologia: '#546E7A',
  pedagogia: '#8E24AA',
}

export default function Glosario() {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = TERMINOS.filter(
    t =>
      t.termino.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.definicion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-verde-bosque mb-2">Glosario Territorial</h1>
        <p className="text-sm text-gris-texto mb-6">
          Términos clave ecopedagógicos, ecosistémicos y cartográficos del Geovisor.
        </p>

        <input
          type="search"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar término..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-verde-bosque"
          aria-label="Buscar en el glosario"
        />

        <div className="space-y-3">
          {filtrados.length === 0 && (
            <p className="text-sm text-gray-400">No se encontraron términos para "{busqueda}".</p>
          )}
          {filtrados.map((t, i) => (
            <article
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm border-l-4"
              style={{ borderColor: CATEGORIAS_GLOSARIO[t.categoria] ?? '#ccc' }}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-gris-texto text-base">{t.termino}</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ backgroundColor: CATEGORIAS_GLOSARIO[t.categoria] ?? '#ccc' }}
                >
                  {t.categoria}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed font-pedagogica">
                {t.definicion}
              </p>
              {t.visorCategoria && (
                <Link
                  to={`/visor?categoria=${t.visorCategoria}`}
                  className="inline-flex items-center gap-1 text-xs mt-2 font-medium"
                  style={{ color: CATEGORIAS_GLOSARIO[t.categoria] }}
                >
                  Ver en visor →
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
