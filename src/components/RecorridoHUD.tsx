import type { Recorrido, RecorridoParada } from '../types'

interface RecorridoHUDProps {
  recorrido: Recorrido
  paradaIndex: number
  onPrev: () => void
  onNext: () => void
  onExit: () => void
}

/** Narración del recorrido como cuadro de diálogo de consola. */
export default function RecorridoHUD({
  recorrido,
  paradaIndex,
  onPrev,
  onNext,
  onExit,
}: RecorridoHUDProps) {
  const parada: RecorridoParada = recorrido.paradas[paradaIndex]
  const total = recorrido.paradas.length
  const isFirst = paradaIndex === 0
  const isLast = paradaIndex === total - 1

  return (
    <div
      className="absolute bottom-10 left-1/2 z-[1100] animate-fade-in"
      style={{ transform: 'translateX(-50%)', width: 'min(540px, calc(100vw - 32px))' }}
      role="region"
      aria-label="Recorrido guiado"
    >
      <div className="rounded-xl border-2 border-line bg-surface p-1 shadow-dex">
        <div className="rounded-lg border-2 border-line">
          {/* Cabezal */}
          <div className="flex items-center justify-between border-b-2 border-line bg-surface2 px-3 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded bg-accent px-1.5 py-px font-mono text-[10px] font-bold text-on-accent">
                {paradaIndex + 1}/{total}
              </span>
              <span className="truncate font-pixel text-sm font-bold text-ink">
                {recorrido.titulo}
              </span>
            </div>
            <button
              onClick={onExit}
              aria-label="Salir del recorrido"
              className="rounded p-1 text-muted hover:text-ink"
            >
              <svg
                viewBox="0 0 8 8"
                className="w-3.5 h-3.5"
                shapeRendering="crispEdges"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M1 1h1v1H1zM2 2h1v1H2zM3 3h2v2H3zM5 2h1v1H5zM6 1h1v1H6zM2 5h1v1H2zM1 6h1v1H1zM5 5h1v1H5zM6 6h1v1H6z" />
              </svg>
            </button>
          </div>

          {/* Diálogo */}
          <div className="px-4 pt-3 pb-2">
            <h3 className="font-pixel text-base font-bold text-accent glow">{parada.titulo}</h3>
            <p className="mt-1 font-pedagogica text-sm leading-relaxed text-ink line-clamp-4">
              {parada.narracion}
            </p>
          </div>

          {/* Progreso */}
          <div className="flex justify-center gap-1.5 pb-2" aria-hidden="true">
            {recorrido.paradas.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-[1px] border border-line ${i <= paradaIndex ? 'bg-accent' : 'bg-surface2'}`}
              />
            ))}
          </div>

          {/* Controles */}
          <div className="flex border-t-2 border-line font-ui text-sm">
            <button
              onClick={onPrev}
              disabled={isFirst}
              aria-label="Parada anterior"
              className="flex flex-1 items-center justify-center gap-1.5 py-2 font-semibold text-ink-soft hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ◀ Anterior
            </button>
            <div className="w-0.5 bg-line" />
            <button
              onClick={onNext}
              disabled={isLast}
              aria-label="Siguiente parada"
              className="flex flex-1 items-center justify-center gap-1.5 py-2 font-semibold text-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-30"
            >
              Siguiente <span className={isLast ? '' : 'animate-blink'}>▶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
