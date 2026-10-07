import type { ReactNode } from 'react'
import { PORTAL_GEOCVC } from '../config/layers.config'
import { PageHeader } from '../components/Dex'

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="dex-card p-5">
      <h2 className="mb-3 font-pixel text-lg font-bold text-ink">{titulo}</h2>
      <div className="font-pedagogica text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export default function Creditos() {
  return (
    <main className="h-full overflow-y-auto">
      <PageHeader
        kicker="Proyecto de grado · Universidad Santiago de Cali"
        icono="actores"
        titulo="Créditos y fuentes"
      />

      <div className="max-w-3xl mx-auto px-5 pb-10 space-y-5">
        <Bloque titulo="Equipo">
          <dl className="space-y-2">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Estudiantes:</dt>
              <dd>Cristóbal Valencia Cerón · José David Molina Delgado</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Dirección:</dt>
              <dd>Diego Fernando Loaiza · Silvia Andrea Quijano Pérez</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Grupo:</dt>
              <dd>COMBA I+D — Ingeniería de Sistemas, Universidad Santiago de Cali</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Tesis colaboradora:</dt>
              <dd>
                «Cartografiar las huellas del café», de Jonathan Rodríguez Camacho, que aporta el
                contenido ecopedagógico
              </dd>
            </div>
          </dl>
        </Bloque>

        <Bloque titulo="Fuentes de datos geoespaciales">
          <ul className="space-y-2">
            <li>
              <strong className="text-ink">CVC</strong> — Corporación Autónoma Regional del Valle
              del Cauca,{' '}
              <a
                href={PORTAL_GEOCVC}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Portal GeoCVC
              </a>
              . Servicios WMS de red hídrica, ecosistemas, zonificación forestal e isoyetas, y los
              extractos GeoJSON de cuencas, humedales, calidad del agua, monitoreo subterráneo,
              predios Art. 111, páramos, áreas protegidas, especies, estaciones, división
              político-administrativa, resguardos, Paisaje Cultural Cafetero y actores del bosque
              andino.
            </li>
            <li>
              <strong className="text-ink">IDEAM</strong> — Instituto de Hidrología, Meteorología y
              Estudios Ambientales. Servicios WMS de cobertura de la tierra 2024 y pisos térmicos.
            </li>
            <li>
              <strong className="text-ink">IGAC</strong> — Instituto Geográfico Agustín Codazzi.
              Servicio WMS de conflictos de uso de la tierra 2012.
            </li>
            <li>
              <strong className="text-ink">Datos ilustrativos</strong> — Las capas de actores de
              humedales, páramo y bosque seco no tienen registros oficiales para Sevilla: son
              ejemplos elaborados por el equipo para el prototipo, sin datos personales, y se
              rotulan como «Ilustrativo» en el visor.
            </li>
          </ul>
          <p className="mt-3 font-ui text-xs text-muted">
            Los extractos GeoJSON se generan con <code>scripts/datos/build_capas_oficiales.py</code>
            , que filtra cada capa con el límite municipal oficial y omite los atributos con datos
            personales.
          </p>
        </Bloque>

        <Bloque titulo="Tecnologías">
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 font-ui text-xs">
            {[
              'React 18 + TypeScript 5 + Vite 5',
              'Leaflet 1.9 + React-Leaflet 4',
              'Tailwind CSS 3',
              'Vite PWA (Workbox)',
              'Turf.js',
              'OpenStreetMap / Nominatim',
              'Esri World Imagery',
              'Tipografías Pixelify Sans, Inter y JetBrains Mono',
            ].map(t => (
              <li key={t}>▸ {t}</li>
            ))}
          </ul>
        </Bloque>

        <Bloque titulo="Imágenes y contenido multimedia">
          <p>
            Las imágenes de las fichas pedagógicas provienen de <strong>Wikimedia Commons</strong>{' '}
            bajo licencias Creative Commons; los créditos individuales están en cada ficha. Los
            videos pertenecen a sus respectivos canales de YouTube.
          </p>
        </Bloque>

        <Bloque titulo="Licencia">
          <p>
            El código fuente está disponible bajo licencia <strong>MIT</strong>. Los datos
            geoespaciales son propiedad de sus fuentes institucionales y están sujetos a sus propias
            políticas de uso.
          </p>
        </Bloque>
      </div>
    </main>
  )
}
