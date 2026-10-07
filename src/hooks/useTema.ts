import { useCallback, useEffect, useState } from 'react'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'ecodex-tema'
const COLOR_BARRA: Record<Tema, string> = { claro: '#F2EEE1', oscuro: '#050906' }

/**
 * Tema día (consola de campo) / noche (modo terminal). Toda visita nueva abre en modo día,
 * sin importar el tema del sistema. Si el usuario cambia a noche, la elección se mantiene
 * solo en la pestaña actual (sessionStorage), al recargar o navegar; index.html la aplica
 * antes de pintar.
 */
export function useTema() {
  const [tema, setTema] = useState<Tema>(() =>
    document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema])
  }, [tema])

  const alternar = useCallback(() => {
    setTema(actual => {
      const siguiente: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
      try {
        sessionStorage.setItem(CLAVE, siguiente)
      } catch {
        /* almacenamiento no disponible: el tema dura hasta recargar */
      }
      return siguiente
    })
  }, [])

  return { tema, alternar }
}
