import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIAS, LAYERS } from '../config/layers.config'
import { LogoDex, PixelIcon, type NombreIcono } from '../components/Dex'
import DexSevilla from '../components/DexSevilla'
import FondoTopografico from '../components/FondoTopografico'
import type { Categoria, LayerConfig } from '../types'

// ─── Cifras: se calculan desde la configuración de capas para que no se desactualicen ──

const FICHAS = new Set(LAYERS.map(l => l.fichaId)).size
const RECORRIDOS = 4

const CIFRAS = [
  { valor: LAYERS.length, etiqueta: 'capas temáticas' },
  { valor: FICHAS, etiqueta: 'fichas pedagógicas' },
  { valor: RECORRIDOS, etiqueta: 'recorridos guiados' },
]

const OFICIALES = LAYERS.filter(l => !l.fuente.ilustrativo)
const ILUSTRATIVAS = LAYERS.filter(l => l.fuente.ilustrativo)
const WMS = LAYERS.filter(l => l.tipo === 'wms')
const GEOJSON = LAYERS.filter(l => l.tipo === 'geojson')

/** Agrupa capas por entidad productora, de la que más aporta a la que menos */
function porEntidad(capas: LayerConfig[]) {
  const grupos = new Map<string, LayerConfig[]>()
  for (const c of capas) grupos.set(c.fuente.entidad, [...(grupos.get(c.fuente.entidad) ?? []), c])
  return [...grupos].sort((a, b) => b[1].length - a[1].length)
}

const GRUPOS_FUENTE = [
  ...porEntidad(OFICIALES).map(([nombre, capas]) => ({ nombre, capas, ilustrativo: false })),
  { nombre: 'Ilustrativas', capas: ILUSTRATIVAS, ilustrativo: true },
]

/** Textura de las capas ilustrativas en la pantalla de fuentes */
const RAYADO: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgb(var(--c-lcd-ink)) 0 1.5px, transparent 1.5px 4px)',
}

const resumen = (capas: LayerConfig[]) =>
  porEntidad(capas.filter(c => !c.fuente.ilustrativo))
    .map(([e, c]) => `${e} ${c.length}`)
    .join(' · ')

const GARANTIAS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'capas',
    titulo: `${WMS.length} servicios WMS en vivo`,
    texto: resumen(WMS),
  },
  {
    icono: 'territorio',
    titulo: `${GEOJSON.length} capas GeoJSON`,
    texto: `${GEOJSON.filter(c => !c.fuente.ilustrativo).length} extraídas de la CVC · ${ILUSTRATIVAS.length} ilustrativas, rotuladas en el mapa`,
  },
  {
    icono: 'brujula',
    titulo: 'Funciona sin conexión',
    texto: 'Aplicación web progresiva, sin servidor ni base de datos propios',
  },
]

// ─── Ruta pedagógica: Explora · Pregunta · Cuida ──────────────────────────────

const PASOS: { titulo: string; texto: string; icono: NombreIcono }[] = [
  {
    titulo: 'Explora',
    texto: 'Activa capas oficiales sobre el mapa de Sevilla y compáralas.',
    icono: 'capas',
  },
  {
    titulo: 'Pregunta',
    texto: 'Lee la ficha pedagógica y responde sus preguntas orientadoras.',
    icono: 'libro',
  },
  {
    titulo: 'Cuida',
    texto: 'Sigue un recorrido guiado y reflexiona sobre tu territorio.',
    icono: 'ruta',
  },
]

const TIPOS = Object.entries(CATEGORIAS) as [Categoria, (typeof CATEGORIAS)[Categoria]][]

const CREDITOS: { titulo: string; lineas: string[] }[] = [
  {
    titulo: 'Trabajo de grado',
    lineas: ['Ingeniería de Sistemas', 'Universidad Santiago de Cali', 'Grupo COMBA I+D'],
  },
  { titulo: 'Autores', lineas: ['Cristóbal Valencia Cerón', 'José David Molina Delgado'] },
  { titulo: 'Dirección', lineas: ['Diego Fernando Loaiza', 'Silvia Andrea Quijano Pérez'] },
  {
    titulo: 'Contenido ecopedagógico',
    lineas: ['Tesis «Cartografiar las huellas del café»', 'Jonathan Rodríguez Camacho'],
  },
]

const n2 = (i: number) => String(i + 1).padStart(2, '0')

