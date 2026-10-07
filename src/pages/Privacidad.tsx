import type { ReactNode } from 'react'
import { PageHeader } from '../components/Dex'

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="dex-card p-5">
      <h2 className="mb-2 font-pixel text-lg font-bold text-ink">{titulo}</h2>
      <div className="font-pedagogica text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export default function Privacidad() {
  return (
    <main className="h-full overflow-y-auto">
      <PageHeader
        kicker="Ley 1581 de 2012 · Protección de datos personales"
        titulo="Política de privacidad"
        descripcion="Última actualización: octubre de 2026"
      />

      <div className="max-w-3xl mx-auto px-5 pb-10 space-y-5">
        <Seccion titulo="1. Información general">
          <p>
            El EcoDex de Sevilla es una aplicación web estática de carácter educativo, desarrollada
            como proyecto de grado en la Universidad Santiago de Cali.
            <strong className="text-ink"> No recopila ni almacena datos personales</strong> de sus
            usuarios.
          </p>
        </Seccion>

        <Seccion titulo="2. Datos que NO recopilamos">
          <ul className="list-disc list-inside space-y-1">
            <li>No se crean cuentas de usuario ni se solicita registro.</li>
            <li>No se almacenan datos de geolocalización del dispositivo.</li>
            <li>No se usan cookies de seguimiento ni plataformas de analítica.</li>
            <li>No se transmite información a servidores propios de la aplicación.</li>
            <li>
              Las capas publicadas no contienen datos personales de terceros: los nombres de
              contacto, teléfonos y correos de las fuentes se omiten.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="3. Servicios de terceros">
          <p>La aplicación consulta servicios externos de mapas:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong className="text-ink">OpenStreetMap / OpenTopoMap / Esri:</strong> teselas del
              mapa base. Las solicitudes incluyen la IP del usuario según las políticas de cada
              proveedor.
            </li>
            <li>
              <strong className="text-ink">Geoservicios de la CVC, el IDEAM y el IGAC:</strong>{' '}
              capas WMS públicas de entidades del Estado colombiano.
            </li>
            <li>
              <strong className="text-ink">Nominatim (OpenStreetMap):</strong> geocodificación de
              búsquedas.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="4. Almacenamiento local">
          <p>
            La aplicación es una PWA (aplicación web progresiva). El navegador puede guardar
            localmente teselas y recursos estáticos para funcionar sin conexión. Si se elige el modo
            noche, esa preferencia se guarda solo mientras la pestaña esté abierta. Esta información
            permanece en el dispositivo del usuario y no se comparte.
          </p>
        </Seccion>

        <Seccion titulo="5. Contacto">
          <p>
            Para inquietudes sobre esta política, puede contactar al equipo de desarrollo a través
            del repositorio del proyecto en GitHub.
          </p>
        </Seccion>
      </div>
    </main>
  )
}
