import { useCallback, useEffect, useState } from 'react'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'ecodex-tema'
const COLOR_BARRA: Record<Tema, string> = { claro: '#F2EEE1', oscuro: '#050906' }

/**
 * Tema día (consola de campo) / noche (modo terminal). index.html aplica la clase `dark`
 * antes de pintar; este hook la mantiene sincronizada y recuerda la elección del usuario
 * (solo en su navegador). Sin elección guardada, sigue el tema del sistema.
 */
export function useTema() {
  const [tema, setTema] = useState<Tema>(() =>
    document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema])
  }, [tema])

  // Sin elección guardada, seguir los cambios del tema del sistema
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      let guardado: string | null = null
      try {
        guardado = localStorage.getItem(CLAVE)
      } catch {
        /* almacenamiento no disponible */
      }
      if (!guardado) setTema(e.matches ? 'oscuro' : 'claro')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const alternar = useCallback(() => {
    setTema(actual => {
      const siguiente: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
      try {
        localStorage.setItem(CLAVE, siguiente)
      } catch {
        /* almacenamiento no disponible: el tema dura solo esta visita */
      }
      return siguiente
    })
  }, [])

  return { tema, alternar }
}
