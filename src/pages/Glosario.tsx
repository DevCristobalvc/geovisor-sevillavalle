import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Dex'

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
      'Ecosistema de alta montaña de los Andes del norte, por encima del límite del bosque (en Colombia, aproximadamente desde los 3.000 m), con clima frío y húmedo; regula el agua y alberga especies únicas como los frailejones.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'Bosque andino',
    definicion:
      'Bosque de las laderas de los Andes, aproximadamente entre 1.000 y 3.500 m s. n. m. según la región, caracterizado por la neblina frecuente y una gran biodiversidad.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'CORINE Land Cover',
    definicion:
      'Metodología de origen europeo para clasificar y mapear la cobertura de la tierra con imágenes de satélite, adaptada para Colombia por el IDEAM. Su nivel más general distingue territorios artificializados, territorios agrícolas, bosques y áreas seminaturales, áreas húmedas y superficies de agua.',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'WMS',
    definicion:
      'Web Map Service: estándar del Open Geospatial Consortium (OGC) que permite pedir a un servidor, a través de internet, imágenes de mapas generadas al momento para el área y la escala que se están viendo.',
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
      'Situación en la que el uso actual de la tierra no corresponde con su vocación o uso potencial. El IGAC distingue el uso adecuado, la subutilización y la sobreutilización (cuando se exige a la tierra más de lo que soporta, lo que la degrada).',
    categoria: 'suelos',
    visorCategoria: 'suelos',
  },
  {
    termino: 'Paisaje Cultural Cafetero',
    definicion:
      'Patrimonio Mundial inscrito por la UNESCO en 2011 que reconoce el paisaje y la cultura cafetera de 47 municipios de cuatro departamentos: Caldas, Quindío, Risaralda y Valle del Cauca, entre ellos Sevilla.',
    categoria: 'territorio',
    visorCategoria: 'territorio',
  },
  {
    termino: 'Resguardo indígena',
    definicion:
      'Institución legal y sociopolítica: territorio de propiedad colectiva de una comunidad indígena, reconocido por el Estado, que según la Constitución de 1991 es inalienable, imprescriptible e inembargable (arts. 63 y 329).',
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
    termino: 'Área protegida',
    definicion:
      'Área definida geográficamente que ha sido designada, regulada y administrada para alcanzar objetivos específicos de conservación (Decreto 1076 de 2015). En Colombia integran el Sistema Nacional de Áreas Protegidas (SINAP).',
    categoria: 'biodiversidad',
    visorCategoria: 'biodiversidad',
  },
  {
    termino: 'Piso térmico',
    definicion:
      'Franja de altitud con una temperatura media similar. Según la clasificación de Caldas que usa el IGAC: cálido (menos de 1.000 m), templado (1.000–2.000 m), frío (2.000–3.000 m) y páramo (desde unos 3.000 m); en las cumbres más altas está el piso nival.',
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
    <main className="h-full overflow-y-auto">
      <PageHeader
        kicker="Enciclopedia de bolsillo"
        icono="libro"
        titulo="Glosario"
        descripcion="Términos clave del territorio, los ecosistemas y la cartografía del geovisor."
      />

      <div className="max-w-3xl mx-auto px-5 pb-10">
        <div className="relative mb-5">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-accent"
            aria-hidden="true"
          >
            &gt;
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="buscar término…"
            className="dex-input pl-7"
            aria-label="Buscar en el glosario"
          />
        </div>

        <p className="mb-3 font-ui text-xs text-muted" aria-live="polite">
          {filtrados.length} de {TERMINOS.length} términos
        </p>

        <div className="space-y-3">
          {filtrados.length === 0 && (
            <p className="font-ui text-sm text-muted">
              No se encontraron términos para «{busqueda}».
            </p>
          )}
          {filtrados.map((t, i) => {
            const color = CATEGORIAS_GLOSARIO[t.categoria] ?? '#888'
            return (
              <article key={i} className="dex-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-pixel text-lg font-bold text-ink">{t.termino}</h2>
                  <span
                    className="dex-chip flex-shrink-0 text-ink"
                    style={{ backgroundColor: `${color}26`, borderColor: color }}
                  >
                    {t.categoria}
                  </span>
                </div>
                <p className="mt-1 font-pedagogica text-sm leading-relaxed text-ink-soft">
                  {t.definicion}
                </p>
                {t.visorCategoria && (
                  <Link
                    to={`/visor?categoria=${t.visorCategoria}`}
                    className="mt-2 inline-flex items-center gap-1 font-ui text-xs font-semibold text-accent hover:underline"
                  >
                    ▶ Ver en el visor
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
