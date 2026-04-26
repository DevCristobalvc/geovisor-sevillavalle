export default function Guia() {
  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      {/* Page header */}
      <div className="bg-verde-bosque text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-verde-palido/70 text-xs font-medium uppercase tracking-widest mb-1">
            Geovisor Ecopedagógico
          </p>
          <h1 className="text-2xl font-bold leading-tight mb-2">Guía de Uso</h1>
          <p className="text-verde-palido/80 text-sm max-w-xl">
            Aprende a navegar el Geovisor Ecopedagógico de Sevilla.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <GuiaSection titulo="¿Cómo explorar el mapa?" numero={1}>
            <p>
              En la pantalla del <strong>Visor</strong> verás el municipio de Sevilla centrado en
              zoom 13. Puedes hacer zoom con la rueda del ratón o con gestos en pantalla táctil.
              Arrastra el mapa para desplazarte.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Panel de capas" numero={2}>
            <p>
              A la izquierda encontrarás el <strong>Panel de Capas</strong> con 6 categorías
              temáticas. Haz clic en el nombre de una categoría para expandirla, y activa las
              subcapas con los interruptores. Puedes activar varias capas al mismo tiempo.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Consultar fichas pedagógicas" numero={3}>
            <p>
              Haz clic sobre cualquier elemento del mapa (río, actor social, área protegida...).
              Aparecerá un <strong>popup</strong> con información básica. Luego haz clic en "Ver
              ficha pedagógica" para abrir el panel lateral con descripción completa, galería de
              fotos, preguntas de reflexión y vocabulario clave.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Cambiar el mapa base" numero={4}>
            <p>
              En la esquina superior derecha del mapa encontrarás los botones
              <strong> Callejero</strong>, <strong>Satélite</strong> y <strong>Topográfico</strong>.
              El modo satélite permite ver la cobertura del suelo real del municipio.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Uso sin conexión" numero={5}>
            <p>
              Si abres el visor <strong>con conexión a internet</strong>, el navegador guardará
              automáticamente las capas GeoJSON y los tiles del mapa para zoom 10–14. La próxima vez
              podrás consultar el visor aunque no tengas señal. Los servicios WMS (capas raster)
              requieren conexión.
            </p>
          </GuiaSection>

          <GuiaSection titulo="Recorridos guiados" numero={6}>
            <p>
              Los <strong>Recorridos</strong> son narrativas temáticas con paradas georeferenciadas.
              El mapa vuela automáticamente a cada punto con información contextual. Ideal para
              actividades escolares en campo.
            </p>
          </GuiaSection>
        </div>

        <div className="mt-8 bg-verde-palido rounded-xl p-4 text-sm text-verde-bosque">
          <strong>¿Tienes preguntas?</strong> Este visor fue desarrollado como proyecto de grado en
          la Universidad Santiago de Cali. Grupo de investigación INFORMA.
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
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-verde-bosque text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
          {numero}
        </div>
        <div>
          <h2 className="font-bold text-gris-texto text-base mb-1">{titulo}</h2>
          <div className="text-sm text-gray-600 leading-relaxed font-pedagogica">{children}</div>
        </div>
      </div>
    </section>
  )
}
