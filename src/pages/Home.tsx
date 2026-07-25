import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import { CATEGORIAS } from '../config/layers.config'
import type { Categoria } from '../types'

// ─── Data ────────────────────────────────────────────────────────────────────

const HERO_IMG =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/View_of_Salento%2C_Colombia_01.jpg/1600px-View_of_Salento%2C_Colombia_01.jpg'

const CAROUSEL_SLIDES = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/View_of_Salento%2C_Colombia_01.jpg/1280px-View_of_Salento%2C_Colombia_01.jpg',
    titulo: 'Vista de Salento, Quindío',
    categoria: 'Paisaje Cultural Cafetero — UNESCO',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Frailejones_Sumapaz%2C_Colombia.jpg/1280px-Frailejones_Sumapaz%2C_Colombia.jpg',
    titulo: 'Páramo de Sumapaz',
    categoria: 'Ecosistemas de Páramo',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Bosque_andino_colombiano_antioquia.jpg',
    titulo: 'Bosque Andino Colombiano',
    categoria: 'Biodiversidad',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/R%C3%ADo_Cauca._Puente_Anacaro_%281%29._Cartago_-_Ansermanuevo%2C_Valle%2C_Colombia.JPG/1280px-R%C3%ADo_Cauca._Puente_Anacaro_%281%29._Cartago_-_Ansermanuevo%2C_Valle%2C_Colombia.JPG',
    titulo: 'Río Cauca — Valle del Cauca',
    categoria: 'Recursos Hídricos',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Nevado_del_Tolima_entre_nubes_y_monta%C3%B1as.jpg/1280px-Nevado_del_Tolima_entre_nubes_y_monta%C3%B1as.jpg',
    titulo: 'Nevado del Tolima',
    categoria: 'Pisos Térmicos',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Cafetales%2C_en_Colombia.jpg',
    titulo: 'Cafetales en Colombia',
    categoria: 'Patrimonio Cultural',
  },
]

const STATS = [
  { value: 23, label: 'capas geográficas' },
  { value: 23, label: 'fichas pedagógicas' },
  { value: 6, label: 'categorías temáticas' },
  { value: 3, label: 'recorridos guiados' },
]

// Instituciones que proveen los geoservicios / datos oficiales
const FUENTES = ['CVC', 'IGAC', 'IDEAM', 'Humboldt', 'RUNAP', 'GBIF', 'OpenStreetMap']

// Sellos de plataforma (bajo los CTA del hero)
const PLATAFORMA = ['Sin instalación', 'Funciona sin conexión', 'Datos abiertos oficiales']

const CAPABILITIES = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
      </svg>
    ),
    titulo: 'Explora 23 capas geográficas',
    desc: 'Activa, combina y ajusta capas de agua, biodiversidad, territorio, clima, suelos y actores sociales del municipio.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
      </svg>
    ),
    titulo: 'Sigue recorridos guiados',
    desc: '3 itinerarios temáticos que llevan al estudiante por los puntos más relevantes del territorio con narración contextual.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    titulo: 'Consulta 23 fichas pedagógicas',
    desc: 'Cada capa tiene su ficha con descripción, preguntas de reflexión, vocabulario clave, galería de imágenes y videos.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    titulo: 'Mide distancias y áreas',
    desc: 'Herramienta de medición con Turf.js: traza polilíneas sobre el mapa y obtén distancias en km y superficies en hectáreas.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    titulo: 'Exporta el mapa como PNG',
    desc: 'Captura y descarga la vista actual del mapa, incluyendo todas las capas activas, como imagen de alta resolución.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
      </svg>
    ),
    titulo: 'Busca dentro de las capas',
    desc: 'Filtra features por atributo dentro de cualquier capa activa: busca veredas, especies, predios o cualquier entidad geográfica.',
  },
]

const CATEGORIAS_LIST = Object.entries(CATEGORIAS) as [Categoria, (typeof CATEGORIAS)[Categoria]][]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function CountUp({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const spanRef = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target)
      return
    }
    const el = spanRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const t0 = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1)
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={spanRef}>{count}</span>
}

// ─── Hero word-by-word animation ─────────────────────────────────────────────

function AnimatedHeadline() {
  const words = ['Explora', 'el territorio', 'de Sevilla']
  const [show, setShow] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShow(true), 80)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className={`hero-word block ${i === words.length - 1 ? 'text-hero-gradient' : ''}`}
          style={
            show
              ? {
                  opacity: 1,
                  transform: 'none',
                  transition: `opacity 0.6s ease ${i * 160}ms, transform 0.6s ease ${i * 160}ms`,
                }
              : {}
          }
        >
          {word}
        </span>
      ))}
    </>
  )
}

// ─── Fondo de curvas de nivel (topográfico) ──────────────────────────────────

