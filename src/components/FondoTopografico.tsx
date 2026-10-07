import { useEffect, useRef } from 'react'

// ─── Fondo de la portada: curvas de nivel pixeladas ──────────────────────────
// Un relieve sintético (un cerro detrás del dex y ondulaciones suaves) dibujado como
// isolíneas en un lienzo de baja resolución: cada píxel del canvas es una celda de CELDA
// píxeles CSS y el navegador lo amplía sin suavizar (image-rendering: pixelated), como una
// pantalla de consola. Se redibuja a pocos cuadros por segundo, solo mientras se ve, y queda
// quieto con prefers-reduced-motion.

const CELDA = 6
const CURVAS = 4 // curvas por unidad de altura
const MAESTRA = 5 // cada cuántas curvas hay una "curva maestra", más marcada
const CUADROS_POR_SEGUNDO = 8
const VELOCIDAD = 0.018 // avance del relieve por cuadro

/** Altura del relieve en (x, y), medidos en unidades de ~100 px CSS */
function altura(x: number, y: number, t: number, cx: number, cy: number, r2: number) {
  const dx = x - cx
  const dy = y - cy
  return (
    2.2 * Math.exp(-(dx * dx + dy * dy) / r2) +
    0.55 * Math.sin(x * 0.62 + t) * Math.cos(y * 0.74 - t * 0.7) +
    0.35 * Math.sin((x - y) * 0.41 + t * 0.45) +
    0.18 * Math.sin(x * 1.3 - y * 0.9 - t * 0.8)
  )
}

function leerAcento() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim()
  const [r, g, b] = v.split(/\s+/).map(Number)
  return [r || 0, g || 0, b || 0] as const
}

export default function FondoTopografico({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cols = 0
    let filas = 0
    let anchoPx = 0
    let altoPx = 0
    let t = 0
    let color = leerAcento()
    let visible = true
    let raf = 0
    let ultimo = 0
    let bandas = new Int16Array(0)
    let imagen: ImageData | null = null

    const dibujar = () => {
      if (!imagen || cols === 0 || filas === 0) return
      const u = CELDA / 100
      const w = anchoPx / 100
      const h = altoPx / 100
      // El cerro se centra detrás del dex: a la derecha en escritorio, abajo en móvil
      const escritorio = anchoPx >= 1024
      const cx = escritorio ? w * 0.74 : w * 0.5
      const cy = escritorio ? h * 0.5 : h * 0.74
      const r2 = escritorio ? 9 : 6

      for (let j = 0; j < filas; j++) {
        for (let i = 0; i < cols; i++) {
          const z = altura((i + 0.5) * u, (j + 0.5) * u, t, cx, cy, r2)
          bandas[j * cols + i] = Math.floor(z * CURVAS)
        }
      }

      const datos = imagen.data
      const [r, g, b] = color
      for (let j = 0; j < filas; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          const banda = bandas[k]
          const derecha = i + 1 < cols ? bandas[k + 1] : banda
          const abajo = j + 1 < filas ? bandas[k + cols] : banda
          const p = k * 4
          if (banda !== derecha || banda !== abajo) {
            const maestra = Math.max(banda, derecha, abajo) % MAESTRA === 0
            datos[p] = r
            datos[p + 1] = g
            datos[p + 2] = b
            datos[p + 3] = maestra ? 255 : 130
          } else {
            datos[p + 3] = 0
          }
        }
      }
      ctx.putImageData(imagen, 0, 0)
    }

    const ajustar = () => {
      const caja = canvas.getBoundingClientRect()
      anchoPx = caja.width
      altoPx = caja.height
      cols = Math.max(1, Math.ceil(anchoPx / CELDA))
      filas = Math.max(1, Math.ceil(altoPx / CELDA))
      canvas.width = cols
      canvas.height = filas
      bandas = new Int16Array(cols * filas)
      imagen = ctx.createImageData(cols, filas)
      dibujar()
    }

    const cuadro = (ahora: number) => {
      raf = 0
      if (!visible || document.hidden) return
      if (ahora - ultimo >= 1000 / CUADROS_POR_SEGUNDO) {
        ultimo = ahora
        t += VELOCIDAD
        dibujar()
      }
      raf = requestAnimationFrame(cuadro)
    }
    const reanudar = () => {
      if (!quieto && !raf && visible && !document.hidden) raf = requestAnimationFrame(cuadro)
    }

    const redimensionar = new ResizeObserver(ajustar)
    redimensionar.observe(canvas)

    // Al cambiar de tema, repintar con el nuevo color de acento
    const tema = new MutationObserver(() => {
      color = leerAcento()
      dibujar()
    })
    tema.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const enPantalla = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      reanudar()
    })
    enPantalla.observe(canvas)
    document.addEventListener('visibilitychange', reanudar)

    ajustar()
    reanudar()

    return () => {
      cancelAnimationFrame(raf)
      redimensionar.disconnect()
      tema.disconnect()
      enPantalla.disconnect()
      document.removeEventListener('visibilitychange', reanudar)
    }
  }, [])

  return <canvas ref={ref} className={`fondo-topo ${className}`} aria-hidden="true" />
}
