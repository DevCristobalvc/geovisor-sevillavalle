import type { ReactNode } from 'react'
import { PageHeader } from '../components/Dex'

export default function Guia() {
  return (
    <main className="h-full overflow-y-auto">
      <PageHeader
        kicker="Manual de juego"
        icono="brujula"
        titulo="Guía de uso"
        descripcion="Aprende a navegar el EcoDex de Sevilla en siete pasos."
      />

      <div className="max-w-3xl mx-auto px-5 pb-10">
        <ol className="space-y-4">
          <GuiaSection titulo="Explora el mapa" numero={1}>
            <p>
              El <strong>Visor</strong> abre mostrando todo el municipio de Sevilla. Acerca y aleja
              con la rueda del ratón o con gestos en la pantalla, y arrastra el mapa para moverte.
            </p>
          </GuiaSection>

          <GuiaSection titulo="El dex de capas" numero={2}>
            <p>
              A la izquierda está el <strong>dex de capas</strong>: seis tipos (agua, biodiversidad,
              clima, suelos, territorio y actores sociales) con 23 capas numeradas. Abre un tipo y
              marca las capas que quieras ver; puedes combinar varias.
            </p>
            <p className="mt-2">
              Debajo de cada capa verás de qué entidad vienen sus datos (CVC, IDEAM o IGAC). Las
              capas marcadas como <strong>Ilustrativo</strong> son ejemplos preparados para el
              prototipo, no datos oficiales. En las capas WMS activas, el botón{' '}
              <strong>Ver leyenda</strong> explica qué significa cada color, y una luz te indica si
              el servicio respondió.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Abre la ficha" numero={3}>
            <p>
              Haz clic sobre un elemento del mapa: aparece su información y el botón{' '}
              <strong>Ver ficha pedagógica</strong>. La ficha trae una descripción, por qué es
              importante, una <strong>misión</strong> con preguntas para reflexionar, vocabulario y
              galería.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Cambia el mapa base" numero={4}>
            <p>
              Arriba a la derecha puedes elegir <strong>Callejero</strong>,{' '}
              <strong>Satélite</strong> o <strong>Topográfico</strong>. El satélite muestra la
              cobertura real del suelo.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Modo día y modo noche" numero={5}>
            <p>
              El botón <strong>Noche</strong> de la barra superior activa el modo terminal: fondo
              oscuro, letras de fósforo verde y mapa nocturno. El geovisor recuerda tu elección en
              este navegador.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Sin conexión" numero={6}>
            <p>
              Si abres el visor <strong>con internet</strong>, el navegador guarda las capas GeoJSON
              y el mapa del municipio (niveles de acercamiento 10 a 14). La próxima vez podrás
              consultarlo sin señal. Las capas WMS y los videos sí necesitan conexión.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Recorridos guiados" numero={7}>
            <p>
              Los <strong>Recorridos</strong> son rutas temáticas con paradas: el mapa vuela a cada
              punto y te cuenta su historia. Ideales para actividades en clase o en campo.
            </p>
          </GuiaSection>
        </ol>

        <div className="dex-screen mt-6 p-4 font-ui text-sm">
          <strong>¿Tienes preguntas?</strong> Este geovisor es un proyecto de grado de Ingeniería de
          Sistemas de la Universidad Santiago de Cali, grupo de investigación COMBA I+D.
        </div>
      </div>
    </main>
  )
}

function GuiaSection({
  titulo,
  numero,
  children,
}: {
  titulo: string
  numero: number
  children: ReactNode
}) {
  return (
    <li className="dex-card p-5">
      <div className="flex items-start gap-4">
        <span className="font-pixel text-2xl font-bold leading-none text-accent glow">
          {String(numero).padStart(2, '0')}
        </span>
        <div>
          <h2 className="font-pixel text-lg font-bold text-ink">{titulo}</h2>
          <div className="mt-1 font-pedagogica text-sm leading-relaxed text-ink-soft">
            {children}
          </div>
        </div>
      </div>
    </li>
  )
}