function ContourBackdrop() {
  return (
    <svg
      className="absolute inset-0 w-full h-full animate-float-slow"
      viewBox="0 0 1440 820"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" stroke="#52B788" strokeOpacity="0.12" strokeWidth="1.1">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={`a${i}`}
            cx="360"
            cy="300"
            rx={55 + i * 52}
            ry={38 + i * 34}
            transform="rotate(-18 360 300)"
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse
            key={`b${i}`}
            cx="1120"
            cy="580"
            rx={68 + i * 58}
            ry={46 + i * 40}
            transform="rotate(14 1120 580)"
          />
        ))}
      </g>
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null)

  return (
    <main className="overflow-y-auto h-full bg-white">
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center text-white px-6 overflow-hidden"
        style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0a1510' }}
      >
        {/* Foto de terreno (base) */}
        <img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        {/* Overlays de profundidad */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(130% 120% at 50% 0%, rgba(26,58,39,0.55) 0%, rgba(13,31,22,0.9) 55%, #0a1510 100%)',
          }}
        />
        <ContourBackdrop />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(to top, #0a1510 0%, transparent 100%)' }}
        />

        {/* Barra de estado tipo GIS */}
        <div className="absolute top-5 inset-x-0 z-10 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-center sm:justify-between text-[11px] tracking-wide text-white/45 font-mono">
            <span className="hidden sm:inline">4°16′N · 75°56′O</span>
            <span className="uppercase">Geovisor Ecopedagógico · v3.0</span>
            <span className="hidden sm:inline">EPSG:4326 · WGS 84</span>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-8 px-4 py-1.5 rounded-full border backdrop-blur-sm"
            style={{
              borderColor: 'rgba(82,183,136,0.35)',
              backgroundColor: 'rgba(82,183,136,0.08)',
              color: '#52B788',
              animation: 'fadeIn 0.5s ease 0.05s forwards',
              opacity: 0,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-verde-claro" />
            Sevilla, Valle del Cauca · Colombia
          </div>

          <h1
            className="font-bold leading-none mb-6 text-white"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}
          >
            <AnimatedHeadline />
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed mb-9 max-w-xl mx-auto"
            style={{
              color: 'rgba(216,243,220,0.82)',
              animation: 'fadeUp 0.6s ease 0.65s forwards',
              opacity: 0,
            }}
          >
            Plataforma cartográfica para comprender las transformaciones socioecosistémicas del
            municipio a través de capas geográficas, fichas pedagógicas y recorridos guiados.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
            style={{ animation: 'fadeUp 0.6s ease 0.9s forwards', opacity: 0 }}
          >
            <Link
              to="/visor"
              className="inline-flex items-center justify-center gap-2 bg-verde-claro text-verde-bosque font-semibold px-8 py-3 rounded-lg hover:bg-white transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-verde-claro/20"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75 3 9.75v10.5l6-3m0-10.5 6 3m-6-3v10.5m6-7.5 6-3v10.5l-6 3m0-10.5v10.5m0-10.5-6-3"
                />
              </svg>
              Abrir el visor
            </Link>
            <Link
              to="/recorridos"
              className="border border-white/25 text-white/90 px-8 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              Ver recorridos
            </Link>
          </div>

          {/* Sellos de plataforma */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            style={{ animation: 'fadeIn 0.6s ease 1.15s forwards', opacity: 0 }}
          >
            {PLATAFORMA.map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 text-xs text-white/55">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#52B788"
                  strokeWidth="2"
                  className="w-3.5 h-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => statsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Continuar hacia abajo"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors z-10"
          style={{ animation: 'fadeIn 0.5s ease 1.4s forwards', opacity: 0 }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-6 h-6 animate-scroll-hint"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </section>

      {/* ── 2. BARRA DE CONFIANZA — fuentes oficiales ────────────────────── */}
      <section
        aria-label="Fuentes de datos oficiales"
        className="px-6 py-6"
        style={{ backgroundColor: '#0a1510' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
            Datos oficiales de
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FUENTES.map(f => (
              <span
                key={f}
                className="text-sm font-semibold tracking-wide text-white/45 hover:text-white/70 transition-colors"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STATS — panel tipo dashboard ──────────────────────────────── */}
      <div ref={statsRef} />
      <section className="bg-white py-14 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {STATS.map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white px-6 py-8 text-center h-full flex flex-col justify-center">
                  <div className="text-4xl md:text-5xl font-bold text-verde-bosque mb-2 tabular-nums leading-none">
                    <CountUp target={s.value} />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 leading-tight">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CARRUSEL DE IMÁGENES ──────────────────────────────────────── */}
      <section aria-label="Galería del territorio" className="bg-black">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={800}
          pagination={{ clickable: true }}
          loop
          className="w-full"
          style={{ height: 'clamp(300px, 55vh, 520px)' }}
        >
          {CAROUSEL_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full">
                <img
                  src={slide.url}
                  alt={slide.titulo}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onError={e => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="max-w-3xl mx-auto">
                    <div className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-1">
                      {slide.categoria}
                    </div>
                    <div className="text-white font-semibold text-lg leading-tight">
                      {slide.titulo}
                    </div>
                    <div className="text-white/40 text-xs mt-1">© Wikimedia Commons CC-BY-SA</div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── 5. CAPABILITIES ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2
              className="font-bold text-negro mb-4"
              style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', lineHeight: 1.15 }}
            >
              Una herramienta para explorar,
              <br />
              aprender y reflexionar
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              Diseñado para estudiantes de básica secundaria (10–15 años) bajo el marco
              ecopedagógico de Zimmermann (2005). Todo funciona sin necesidad de instalar nada.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAPABILITIES.map((cap, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="group p-6 rounded-2xl border border-gray-100 hover:border-verde-bosque/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white h-full">
                  <div className="w-11 h-11 mb-4 rounded-xl bg-verde-palido/60 text-verde-bosque flex items-center justify-center group-hover:bg-verde-palido transition-colors">
                    <div className="w-6 h-6">{cap.icon}</div>
                  </div>
                  <h3 className="font-semibold text-negro text-sm mb-2 leading-snug">
                    {cap.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cap.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. EL TERRITORIO ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="text-xs font-semibold tracking-widest uppercase text-verde-bosque mb-3">
              El territorio
            </div>
            <h2
              className="font-bold text-negro mb-5"
              style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', lineHeight: 1.2 }}
            >
              Sevilla, Valle del Cauca
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm">
              Municipio cafetero en el norte del Valle del Cauca, enclavado en la Cordillera Central
              a altitudes entre 900 y 4.200 m.s.n.m. Su territorio es una muestra representativa de
              los ecosistemas andinos colombianos: páramos, bosque andino, bosque seco tropical y
              las cuencas de los ríos Bugalagrande, La Paila y La Vieja.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              En 2011 fue declarado Patrimonio Cultural de la Humanidad por la UNESCO como parte del
              Paisaje Cultural Cafetero. El geovisor documenta cómo las actividades humanas
              —expansión agropecuaria, minería, cambio climático— transforman estos ecosistemas y
              afectan a las comunidades que dependen de ellos.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Área municipal', value: '1.193 km²' },
                { label: 'Rango altitudinal', value: '900 – 4.200 m.s.n.m.' },
                { label: 'Declaratoria PCC', value: 'UNESCO 2011' },
                { label: 'Cuencas principales', value: 'Bugalagrande · La Paila · La Vieja' },
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex justify-between items-baseline py-3 border-b border-gray-200 last:border-0"
                >
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{d.label}</span>
                  <span className="text-sm font-semibold text-negro">{d.value}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 7. ENFOQUE ECOPEDAGÓGICO ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-verde-bosque text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="text-xs font-semibold tracking-widest uppercase mb-6 text-verde-claro">
              Marco pedagógico
            </div>
            <blockquote
              className="font-light italic mb-6 leading-relaxed"
              style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}
            >
              "La ecopedagogía invita a leer el mundo como un ecosistema vivo, donde cada elemento
              está interconectado."
            </blockquote>
            <p className="text-sm text-verde-palido/80 mb-2">Zimmermann, 2005</p>
            <p className="text-verde-palido/70 text-sm leading-relaxed max-w-xl mx-auto mt-6">
              Esta herramienta fue diseñada como recurso didáctico para que estudiantes de grados 6
              a 9 puedan explorar, cuestionar y comprender las dinámicas territoriales de su entorno
              desde una perspectiva crítica y sistémica.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10">
            <Link
              to="/visor"
              className="inline-block bg-white text-verde-bosque font-semibold px-8 py-3 rounded-lg hover:bg-verde-palido transition-all duration-200 hover:scale-[1.02]"
            >
              Comenzar a explorar
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── 8. CATEGORÍAS ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-12">
            <div className="text-xs font-semibold tracking-widest uppercase text-verde-bosque mb-3">
              Temáticas
            </div>
            <h2
              className="font-bold text-negro"
              style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', lineHeight: 1.2 }}
            >
              Seis dimensiones para
              <br />
              entender el territorio
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIAS_LIST.map(([key, info], i) => (
              <Reveal key={key} delay={i * 60}>
                <Link
                  to={`/visor?categoria=${key}`}
                  aria-label={`Explorar ${info.label} en el visor`}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-white h-full"
                >
                  <div
                    className="w-1 self-stretch rounded-full flex-shrink-0 transition-all duration-300 group-hover:w-1.5"
                    style={{ backgroundColor: info.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-negro mb-1">{info.label}</div>
                    <div className="text-xs text-gray-400 leading-snug">{info.descripcion}</div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4 text-gray-300 group-hover:text-verde-bosque transition-colors flex-shrink-0 mt-0.5 ml-auto"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CRÉDITOS ──────────────────────────────────────────────────── */}
      <section className="bg-negro text-gray-500 px-6 py-12 text-sm text-center">
        <p className="leading-relaxed">
          Proyecto de Grado · Ingeniería de Sistemas
          <br />
          <span className="text-gray-400">Universidad Santiago de Cali</span>
          <br />
          <span className="text-gray-600 text-xs mt-3 block">
            Cristóbal Valencia Cerón · José David Molina Delgado
            <br />
            Director: Diego Fernando Loaiza · Grupo INFORMA
          </span>
        </p>
        <div className="mt-6 pt-6 border-t border-white/5 max-w-md mx-auto text-xs text-gray-600">
          Fuentes: CVC · IGAC · IDEAM · IAvH · RUNAP · GBIF · OpenStreetMap
        </div>
      </section>
    </main>
  )
}
