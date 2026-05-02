export default function Creditos() {
  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      <div className="bg-verde-bosque text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-verde-palido/70 text-xs font-medium uppercase tracking-widest mb-1">
            Geovisor Ecopedagógico
          </p>
          <h1 className="text-2xl font-bold leading-tight mb-2">Créditos y Fuentes</h1>
          <p className="text-verde-palido/80 text-sm">
            Proyecto de grado · Universidad Santiago de Cali
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-3">Equipo de desarrollo</h2>
            <ul className="space-y-2 text-sm text-gris-texto font-pedagogica">
              <li className="flex gap-2">
                <span className="font-semibold">Estudiante investigador:</span>
                <span>Proyecto de Grado — Ingeniería de Sistemas, USC</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">Director:</span>
                <span>Grupo de investigación INFORMA, Universidad Santiago de Cali</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-3">
              Fuentes de datos geoespaciales
            </h2>
            <ul className="space-y-2 text-sm text-gris-texto font-pedagogica">
              <li>
                <strong>IGAC</strong> — Instituto Geográfico Agustín Codazzi. División
                político-administrativa, cobertura del suelo, conflictos de uso, zonificación
                forestal, pisos térmicos.
              </li>
              <li>
                <strong>CVC</strong> — Corporación Autónoma Regional del Valle del Cauca. Cuencas
                hidrográficas, ecosistemas, red hídrica, estaciones hidroclimatológicas.
              </li>
              <li>
                <strong>IDEAM</strong> — Instituto de Hidrología, Meteorología y Estudios
                Ambientales. Isoyetas de precipitación, datos climáticos históricos.
              </li>
              <li>
                <strong>SiB Colombia / GBIF</strong> — Sistema de Información sobre Biodiversidad de
                Colombia. Registros de especies de flora y fauna.
              </li>
              <li>
                <strong>RUNAP</strong> — Registro Único Nacional de Áreas Protegidas. Límites de
                áreas protegidas y categorías de manejo.
              </li>
              <li>
                <strong>MinCultura</strong> — Paisaje Cultural Cafetero (UNESCO, 2011).
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-3">Tecnologías utilizadas</h2>
            <ul className="space-y-1 text-sm text-gris-texto font-pedagogica list-disc list-inside">
              <li>React 18 + TypeScript 5 + Vite 5</li>
              <li>Leaflet 1.9 + React-Leaflet 4</li>
              <li>Tailwind CSS 3</li>
              <li>Vite PWA (Workbox)</li>
              <li>OpenStreetMap / Nominatim</li>
              <li>ESRI World Imagery</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-3">
              Imágenes y contenido multimedia
            </h2>
            <p className="text-sm text-gris-texto font-pedagogica">
              Las imágenes utilizadas en las fichas pedagógicas provienen de{' '}
              <strong>Wikimedia Commons</strong> bajo licencias Creative Commons. Los créditos
              individuales se especifican en cada ficha pedagógica. Los videos referenciados
              pertenecen a sus respectivos canales de YouTube.
            </p>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-3">Licencia</h2>
            <p className="text-sm text-gris-texto font-pedagogica">
              El código fuente de esta aplicación está disponible bajo licencia <strong>MIT</strong>
              . Los datos geoespaciales son propiedad de sus respectivas fuentes institucionales y
              están sujetos a sus propias políticas de uso.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
