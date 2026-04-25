import { Link } from 'react-router-dom'
import { CATEGORIAS } from '../config/layers.config'
import type { Categoria } from '../types'

const CATEGORIAS_LIST = Object.entries(CATEGORIAS) as [Categoria, (typeof CATEGORIAS)[Categoria]][]

export default function Home() {
  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      {/* Hero */}
      <section className="bg-verde-bosque text-white px-6 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Geovisor Ecopedagógico
          </h1>
          <p className="text-verde-palido text-lg mb-2">Sevilla, Valle del Cauca — Colombia</p>
          <p className="text-verde-palido/80 text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Explora las transformaciones socioecosistémicas de Sevilla a través de capas geográficas
            interactivas, fichas pedagógicas y recorridos guiados.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/visor"
              className="bg-verde-claro text-verde-bosque font-bold px-8 py-3 rounded-lg hover:bg-white transition-colors text-center"
            >
              Abrir Visor
            </Link>
            <Link
              to="/recorridos"
              className="border border-verde-palido text-verde-palido px-8 py-3 rounded-lg hover:bg-verde-palido hover:text-verde-bosque transition-colors text-center"
            >
              Ver Recorridos
            </Link>
          </div>
        </div>
      </section>

      {/* Contexto */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-verde-bosque mb-3">Territorio</h2>
            <p className="text-sm text-gris-texto leading-relaxed">
              Sevilla es un municipio cafetero del norte del Valle del Cauca, declarado Patrimonio
              Cultural de la Humanidad (UNESCO, 2011). Su territorio alberga páramos, bosque andino,
              bosque seco tropical y las cuencas de los ríos Bugalagrande, La Paila y La Vieja.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-verde-bosque mb-3">Enfoque Ecopedagógico</h2>
            <p className="text-sm text-gris-texto leading-relaxed">
              Cada capa geográfica lleva una ficha pedagógica con preguntas de reflexión, vocabulario
              clave y contenido multimedia contextualizado. Una herramienta didáctica para
              estudiantes de básica secundaria (10–15 años).
            </p>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="px-6 pb-10 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gris-texto mb-4">Temáticas del visor</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIAS_LIST.map(([key, info]) => (
            <Link
              key={key}
              to={`/visor?categoria=${key}`}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
            >
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: info.color }}
              >
                {info.label.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm text-gris-texto">{info.label}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{info.descripcion}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer créditos */}
      <section className="bg-negro text-white px-6 py-6 text-sm text-center text-gray-400">
        <p>
          Proyecto de Grado — Ingeniería de Sistemas · Universidad Santiago de Cali<br />
          Cristóbal Valencia Cerón · José David Molina Delgado · Director: Diego Fernando Loaiza
        </p>
      </section>
    </main>
  )
}
