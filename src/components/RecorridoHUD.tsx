import type { Recorrido, RecorridoParada } from '../types'

interface RecorridoHUDProps {
  recorrido: Recorrido
  paradaIndex: number
  onPrev: () => void
  onNext: () => void
  onExit: () => void
}

export default function RecorridoHUD({ recorrido, paradaIndex, onPrev, onNext, onExit }: RecorridoHUDProps) {
  const parada: RecorridoParada = recorrido.paradas[paradaIndex]
  const total = recorrido.paradas.length
  const isFirst = paradaIndex === 0
  const isLast = paradaIndex === total - 1

  return (
    <div
      className="absolute bottom-10 left-1/2 z-[1100] animate-fade-in"
      style={{ transform: 'translateX(-50%)', width: 'min(520px, calc(100vw - 32px))' }}
      role="region"
      aria-label="Recorrido guiado"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-verde-bosque text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-70">{paradaIndex + 1}/{total}</span>
            <span className="text-sm font-bold truncate">{recorrido.titulo}</span>
          </div>
          <button
            onClick={onExit}
            aria-label="Salir del recorrido"
            className="text-white/70 hover:text-white text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* Stop content */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="font-bold text-gris-texto text-sm mb-1">{parada.titulo}</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-pedagogica line-clamp-4">
            {parada.narracion}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-2">
          {recorrido.paradas.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: i === paradaIndex ? '#2D6A4F' : '#d1d5db' }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={onPrev}
            disabled={isFirst}
            aria-label="Parada anterior"
            className="flex-1 py-2.5 text-sm font-medium text-gris-texto disabled:opacity-30 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <div className="w-px bg-gray-100" />
          <button
            onClick={onNext}
            disabled={isLast}
            aria-label="Siguiente parada"
            className="flex-1 py-2.5 text-sm font-semibold text-verde-bosque disabled:opacity-30 hover:bg-verde-palido transition-colors disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