export default function Home() {
  const bajar = () =>
    document.getElementById('categorias')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })

  return (
    <main className="h-full overflow-y-auto">
      {/* ── Portada ─────────────────────────────────────────────────────── */}
      <section className="relative isolate flex items-center overflow-hidden lg:min-h-full">
        <div className="fondo-cuadricula absolute inset-0 -z-10" aria-hidden="true" />
        <FondoTopografico className="absolute inset-0 -z-10 h-full w-full" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:pb-16">
          <div className="animate-fade-up">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-lg border-2 border-line bg-surface px-2 py-1 shadow-dex-sm">
                <LogoDex className="h-4 w-3.5" />
                <span className="font-pixel text-sm font-bold leading-none text-ink">
                  Eco<span className="text-accent">Dex</span>
                </span>
              </span>
              <span className="dex-kicker">Prototipo funcional</span>
            </p>

            <h1
              className="dex-title glow mt-6 leading-[0.95]"
              style={{ fontSize: 'clamp(2.55rem, 6vw, 4.6rem)' }}
            >
              Geovisor
              <span className="block text-accent">Ecopedagógico</span>
              <span className="sr-only"> de </span>
              <span className="mt-4 flex items-center gap-2 font-ui text-base font-semibold uppercase tracking-[0.14em] text-ink-soft [text-shadow:none] sm:text-lg">
                <PixelIcon nombre="territorio" className="h-4 w-4 text-accent" />
                Sevilla, Valle del Cauca
              </span>
            </h1>

            <p className="mt-6 font-mono text-lg font-bold tracking-wide text-ink sm:text-xl">
              Explora · Pregunta · Cuida
              <span className="ml-1 animate-blink text-accent" aria-hidden="true">
                ▌
              </span>
            </p>
            <p className="mt-2 max-w-md leading-relaxed text-ink-soft">
              Cartografía oficial, fichas pedagógicas y recorridos guiados para el reconocimiento
              crítico de las transformaciones socioecosistémicas del municipio.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/visor" className="dex-btn-primary px-5 py-2.5">
                <span className="font-pixel text-xs opacity-80" aria-hidden="true">
                  ▶ START
                </span>
                Abrir el visor
              </Link>
              <Link to="/recorridos" className="dex-btn-ghost px-5 py-2.5">
                <span className="font-pixel text-xs text-muted" aria-hidden="true">
                  SELECT
                </span>
                Recorridos guiados
              </Link>
            </div>

            <dl className="mt-9 grid max-w-md grid-cols-3 gap-3 sm:max-w-lg sm:gap-6">
              {CIFRAS.map(c => (
                <div
                  key={c.etiqueta}
                  className="flex flex-col-reverse justify-end border-l-2 border-line/25 pl-3"
                >
                  <dt className="mt-1 font-ui text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {c.etiqueta}
                  </dt>
                  <dd className="glow font-pixel text-3xl font-bold leading-none text-accent">
                    {c.valor}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 inline-flex items-center gap-2 font-ui text-xs text-muted">
              <PixelIcon nombre="libro" className="h-3.5 w-3.5 text-accent" />
              Para estudiantes de grados 6.º a 9.º y sus docentes
            </p>
          </div>

          <div className="relative animate-fade-up">
            <div className="aura-dex absolute -inset-12 -z-10 rounded-full" aria-hidden="true" />
            <DexSevilla />
          </div>
        </div>

        <button
          type="button"
          onClick={bajar}
          className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 flex-col items-center rounded-md px-2 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-ink lg:flex"
        >
          Explorar
          <span className="animate-blink text-accent" aria-hidden="true">
            ▼
          </span>
        </button>
      </section>

      {/* ── Categorías ──────────────────────────────────────────────────── */}
      <section id="categorias" className="scroll-mt-2 border-t-2 border-line/15 px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <Encabezado kicker="Seis categorías temáticas" titulo="Seis miradas al territorio" />
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TIPOS.map(([clave, info], i) => {
              const n = LAYERS.filter(l => l.categoria === clave).length
              return (
                <li key={clave}>
                  <Link
                    to={`/visor?categoria=${clave}`}
                    aria-label={`${info.label}: ${n} ${n === 1 ? 'capa' : 'capas'}. Explorar en el visor`}
                    title={info.descripcion}
                    className="dex-card group flex h-full flex-col p-4 transition-transform duration-150 hover:-translate-y-1"
                  >
                    <span className="flex items-start justify-between">
                      <span
                        className="tinta-tipo flex h-12 w-12 items-center justify-center rounded-lg border-2 border-line transition-transform duration-150 group-hover:scale-105"
                        style={
                          {
                            '--tipo': info.color,
                            backgroundColor: `${info.color}22`,
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <PixelIcon nombre={clave} className="h-7 w-7" />
                      </span>
                      <span className="font-mono text-[10px] text-muted" aria-hidden="true">
                        {n2(i)}
                      </span>
                    </span>
                    <span className="mt-4 block font-pixel text-lg font-bold leading-tight text-ink">
                      {info.label}
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-2">
                      <span className="dex-chip text-muted">
                        {n} {n === 1 ? 'capa' : 'capas'}
                      </span>
                      <span
                        className="font-mono text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        ▶
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── En el aula ──────────────────────────────────────────────────── */}
      <section className="border-t-2 border-line/15 px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <Encabezado kicker="En el aula" titulo="Del mapa a la reflexión, en tres pasos" />
          <ol className="mt-7 grid gap-4 md:grid-cols-3 md:gap-6">
            {PASOS.map((p, i) => (
              <li key={p.titulo} className="dex-card relative p-5">
                <div className="flex items-center justify-between">
                  <span className="glow font-pixel text-3xl font-bold text-accent">{n2(i)}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-line bg-accent-soft text-ink">
                    <PixelIcon nombre={p.icono} className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-3 font-pixel text-xl font-bold text-ink">{p.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.texto}</p>
                {i < PASOS.length - 1 && (
                  <span
                    className="absolute -right-[19px] top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border-2 border-line bg-surface font-mono text-[10px] text-accent md:flex"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-muted">
            <span>Enfoque ecopedagógico (Zimmermann, 2005)</span>
            <span aria-hidden="true">·</span>
            <span>Educación básica secundaria</span>
            <span aria-hidden="true">·</span>
            <Link
              to="/guia"
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              Guía de uso ▶
            </Link>
          </p>
        </div>
      </section>

      {/* ── Fuentes oficiales ───────────────────────────────────────────── */}
      <section className="border-t-2 border-line/15 px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <Encabezado
            kicker="Fuentes oficiales"
            titulo="Cada capa dice de dónde vienen sus datos"
          />
          <div className="mt-7 space-y-4">
            <div className="dex-screen lcd-rejilla space-y-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <p className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="lcd-texto font-pixel text-6xl font-bold leading-none lg:text-7xl">
                    {OFICIALES.length}
                    <span className="text-3xl opacity-80">/{LAYERS.length}</span>
                  </span>
                  <span className="pb-1.5 font-mono text-xs font-bold uppercase tracking-wider">
                    capas con
                    <br />
                    fuente oficial
                  </span>
                </p>
                {/* Leyenda de texturas: la diferencia no depende solo del color */}
                <p className="flex flex-col gap-1.5 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 border-2 border-lcd-ink bg-lcd-ink"
                      aria-hidden="true"
                    />
                    Fuente oficial
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 border-2 border-lcd-ink"
                      style={RAYADO}
                      aria-hidden="true"
                    />
                    Ilustrativa, rotulada en el mapa
                  </span>
                </p>
              </div>

              {/* Una celda por capa, agrupadas por entidad; al pasar el puntero se ve cuál es */}
              <div
                className="flex flex-wrap items-start gap-x-4 gap-y-3 lg:gap-x-6"
                aria-hidden="true"
              >
                {GRUPOS_FUENTE.map(g => (
                  <div key={g.nombre}>
                    <div className="flex flex-wrap gap-[3px] lg:gap-1">
                      {g.capas.map(l => (
                        <span
                          key={l.id}
                          title={`${l.nombre} · ${l.fuente.entidad}`}
                          className={`block h-3.5 w-3.5 border-2 border-lcd-ink sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${g.ilustrativo ? '' : 'bg-lcd-ink'}`}
                          style={g.ilustrativo ? RAYADO : undefined}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                      {g.nombre} {g.capas.length}
                    </p>
                  </div>
                ))}
              </div>
              <p className="sr-only">
                De {LAYERS.length} capas, {OFICIALES.length} tienen fuente oficial:{' '}
                {resumen(LAYERS)}. {ILUSTRATIVAS.length} son ilustrativas y están rotuladas en el
                mapa.
              </p>
            </div>

            <div>
              <ul className="grid gap-3 md:grid-cols-3">
                {GARANTIAS.map(g => (
                  <li key={g.titulo} className="dex-card flex items-start gap-3 p-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 border-line bg-accent-soft text-ink">
                      <PixelIcon nombre={g.icono} className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-ui text-sm font-semibold text-ink">
                        {g.titulo}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                        {g.texto}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/creditos"
                className="mt-4 inline-block font-ui text-xs font-semibold text-accent underline-offset-2 hover:underline"
              >
                Ver fuentes y créditos ▶
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Créditos ────────────────────────────────────────────────────── */}
      <section className="border-t-2 border-line/15 px-5 pb-12 pt-10">
        <div className="mx-auto max-w-6xl">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {CREDITOS.map(c => (
              <div key={c.titulo} className="border-l-2 border-accent/60 pl-3">
                <dt className="dex-kicker">{c.titulo}</dt>
                <dd className="mt-1.5 text-sm leading-snug text-ink-soft">
                  {c.lineas.map((l, i) => (
                    <span key={l} className={`block ${i === 0 ? 'font-semibold text-ink' : ''}`}>
                      {l}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}

function Encabezado({ kicker, titulo }: { kicker: string; titulo: ReactNode }) {
  return (
    <>
      <p className="dex-kicker">{kicker}</p>
      <h2 className="dex-title mt-2 text-2xl sm:text-3xl">{titulo}</h2>
    </>
  )
}
