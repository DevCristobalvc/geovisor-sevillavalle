import { useEffect, useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CABECERA,
  CABECERA_COORDS,
  CORREGIMIENTOS,
  CUENCAS,
  PARAMOS,
  PCC,
  SILUETA,
  UNIDADES_POR_KM,
} from '../config/siluetas'

// ─── Ficha territorial de Sevilla ─────────────────────────────────────────────
// Una consola de bolsillo cuya pantalla recorre, una a una, capas oficiales de la CVC
// (public/data) proyectadas al marco de la silueta del municipio. Cada capa se corresponde
// con una fila de la ficha; las cifras son las verificadas con esa misma cartografía.

type IdCapa = 'limite' | 'corregimientos' | 'cuencas' | 'paramos' | 'pcc'

const CAPAS: {
  id: IdCapa
  etiqueta: string
  valor: string
  titulo: string
  detalle: string
  /** Capas del visor que abre el botón A */
  visor: string
}[] = [
  {
    id: 'limite',
    etiqueta: 'Área',
    valor: '538 km²',
    titulo: 'Límite municipal',
    detalle: 'Norte del Valle del Cauca',
    visor: 'territorio_division',
  },
  {
    id: 'corregimientos',
    etiqueta: 'Corregimientos',
    valor: '16',
    titulo: 'División político-administrativa',
    detalle: 'Más la cabecera municipal',
    visor: 'territorio_division',
  },
  {
    id: 'cuencas',
    etiqueta: 'Cuencas',
    valor: '4',
    titulo: 'Cuencas hidrográficas',
    detalle: 'Bugalagrande · La Paila · Las Cañas · La Vieja',
    visor: 'territorio_division,agua_cuencas',
  },
  {
    id: 'paramos',
    etiqueta: 'Páramos',
    valor: '2 complejos',
    titulo: 'Complejos de páramo',
    detalle: 'Chilí-Barragán · Las Hermosas',
    visor: 'territorio_division,biodiversidad_paramos',
  },
  {
    id: 'pcc',
    etiqueta: 'Paisaje Cafetero',
    valor: 'UNESCO 2011',
    titulo: 'Paisaje Cultural Cafetero',
    detalle: 'Zona principal y de amortiguamiento',
    visor: 'territorio_division,territorio_pcc',
  },
]

const PASO_MS = 4200
const KM_ESCALA = 10

