// Descarga con Chrome las consultas a la CVC que anotó build_capas_visores.py.
//
// Uso:  node scripts/datos/descargar_pendientes.mjs <carpeta-cache> <pendientes.json>
//
// El portal de la CVC está detrás de un WAF (FortiWeb) que rechaza las peticiones de Python y
// bloquea la IP unos 40 minutos ante ráfagas. Por eso cada consulta se hace desde una pestaña
// de Chrome abierta en el propio portal, con 10 s entre peticiones, lotes de máximo 10 y una
// pausa de 5 minutos entre lotes. Ante un 403 o un fallo de red se detiene (reintentar alarga
// el bloqueo). Cada respuesta se guarda como <carpeta-cache>/<clave>.json; la clave la calcula
// Python, así que las respuestas coinciden con la caché del script.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [cache, archivo] = process.argv.slice(2)
if (!cache || !archivo) {
  console.error('Uso: node descargar_pendientes.mjs <carpeta-cache> <pendientes.json>')
  process.exit(2)
}
const PAUSA_MS = 10_000
const LOTE = 10
const PAUSA_LOTE_MS = 5 * 60_000

const todas = JSON.parse(fs.readFileSync(archivo, 'utf8'))
const pendientes = todas.filter(p => !fs.existsSync(path.join(cache, `${p.clave}.json`)))
console.log(`${pendientes.length} de ${todas.length} consultas por descargar`)
if (!pendientes.length) process.exit(0)

const espera = ms => new Promise(r => setTimeout(r, ms))
// ESPERA_INICIAL_S: segundos antes de empezar, para dejar la pausa entre lotes de rondas seguidas
const inicial = Number(process.env.ESPERA_INICIAL_S ?? 0)
if (inicial > 0) {
  console.log(`Esperando ${inicial} s antes de consultar la CVC…`)
  await espera(inicial * 1000)
}
const browser = await chromium.launch({ channel: 'chrome', headless: false })
const page = await browser.newPage()
const r = await page.goto('https://portal-geo.cvc.gov.co/server/rest/services?f=json')
if (!r || r.status() !== 200) {
  console.error(`El portal respondió ${r?.status()}: posible bloqueo del WAF. Se detiene.`)
  await browser.close()
  process.exit(1)
}

let hechas = 0
let codigo = 0
for (const p of pendientes) {
  await espera(hechas > 0 && hechas % LOTE === 0 ? PAUSA_LOTE_MS : PAUSA_MS)
  const res = await page.evaluate(
    async ({ url, params }) => {
      try {
        const body = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
        const resp = await fetch(url, { method: 'POST', body })
        return { status: resp.status, texto: await resp.text() }
      } catch (e) {
        return { status: 0, texto: String(e) }
      }
    },
    { url: p.url, params: p.params }
  )
  hechas++
  const corto = `${p.url.replace(/^.*\/services\//, '')}`
  if (res.status !== 200) {
    console.error(`[${hechas}] ${corto}: HTTP ${res.status} ${res.texto.slice(0, 120)} — se detiene`)
    codigo = 1
    break
  }
  let json
  try {
    json = JSON.parse(res.texto)
  } catch {
    console.error(`[${hechas}] ${corto}: respuesta no JSON (¿página del WAF?) — se detiene`)
    codigo = 1
    break
  }
  if (json.error) {
    // Error de ArcGIS (parámetro inválido, capa inexistente): no se guarda y se sigue
    console.error(`[${hechas}] ${corto}: error ${JSON.stringify(json.error).slice(0, 160)}`)
    continue
  }
  fs.writeFileSync(path.join(cache, `${p.clave}.json`), res.texto)
  const n = json.features?.length ?? json.layers?.length ?? json.count
  console.log(`[${hechas}] ${corto}: ${(res.texto.length / 1024).toFixed(0)} KB${n != null ? ` · ${n}` : ''}${json.exceededTransferLimit ? ' · CORTADA (paginar)' : ''}`)
}
await browser.close()
process.exit(codigo)
