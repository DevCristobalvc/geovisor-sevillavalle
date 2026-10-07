import type { ReactNode } from 'react'
import type { Categoria } from '../types'

// ─── Íconos pixel-art ─────────────────────────────────────────────────────────
// Cuadrículas de 8×8: '#' es un píxel encendido. Se dibujan con crispEdges para que
// conserven el borde duro de consola a cualquier tamaño.

const ICONOS: Record<Categoria | 'capas' | 'ruta' | 'libro' | 'brujula', string[]> = {
  actores: [
    '.##..##.',
    '.##..##.',
    '........',
    '###..###',
    '###..###',
    '###..###',
    '........',
    '........',
  ],
  agua: [
    '...##...',
    '..####..',
    '..####..',
    '.######.',
    '.##.###.',
    '.######.',
    '..####..',
    '........',
  ],
  biodiversidad: [
    '...##...',
    '..####..',
    '.######.',
    '.######.',
    '..####..',
    '...##...',
    '...##...',
    '..####..',
  ],
  clima: [
    '..###...',
    '.#####..',
    '########',
    '########',
    '........',
    '.#..#..#',
    '#..#..#.',
    '........',
  ],
  suelos: [
    '########',
    '........',
    '.######.',
    '........',
    '########',
    '........',
    '.######.',
    '........',
  ],
  territorio: [
    '..####..',
    '.##..##.',
    '.##..##.',
    '.######.',
    '..####..',
    '...##...',
    '...##...',
    '........',
  ],
  capas: [
    '...##...',
    '.##..##.',
    '#......#',
    '.##..##.',
    '#.####.#',
    '.##..##.',
    '...##...',
    '........',
  ],
  ruta: [
    '#.......',
    '##......',
    '#.#.....',
    '#..#....',
    '#...#.#.',
    '#....###',
    '#.....#.',
    '#.......',
  ],
  libro: [
    '........',
    '###..###',
    '#..##..#',
    '#..##..#',
    '#..##..#',
    '#..##..#',
    '###..###',
    '........',
  ],
  brujula: [
    '..####..',
    '.#....#.',
    '#....#.#',
    '#..##..#',
    '#..##..#',
    '#.#....#',
    '.#....#.',
    '..####..',
  ],
}

export type NombreIcono = keyof typeof ICONOS

export function PixelIcon({
  nombre,
  className = 'w-4 h-4',
  titulo,
}: {
  nombre: NombreIcono
  className?: string
  titulo?: string
}) {
  const filas = ICONOS[nombre]
  return (
    <svg
      viewBox="0 0 8 8"
      className={className}
      shapeRendering="crispEdges"
      fill="currentColor"
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
    >
      {filas.flatMap((fila, y) =>
        [...fila].map((c, x) =>
          c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null
        )
      )}
    </svg>
  )
}

// ─── Logo: una consola de bolsillo con pantalla LCD ──────────────────────────
// k = tinta, g = cuerpo, l = pantalla, r = botón A
const LOGO = [
  '.kkkkkkkkkk.',
  'kggggggggggk',
  'kgkkkkkkkkgk',
  'kgkllllllkgk',
  'kgkllkkllkgk',
  'kgklkkkklkgk',
  'kgkllllllkgk',
  'kgkkkkkkkkgk',
  'kggggggggggk',
  'kggkgggggggk',
  'kgkkkggggrgk',
  'kggkggggrggk',
  'kggggggggggk',
  '.kkkkkkkkkk.',
]
const COLOR_LOGO: Record<string, string> = {
  k: 'rgb(var(--c-line))',
  g: 'rgb(var(--c-accent))',
  l: 'rgb(var(--c-lcd))',
  r: '#D9483B',
}

export function LogoDex({ className = 'w-7 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 14" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {LOGO.flatMap((fila, y) =>
        [...fila].map((c, x) =>
          COLOR_LOGO[c] ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              style={{ fill: COLOR_LOGO[c] }}
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ─── Encabezado de página ─────────────────────────────────────────────────────

export function PageHeader({
  kicker,
  titulo,
  descripcion,
  icono,
  children,
}: {
  kicker: string
  titulo: string
  descripcion?: ReactNode
  icono?: NombreIcono
  children?: ReactNode
}) {
  return (
    <header className="px-5 pt-8 pb-6">
      <div className="max-w-3xl mx-auto">
        <p className="dex-kicker flex items-center gap-2 mb-2">
          {icono && <PixelIcon nombre={icono} className="w-3.5 h-3.5 text-accent" />}
          {kicker}
        </p>
        <h1 className="dex-title glow text-3xl sm:text-4xl">{titulo}</h1>
        {descripcion && (
          <p className="mt-2 text-sm text-ink-soft max-w-xl leading-relaxed">{descripcion}</p>
        )}
        {children}
      </div>
    </header>
  )
}
