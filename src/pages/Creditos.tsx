import { PORTAL_GEOCVC } from '../config/layers.config'

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
                <span className="font-semibold">Estudiantes:</span>
                <span>Cristóbal Valencia Cerón · José David Molina Delgado</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">Dirección:</span>
                <span>Diego Fernando Loaiza · Silvia Andrea Quijano Pérez</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">Grupo:</span>
                <span>COMBA I+D — Ingeniería de Sistemas, Universidad Santiago de Cali</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">Tesis colaboradora:</span>
                <span>
                  «Cartografiar las huellas del café», de Jonathan Rodríguez Camacho, que aporta el
                  contenido ecopedagógico
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-3">
              Fuentes de datos geoespaciales
            </h2>
            <ul className="space-y-2 text-sm text-gris-texto font-pedagogica">
              <li>
                <strong>CVC</strong> — Corporación Autónoma Regional del Valle del Cauca,{' '}
                <a
                  href={PORTAL_GEOCVC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-azul-medio hover:underline"
                >
                  Portal GeoCVC
                </a>
                . Servicios WMS de red hídrica, ecosistemas, zonificación forestal e isoyetas de
                precipitación.
              </li>
              <li>
                <strong>IDEAM</strong> — Instituto de Hidrología, Meteorología y Estudios
                Ambientales. Servicios WMS de cobertura de la tierra 2024 y pisos térmicos.
              </li>
              <li>
                <strong>IGAC</strong> — Instituto Geográfico Agustín Codazzi. Servicio WMS de
                conflictos de uso de la tierra 2012.
              </li>
              <li>
                <strong>Datos ilustrativos</strong> — Las 16 capas GeoJSON (actores, cuencas,
                humedales, calidad del agua, monitoreo subterráneo, predios, páramos, áreas
                protegidas, especies, estaciones, división político-administrativa, resguardos y
                Paisaje Cultural Cafetero) son datos representativos elaborados por el equipo para
                el prototipo, con geometrías y cifras aproximadas. Se rotulan como «Ilustrativo» en
                el visor y no contienen datos personales.
              </li>
            </ul>
            <p className="mt-3 text-xs text-gray-500 font-pedagogica">
              Trece de ellas se reemplazarán por extractos oficiales de la CVC con{' '}
              <code>scripts/datos/build_capas_oficiales.py</code>. Los actores de humedales, páramo
              y bosque seco no tienen registros oficiales para Sevilla.
            </p>
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
