export default function Privacidad() {
  return (
    <main className="overflow-y-auto h-full bg-gris-claro">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-verde-bosque mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: enero de 2025</p>

        <div className="space-y-6 text-sm text-gris-texto leading-relaxed font-pedagogica">
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-2">1. Información general</h2>
            <p>
              El Geovisor Ecopedagógico de Sevilla es una aplicación web estática de carácter
              educativo, desarrollada como proyecto de grado en la Universidad Santiago de Cali.
              <strong> No recopila ni almacena datos personales</strong> de sus usuarios.
            </p>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-2">2. Datos que NO recopilamos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>No se crean cuentas de usuario ni se solicita registro.</li>
              <li>No se almacenan datos de geolocalización del dispositivo.</li>
              <li>No se usan cookies de seguimiento ni plataformas de analítica.</li>
              <li>No se transmite información a servidores propios de la aplicación.</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-2">3. Servicios de terceros</h2>
            <p>La aplicación consulta servicios externos de mapas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>OpenStreetMap / CARTO / OpenTopoMap / ESRI:</strong> tiles del mapa base.
                Las solicitudes incluyen la IP del usuario según las políticas de cada proveedor.
              </li>
              <li>
                <strong>Geoservicios IGAC / CVC / IDEAM:</strong> capas WMS públicas del gobierno
                colombiano.
              </li>
              <li>
                <strong>Nominatim (OpenStreetMap):</strong> geocodificación de búsquedas.
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-2">4. Almacenamiento local</h2>
            <p>
              La aplicación es un PWA (Progressive Web App). El navegador puede almacenar
              localmente tiles y recursos estáticos para su funcionamiento sin conexión.
              Esta información permanece en el dispositivo del usuario y no se comparte.
            </p>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base text-gris-texto mb-2">5. Contacto</h2>
            <p>
              Para inquietudes sobre esta política, puede contactar al equipo de desarrollo a
              través del repositorio del proyecto en GitHub.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