const prefiereQuieto = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function DexSevilla() {
  const uid = useId().replace(/:/g, '')
  const [actual, setActual] = useState(0)
  // Rotación automática; arranca detenida si el sistema pide reducir el movimiento
  const [auto, setAuto] = useState(() => !prefiereQuieto())
  // Se detiene mientras el puntero o el foco están sobre el dex (WCAG 2.2.2)
  const [enUso, setEnUso] = useState(false)
  // La primera capa espera a que termine el trazo de encendido
  const [encendiendo, setEncendiendo] = useState(true)

  useEffect(() => {
    if (!auto || enUso) return
    const id = window.setTimeout(() => {
      setEncendiendo(false)
      setActual(i => (i + 1) % CAPAS.length)
    }, PASO_MS)
    return () => window.clearTimeout(id)
  }, [auto, enUso, actual])

  const elegir = (i: number) => {
    setAuto(false)
    setEncendiendo(false)
    setActual((i + CAPAS.length) % CAPAS.length)
  }

  const capa = CAPAS[actual]
  const relleno = (patron: string) => `url(#${uid}-${patron})`
  const retraso = { animationDelay: encendiendo ? '1.5s' : '0s' }
  const escala = KM_ESCALA * UNIDADES_POR_KM

  const geometria: Record<IdCapa, ReactNode> = {
    limite: <path d={SILUETA} fill={relleno('puntos')} />,
    corregimientos: (
      <path d={CORREGIMIENTOS} className="fill-none stroke-lcd-ink" strokeWidth="0.8" />
    ),
    cuencas: CUENCAS.map((c, i) => (
      <path
        key={c.nombre}
        d={c.d}
        fill={relleno(['rayas', 'puntos', 'solido', 'cuadros'][i % 4])}
        className="stroke-lcd-ink"
        strokeWidth="0.7"
      />
    )),
    paramos: PARAMOS.map(p => <path key={p.nombre} d={p.d} className="fill-lcd-ink" />),
    // Zona principal sólida; zona de amortiguamiento rayada
    pcc: PCC.map(p => {
      const principal = !/amortigu/i.test(p.zona)
      return (
        <path
          key={p.zona}
          d={p.d}
          fill={principal ? undefined : relleno('rayas')}
          className={principal ? 'fill-lcd-ink' : 'stroke-lcd-ink'}
          strokeWidth="0.6"
        />
      )
    }),
  }

  return (
    <aside
      className="dex-card relative mx-auto w-full max-w-[27rem] p-4 sm:p-5"
      aria-label="Ficha territorial del municipio de Sevilla"
      onMouseEnter={() => setEnUso(true)}
      onMouseLeave={() => setEnUso(false)}
      onFocus={() => setEnUso(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEnUso(false)
      }}
    >
      {/* Cabezal: lente y luces de estado */}
      <div className="flex items-center gap-3">
        <span
          className="relative h-10 w-10 flex-shrink-0 rounded-full border-2 border-line bg-accent"
          style={{ boxShadow: 'inset -3px -3px 0 rgb(0 0 0 / 0.18)' }}
          aria-hidden="true"
        >
          <span className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-white/70" />
        </span>
        <span className="dex-led dex-led-error" aria-hidden="true" />
        <span className="dex-led dex-led-warn" aria-hidden="true" />
        <span
          className={`dex-led dex-led-ok ${auto && !enUso ? 'animate-led-pulse' : ''}`}
          aria-hidden="true"
        />
        <span className="ml-auto font-ui text-[10px] font-bold uppercase tracking-widest text-muted">
          Ficha territorial
        </span>
      </div>

      {/* Pantalla */}
      <div className="dex-screen lcd-rejilla mt-3 overflow-hidden p-3">
        <div className="lcd-encender">
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
            <span className="flex items-center gap-2">
              <span>
                Capa {actual + 1}/{CAPAS.length}
              </span>
              <span className="flex gap-0.5" aria-hidden="true">
                {CAPAS.map((c, i) => (
                  <span
                    key={c.id}
                    className={`h-1.5 w-2 border border-current ${i === actual ? 'bg-current' : ''}`}
                  />
                ))}
              </span>
            </span>
            <span>
              <span className="sr-only">Cabecera municipal: </span>
              {CABECERA_COORDS}
            </span>
          </div>

          <div className="mt-2 flex items-stretch gap-3">
            <svg
              viewBox="-4 -4 103 168"
              className="lcd-brillo h-52 w-auto flex-shrink-0 overflow-visible sm:h-60"
              aria-hidden="true"
            >
              <defs>
                <pattern id={`${uid}-puntos`} width="3" height="3" patternUnits="userSpaceOnUse">
                  <rect width="1.3" height="1.3" className="fill-lcd-ink" />
                </pattern>
                <pattern
                  id={`${uid}-rayas`}
                  width="3"
                  height="3"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="1.1" height="3" className="fill-lcd-ink" />
                </pattern>
                <pattern
                  id={`${uid}-cuadros`}
                  width="2.4"
                  height="2.4"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="1.2" height="1.2" className="fill-lcd-ink" />
                  <rect x="1.2" y="1.2" width="1.2" height="1.2" className="fill-lcd-ink" />
                </pattern>
                <pattern id={`${uid}-solido`} width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="4" height="4" className="fill-lcd-ink/40" />
                </pattern>
                <clipPath id={`${uid}-revelar`} clipPathUnits="userSpaceOnUse">
                  <rect
                    key={actual}
                    x="-4"
                    y="-4"
                    width="103"
                    height="168"
                    className="lcd-revelar"
                    style={retraso}
                  />
                </clipPath>
              </defs>

              <path d={SILUETA} className="lcd-relleno fill-lcd-ink/10" />
              <g clipPath={`url(#${uid}-revelar)`}>{geometria[capa.id]}</g>
              <path
                d={SILUETA}
                pathLength={1}
                className="lcd-trazo fill-none stroke-lcd-ink"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Cabecera municipal */}
              <rect
                x={CABECERA.x - 2.6}
                y={CABECERA.y - 2.6}
                width="5.2"
                height="5.2"
                className="fill-lcd-ink stroke-lcd stroke-[0.8] animate-blink"
              />
              {/* Barra de escala (el rótulo va en HTML, al pie de la pantalla) */}
              <path
                d={`M0 152v4h${escala.toFixed(1)}v-4`}
                className="fill-none stroke-lcd-ink"
                strokeWidth="1.4"
              />
              {/* Línea de escaneo que acompaña el revelado de cada capa */}
              <rect
                key={`barrido-${actual}`}
                x="-4"
                y="-6"
                width="103"
                height="2"
                className="lcd-barrido fill-lcd-ink"
                style={retraso}
              />
            </svg>

            <div className="flex min-w-0 flex-1 flex-col">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
                N.º 76736
              </p>
              <p className="lcd-texto mt-1 font-pixel text-3xl font-bold leading-none sm:text-4xl">
                Sevilla
              </p>
              <p className="mt-1 text-[11px] leading-snug opacity-90">
                Valle del Cauca
                <span className="block opacity-90">El N.º es su código DANE</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {['Cafetero', 'Andino', 'Páramo'].map(t => (
                  <span key={t} className="dex-chip border-current">
                    {t}
                  </span>
                ))}
              </div>

              {/* Lectura de la capa en pantalla */}
              <div
                key={capa.id}
                className="mt-auto border-t-2 border-dashed border-lcd-ink/40 pt-2 animate-fade-in"
              >
                <p className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wider opacity-80">
                  ▸ {capa.titulo}
                </p>
                {/* Cifra en monoespaciada: en Pixelify Sans el 5 se confunde con una S */}
                <p className="lcd-texto mt-1 font-mono text-2xl font-bold leading-none tracking-tight sm:text-[1.7rem]">
                  {capa.valor}
                </p>
                <p className="mt-1 text-[11px] leading-snug opacity-90">{capa.detalle}</p>
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase opacity-80">
            <span>
              <span className="sr-only">Barra de escala: </span>
              {KM_ESCALA} km
            </span>
            <span>Fuente: CVC</span>
          </div>
        </div>
      </div>

      {/* Ficha: cada fila muestra su capa en la pantalla */}
      <ul className="mt-3 divide-y divide-line-soft font-ui text-xs">
        {CAPAS.map((c, i) => {
          const activa = i === actual
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => elegir(i)}
                aria-pressed={activa}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
                  activa ? 'bg-accent-soft' : 'hover:bg-surface2'
                }`}
              >
                <span className={activa ? 'font-semibold text-ink' : 'text-muted'}>
                  <span
                    className={`mr-1 text-accent ${activa ? '' : 'invisible'}`}
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                  {c.etiqueta}
                </span>
                <span className="font-semibold text-ink">{c.valor}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Controles: la cruceta cambia de capa, la pastilla pausa y A/B navegan */}
      <div className="mt-3 flex items-center justify-between">
        <div className="relative h-14 w-14 text-ink">
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full"
            shapeRendering="crispEdges"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0h8v8h8v8h-8v8H8v-8H0V8h8z" />
            <path d="M3 11h2v2H3zM19 11h2v2h-2z" className="fill-surface" />
          </svg>
          <button
            type="button"
            onClick={() => elegir(actual - 1)}
            aria-label="Capa anterior"
            className="absolute inset-y-0 left-0 w-1/2 rounded-l-md"
          />
          <button
            type="button"
            onClick={() => elegir(actual + 1)}
            aria-label="Capa siguiente"
            className="absolute inset-y-0 right-0 w-1/2 rounded-r-md"
          />
        </div>

        <button
          type="button"
          onClick={() => setAuto(a => !a)}
          aria-pressed={!auto}
          aria-label="Pausa del recorrido automático de capas"
          className="group flex flex-col items-center gap-1 rounded-md px-2 py-1"
        >
          {/* Pastilla de consola: se ilumina mientras el recorrido está en pausa */}
          <span
            className={`block h-3 w-10 -rotate-12 rounded-full border-2 border-line ${
              auto ? 'bg-ink/60 group-hover:bg-ink/80' : 'bg-accent'
            }`}
            aria-hidden="true"
          />
          <span
            className={`font-ui text-[9px] font-bold uppercase tracking-widest ${
              auto ? 'text-muted' : 'text-accent'
            }`}
          >
            Pausa
          </span>
        </button>

        <div className="flex items-end gap-2">
          <Link
            to="/recorridos"
            aria-label="Botón B: recorridos guiados"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-earth font-pixel text-sm font-bold text-surface shadow-dex-sm"
          >
            B
          </Link>
          <Link
            to={`/visor?layers=${capa.visor}`}
            aria-label={`Botón A: ver ${capa.titulo.toLowerCase()} en el visor`}
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-accent font-pixel text-sm font-bold text-on-accent shadow-dex-sm"
          >
            A
          </Link>
        </div>
      </div>
    </aside>
  )
}
