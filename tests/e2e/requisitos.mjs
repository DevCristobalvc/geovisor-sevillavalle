// Verificación de los 21 requisitos funcionales del SRS v2 contra su criterio de aceptación.
//
// Uso:  BASE=https://www.refiup.app npm run test:rf            → producción, navegador visible
//       npm run test:rf                                        → http://localhost:4173 (vite preview)
//       HEADLESS=1 npm run test:rf
//
// Escribe docs/validacion/requisitos/resultados.json y docs/validacion/trazabilidad-rf.md
// (tabla RF → prueba → resultado, con el % de RF que cumplen su criterio).
// Evita las WMS de la CVC (firewall): las capas WMS de este script son del IDEAM.
import { chromium } from 'playwright'
import { createRequire } from 'node:module'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const BASE = process.env.BASE ?? 'http://localhost:4173'
const RAIZ = new URL('../../', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const SALIDA = RAIZ + 'docs/validacion/'
fs.mkdirSync(SALIDA + 'requisitos', { recursive: true })
const AXE = require.resolve('axe-core/axe.min.js')

// Criterios copiados del SRS v2 (Documento de Requerimientos v2, sección 7)
const RF = {
  'RF-01': ['Mapa base interactivo', 'Mapa cargado en < 3 s (10 Mbps); zoom responde en < 100 ms; zoom 10–18'],
  'RF-02': ['Panel de capas jerárquico', '6 categorías en acordeón; la capa aparece/desaparece en < 500 ms; el toggle de categoría activa todas sus subcapas'],
  'RF-03': ['Control de opacidad', 'Slider 0–100 % en tiempo real, sin lag perceptible (60 fps)'],
  'RF-04': ['Leyenda dinámica', 'La leyenda aparece con la capa; la imagen GetLegendGraphic carga en < 2 s'],
  'RF-05': ['Zoom a extensión de capa', 'Fly-to con animación suave (300 ms) a la extensión de la capa'],
  'RF-06': ['Selector de mapa base', 'OSM / satélite / topográfico; el cambio ocurre en < 1 s sin perder las capas activas'],
  'RF-07': ['Consulta de atributos al clic', 'Popup en < 200 ms para GeoJSON; GetFeatureInfo WMS en < 1,5 s'],
  'RF-08': ['Búsqueda de lugares', 'Sugerencias en < 1 s al escribir ≥ 3 caracteres; al elegir, el mapa vuela al lugar'],
  'RF-09': ['Búsqueda en capas GeoJSON', 'Filtra en tiempo real mientras se escribe y resalta el elemento en el mapa'],
  'RF-10': ['Herramienta de medición', 'Distancias (km) y áreas (ha) con Turf.js; error ≤ 0,01 % frente a una referencia'],
  'RF-11': ['Coordenadas del cursor', 'Se actualizan en cada mousemove con 4 decimales'],
  'RF-12': ['Fichas pedagógicas', 'Panel lateral; ≥ 150 palabras, ≥ 1 imagen (≤ 5), 3–5 preguntas, 5–8 términos'],
  'RF-13': ['Contenido multimedia en popup', 'Miniatura lazy en el popup; videos en modal (react-player) sin autoplay'],
  'RF-14': ['Modo recorrido guiado', 'Botones Siguiente/Anterior; flyTo de 800 ms; funciona sin conexión con GeoJSON en caché'],
  'RF-15': ['Línea de tiempo', 'Slider de años; el cambio de año actualiza la capa en < 1 s'],
  'RF-16': ['Glosario territorial', 'Buscable por texto; al hacer clic en un término abre la ficha de la capa relacionada'],
  'RF-17': ['Exportar vista como imagen', 'PNG descargado en < 3 s; resolución mínima 1920 × 1080 px'],
  'RF-18': ['Compartir URL de vista', 'La URL (capas, zoom, centro) restaura el mismo estado en otro navegador'],
  'RF-19': ['Modo offline básico', 'Tras la primera visita funciona sin conexión con GeoJSON y teselas z10–14; aviso claro si una WMS no está disponible'],
  'RF-20': ['Ajuste de imagen alt text', 'axe-core: 0 violaciones image-alt'],
  'RF-21': ['Navegación por teclado', 'axe-core: 0 violaciones de teclado; foco visible en todos los controles'],
}

// Comprobaciones de tests/e2e/validar.mjs relacionadas con cada RF (cobertura de regresión)
const VALIDAR = {
  'RF-01': ['Mapa: elementos vectoriales dibujados'],
  'RF-02': ['GeoJSON: se pidieron las 16 capas', 'Panel: capas GeoJSON oficiales marcadas CVC', 'Panel: fuente de las WMS visible'],
  'RF-04': ['Leyenda propia de pisos térmicos', 'Leyenda propia de conflictos de uso', 'Leyenda GetLegendGraphic (IDEAM cobertura) carga'],
  'RF-07': ['Popup oficial: atributos legibles y fuente CVC', 'Popup ilustrativo: aviso visible y sin nombres de personas'],
  'RF-12': ['Ficha: muestra "Datos de la capa: CVC" y "Referencias"', 'Ficha <id> (23 fichas: 3–5 preguntas, imágenes de Wikimedia)'],
  'RF-18': ['RF-18: el enlace restaura lat/lng/zoom'],
}

const resultados = {}
const registrar = (rf, estado, medicion, nota = '') => {
  resultados[rf] = { estado, medicion, nota }
  console.log(`${estado.padEnd(10)} ${rf}  ${medicion}${nota ? ' — ' + nota : ''}`)
}
const ms = v => `${Math.round(v)} ms`

const browser = await chromium.launch({
  channel: 'chrome',
  headless: process.env.HEADLESS === '1',
})
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  serviceWorkers: 'block',
  acceptDownloads: true,
})
const page = await ctx.newPage()

const VISOR = (q = '') => `${BASE}/visor?lat=4.16&lng=-75.89&zoom=11${q}`

// Marca de tiempo del próximo evento del usuario (en el reloj de la página)
async function marcarInicio(p, evento = 'click') {
  await p.evaluate(ev => {
    window.__t0 = null
    document.addEventListener(ev, () => (window.__t0 ??= performance.now()), { capture: true, once: true })
  }, evento)
}

// Vigila la URL: useUrlSync la reescribe al terminar cada movimiento del mapa (moveend/zoomend)
async function vigilarFinMovimiento(p) {
  await p.evaluate(() => {
    window.__fin = null
    window.__url = location.search
    const id = (window.__vigilante = (window.__vigilante ?? 0) + 1)
    const paso = () => {
      if (window.__vigilante !== id) return
      if (location.search !== window.__url) {
        window.__url = location.search
        window.__fin = performance.now()
      }
      requestAnimationFrame(paso)
    }
    requestAnimationFrame(paso)
  })
}
async function duracionMovimiento(p) {
  const limite = Date.now() + 8000
  await p.waitForTimeout(500)
  while (Date.now() < limite) {
    const quieto = await p.evaluate(() => window.__fin !== null && performance.now() - window.__fin > 1200)
    if (quieto) break
    await p.waitForTimeout(200)
  }
  return p.evaluate(() => (window.__fin && window.__t0 ? window.__fin - window.__t0 : null))
}

// Tiempo, en el reloj de la página, desde el próximo clic hasta que carga una tesela de `host`
async function vigilarTesela(p, host) {
  await p.evaluate(h => {
    window.__tesela = null
    window.__t0 = null
    document.addEventListener('click', () => (window.__t0 = performance.now()), { capture: true, once: true })
    const mo = new MutationObserver(() => {
      if (window.__t0 !== null && document.querySelector(`img.leaflet-tile-loaded[src*="${h}"]`)) {
        window.__tesela = performance.now() - window.__t0
        mo.disconnect()
      }
    })
    mo.observe(document.querySelector('.leaflet-map-pane'), { attributes: true, attributeFilter: ['class'], childList: true, subtree: true })
  }, host)
}

// Centro en pantalla de un elemento vectorial visible fuera del panel de capas
async function puntoDeElemento(p) {
  const cajas = await p.locator('.leaflet-overlay-pane path.leaflet-interactive').evaluateAll(els =>
    els.map(e => {
      const b = e.getBoundingClientRect()
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
    })
  )
  return cajas.find(b => b.x > 380 && b.x < 1250 && b.y > 120 && b.y < 820)
}

async function expandir(p, categoria) {
  const btn = p.locator('aside button[aria-expanded]', { hasText: categoria }).first()
  if ((await btn.getAttribute('aria-expanded')) !== 'true') await btn.click()
}

async function axe(p, reglas) {
  await p.addScriptTag({ path: AXE })
  return p.evaluate(
    async opciones => {
      const r = await window.axe.run(document, opciones)
      return r.violations.map(v => ({ id: v.id, nodos: v.nodes.length }))
    },
    reglas
  )
}

async function correr(rf, fn) {
  try {
    await fn()
  } catch (e) {
    registrar(rf, 'ERROR', '', e.message.split('\n')[0])
  }
}

// ── RF-01 Mapa base ─────────────────────────────────────────────────────────
await correr('RF-01', async () => {
  await page.goto(VISOR(), { waitUntil: 'commit' })
  await page.waitForSelector('img.leaflet-tile-loaded[src*="tile.openstreetmap.org"]', { timeout: 15000 })
  // Desde el inicio de la navegación hasta que llega la primera tesela del mapa base
  const carga = await page.evaluate(() =>
    Math.min(...performance.getEntriesByType('resource').filter(r => r.name.includes('tile.openstreetmap.org')).map(r => r.responseEnd))
  )
  await page.waitForTimeout(1500)
  await page.locator('.leaflet-container').focus()
  // Tiempo hasta que Leaflet empieza la animación de zoom tras pulsar "+"
  await page.evaluate(() => {
    window.__zoom = null
    const c = document.querySelector('.leaflet-container')
    c.addEventListener('keydown', () => (window.__t0 = performance.now()), { capture: true, once: true })
    const mo = new MutationObserver(() => {
      if (c.classList.contains('leaflet-zoom-anim') || window.__zoom === null) {
        window.__zoom ??= performance.now() - window.__t0
        mo.disconnect()
      }
    })
    mo.observe(document.querySelector('.leaflet-map-pane'), { attributes: true, subtree: true })
  })
  await page.keyboard.press('+')
  await page.waitForTimeout(800)
  const zoom = await page.evaluate(() => window.__zoom)
  const config = fs.readFileSync(RAIZ + 'src/config/layers.config.ts', 'utf8')
  const rango = /SEVILLA_MIN_ZOOM = 10\b/.test(config) && /SEVILLA_MAX_ZOOM = 18\b/.test(config)
  const ok = carga < 3000 && zoom !== null && zoom < 100 && rango
  registrar('RF-01', ok ? 'Cumple' : 'No cumple', `primera tesela en ${ms(carga)} · zoom responde en ${zoom === null ? '—' : ms(zoom)} · rango 10–18: ${rango ? 'sí' : 'no'}`,
    'Medido con la conexión del equipo de prueba, no con un enlace de 10 Mbps controlado')
})

// ── RF-02 Panel de capas ────────────────────────────────────────────────────
await correr('RF-02', async () => {
  await page.goto(VISOR(), { waitUntil: 'networkidle' })
  const categorias = await page.locator('aside[aria-label="Panel de capas geográficas"] button[aria-expanded]').count()
  await expandir(page, 'Agua')
  const caja = page.getByRole('checkbox', { name: 'Activar capa Predios Art. 111 Ley 99/93' })
  const medirCambio = async () => {
    await page.evaluate(() => {
      window.__cambio = null
      const antes = document.querySelectorAll('.leaflet-overlay-pane path').length
      document.addEventListener('click', () => (window.__t0 = performance.now()), { capture: true, once: true })
      const mo = new MutationObserver(() => {
        if (document.querySelectorAll('.leaflet-overlay-pane path').length !== antes) {
          window.__cambio = performance.now() - window.__t0
          mo.disconnect()
        }
      })
      mo.observe(document.querySelector('.leaflet-overlay-pane'), { childList: true, subtree: true })
    })
    await caja.click()
    await page.waitForTimeout(1500)
    return page.evaluate(() => window.__cambio)
  }
  const aparece = await medirCambio()
  const desaparece = await medirCambio()
  // Toggle de la categoría: activa todas sus subcapas
  const seccion = page
    .locator('aside[aria-label="Panel de capas geográficas"] div.border-b')
    .filter({ has: page.getByRole('checkbox', { name: 'Activar todas las capas de Agua' }) })
  const capasAgua = await seccion.locator('input[aria-label^="Activar capa "]').count()
  await page.getByRole('checkbox', { name: 'Activar todas las capas de Agua' }).check()
  await page.waitForTimeout(800)
  const activas = await seccion.locator('input[aria-label^="Activar capa "]:checked').count()
  await page.getByRole('checkbox', { name: 'Activar todas las capas de Agua' }).uncheck()
  const ok = categorias === 6 && aparece !== null && aparece < 500 && desaparece !== null && desaparece < 500 && activas === capasAgua
  registrar('RF-02', ok ? 'Cumple' : 'No cumple',
    `${categorias} categorías · aparece en ${aparece === null ? '—' : ms(aparece)} (incluye descargar el GeoJSON) · desaparece en ${desaparece === null ? '—' : ms(desaparece)} · categoría Agua activa ${activas}/${capasAgua} capas`)
})

// ── RF-03 Opacidad ──────────────────────────────────────────────────────────
await correr('RF-03', async () => {
  await page.goto(VISOR('&layers=agua_predios_art111'), { waitUntil: 'networkidle' })
  await expandir(page, 'Agua')
  const slider = page.getByRole('slider', { name: 'Opacidad de Predios Art. 111 Ley 99/93' })
  const tiempos = []
  for (const v of ['0.3', '0.6', '0.9', '0.45', '0.75']) {
    await page.evaluate(() => {
      window.__op = null
      const s = document.querySelector('input[aria-label="Opacidad de Predios Art. 111 Ley 99/93"]')
      s.addEventListener('input', () => (window.__t0 = performance.now()), { capture: true, once: true })
      const mo = new MutationObserver(() => {
        window.__op ??= performance.now() - window.__t0
        mo.disconnect()
      })
      mo.observe(document.querySelector('.leaflet-overlay-pane'), { attributes: true, subtree: true, attributeFilter: ['fill-opacity', 'stroke-opacity'] })
    })
    await slider.fill(v)
    await page.waitForTimeout(300)
    tiempos.push(await page.evaluate(() => window.__op))
  }
  const peor = Math.max(...tiempos.map(t => t ?? Infinity))
  const ok = Number.isFinite(peor) && peor < 1000 / 60
  registrar('RF-03', ok ? 'Cumple' : 'No cumple', `5 cambios de opacidad · peor caso ${Number.isFinite(peor) ? peor.toFixed(1) + ' ms' : '—'} (un cuadro a 60 fps = 16,7 ms)`)
})

// ── RF-04 Leyenda dinámica ──────────────────────────────────────────────────
await correr('RF-04', async () => {
  await page.goto(VISOR('&layers=biodiversidad_cobertura_50k'), { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  await expandir(page, 'Biodiversidad')
  const automatica = await page.locator('aside img[alt^="Leyenda de"], aside ul[aria-label^="Leyenda de"]').count()
  await marcarInicio(page)
  await page.getByRole('button', { name: 'Ver leyenda' }).first().click()
  await page.waitForFunction(() => [...document.querySelectorAll('aside img[alt^="Leyenda de"]')].some(i => i.complete && i.naturalWidth > 0), null, { timeout: 15000 })
  // Desde el clic en "Ver leyenda" hasta que termina de llegar la imagen GetLegendGraphic
  const carga = await page.evaluate(() => {
    const r = performance.getEntriesByType('resource').filter(e => /GetLegendGraphic/i.test(e.name))
    return Math.max(...r.map(e => e.responseEnd)) - window.__t0
  })
  const ok = automatica > 0 && carga < 2000
  registrar('RF-04', ok ? 'Cumple' : carga < 2000 ? 'Parcial' : 'No cumple',
    `GetLegendGraphic del IDEAM en ${ms(carga)} · leyenda visible al activar la capa: ${automatica > 0 ? 'sí' : 'no'}`,
    automatica > 0 ? '' : 'En las capas WMS la leyenda se abre con el botón "Ver leyenda"; las GeoJSON muestran su color junto al nombre')
})

// ── RF-05 Zoom a extensión ──────────────────────────────────────────────────
await correr('RF-05', async () => {
  await page.goto(VISOR('&layers=agua_humedales'), { waitUntil: 'networkidle' })
  await expandir(page, 'Agua')
  await marcarInicio(page)
  await vigilarFinMovimiento(page)
  await page.getByRole('button', { name: 'Zoom a extensión de Humedales' }).click()
  const dur = await duracionMovimiento(page)
  const zoom = Number(new URL(page.url()).searchParams.get('zoom'))
  const salto = dur !== null && dur < 100
  const ok = dur !== null && !salto && dur <= 400 && zoom > 11
  registrar('RF-05', ok ? 'Cumple' : dur !== null && zoom > 11 ? 'Parcial' : 'No cumple',
    `el mapa llega a la extensión en ${dur === null ? '—' : ms(dur)} · zoom 11 → ${zoom}`,
    salto
      ? 'Llega a la extensión correcta, pero de un salto: Leaflet no anima cambios de más de 4 niveles de zoom (fitBounds)'
      : 'Tolerancia: 300 ms + 100 ms')
})

// ── RF-06 Selector de mapa base ─────────────────────────────────────────────
await correr('RF-06', async () => {
  await page.goto(VISOR('&layers=agua_cuencas,territorio_division'), { waitUntil: 'networkidle' })
  const capasAntes = new URL(page.url()).searchParams.get('layers')
  const pathsAntes = await page.locator('.leaflet-overlay-pane path').count()
  // Mediana de 3 rondas: las teselas vienen de servidores externos (Esri, OpenTopoMap, OSM)
  const muestras = { Satélite: [], Topográfico: [], Callejero: [] }
  const HOST = { Satélite: 'arcgisonline.com', Topográfico: 'opentopomap.org', Callejero: 'tile.openstreetmap.org' }
  for (let ronda = 0; ronda < 3; ronda++) {
    for (const boton of Object.keys(muestras)) {
      await vigilarTesela(page, HOST[boton])
      await page.getByRole('group', { name: 'Mapa base' }).getByRole('button', { name: boton }).click()
      await page.waitForSelector(`img.leaflet-tile-loaded[src*="${HOST[boton]}"]`, { timeout: 15000 })
      muestras[boton].push(await page.evaluate(() => window.__tesela ?? Infinity))
      await page.waitForTimeout(300)
    }
  }
  const mediana = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
  const tiempos = Object.fromEntries(Object.entries(muestras).map(([k, v]) => [k, mediana(v)]))
  const capasDespues = new URL(page.url()).searchParams.get('layers')
  const pathsDespues = await page.locator('.leaflet-overlay-pane path').count()
  const peor = Math.max(...Object.values(tiempos))
  const ok = peor < 1000 && capasAntes === capasDespues && pathsAntes === pathsDespues
  registrar('RF-06', ok ? 'Cumple' : 'No cumple',
    `mediana de 3 cambios: ${Object.entries(tiempos).map(([k, v]) => `${k} ${ms(v)}`).join(' · ')} · capas activas conservadas: ${capasAntes === capasDespues && pathsAntes === pathsDespues ? 'sí' : 'no'}`,
    peor >= 1000 ? 'El tiempo depende del servidor externo de teselas' : '')
})

// ── RF-07 Popup de atributos ────────────────────────────────────────────────
await correr('RF-07', async () => {
  await page.goto(VISOR('&layers=agua_cuencas'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const punto = await puntoDeElemento(page)
  await page.evaluate(() => {
    window.__popup = null
    document.addEventListener('click', () => (window.__t0 = performance.now()), { capture: true, once: true })
    const mo = new MutationObserver(() => {
      if (document.querySelector('.leaflet-popup')) {
        window.__popup = performance.now() - window.__t0
        mo.disconnect()
      }
    })
    mo.observe(document.querySelector('.leaflet-popup-pane'), { childList: true, subtree: true })
  })
  await page.mouse.click(punto.x, punto.y)
  await page.waitForSelector('.leaflet-popup-content', { timeout: 5000 })
  const t = await page.evaluate(() => window.__popup)
  const texto = await page.locator('.leaflet-popup-content').innerText()
  const filas = await page.locator('.leaflet-popup-content tr').count()
  const boton = /Ver ficha pedagógica/.test(texto)
  const okGeo = t !== null && t < 200 && filas >= 2 && filas <= 4 && boton
  registrar('RF-07', okGeo ? 'Parcial' : 'No cumple', `popup GeoJSON en ${t === null ? '—' : ms(t)} · ${filas} atributos · botón de ficha: ${boton ? 'sí' : 'no'} · GetFeatureInfo WMS: no implementado`,
    'Las 7 capas WMS solo tienen leyenda; no consultan atributos al clic')
})

// ── RF-08 Búsqueda de lugares (Nominatim) ───────────────────────────────────
await correr('RF-08', async () => {
  await page.goto(VISOR(), { waitUntil: 'networkidle' })
  const caja = page.getByLabel('Buscar lugar en el mapa')
  await caja.click()
  const t0 = Date.now()
  await caja.pressSequentially('Cumbarco', { delay: 30 })
  const fin = Date.now()
  await page.waitForSelector('[aria-label="Resultados de búsqueda"] [role="option"]', { timeout: 10000 })
  const sugerencias = Date.now() - fin
  await vigilarFinMovimiento(page)
  await marcarInicio(page)
  await page.locator('[aria-label="Resultados de búsqueda"] [role="option"]').first().click()
  const dur = await duracionMovimiento(page)
  const ok = sugerencias < 1000 && dur !== null
  registrar('RF-08', ok ? 'Cumple' : dur !== null ? 'Parcial' : 'No cumple',
    `sugerencias ${ms(sugerencias)} después de la última tecla (escritura ${ms(fin - t0)}) · vuelo al lugar: ${dur === null ? 'no' : ms(dur)}`,
    'Incluye la espera de 400 ms antes de consultar Nominatim (servicio externo)')
})

// ── RF-09 Búsqueda en capas ─────────────────────────────────────────────────
await correr('RF-09', async () => {
  await page.goto(VISOR('&layers=agua_humedales,territorio_division'), { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Buscar dentro de capas activas' }).click()
  const campo = page.locator('input[aria-label="Buscar dentro de capas activas"]')
  await campo.fill('Sira')
  await page.waitForTimeout(400)
  const parcial = await page.getByRole('option', { name: /Siracusa/ }).count()
  await campo.fill('Cumbarco')
  await page.waitForTimeout(400)
  const otro = await page.getByRole('option', { name: /Cumbarco/ }).count()
  await vigilarFinMovimiento(page)
  await marcarInicio(page)
  await page.getByRole('option', { name: /Cumbarco/ }).first().click()
  const dur = await duracionMovimiento(page)
  const resaltado = await page.locator('.leaflet-overlay-pane path[stroke="#FFD600"], .leaflet-overlay-pane path.resaltado').count()
  const filtra = parcial > 0 && otro > 0
  registrar('RF-09', filtra && resaltado > 0 ? 'Cumple' : filtra ? 'Parcial' : 'No cumple',
    `filtra mientras se escribe: ${filtra ? 'sí' : 'no'} · vuela al elemento: ${dur === null ? 'no' : 'sí'} · resalta el elemento: ${resaltado > 0 ? 'sí' : 'no'}`)
})

// ── RF-10 Medición ──────────────────────────────────────────────────────────
await correr('RF-10', async () => {
  // Una sola capa de un punto lejano: los clics no caen sobre polígonos que abran la ficha
  await page.goto(`${BASE}/visor?layers=agua_monitoreo_subterraneo&lat=4.16&lng=-75.89&zoom=12`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Medir distancia y área' }).click()
  const pts = [[600, 300], [1000, 300], [1000, 650]]
  const lectura = async ([x, y]) => {
    await page.mouse.move(x, y)
    await page.waitForTimeout(150)
    return (await page.getByLabel('Coordenadas del cursor').innerText()).split(',').map(Number)
  }
  const coords = []
  for (const p of pts) {
    coords.push(await lectura(p))
    await page.mouse.click(p[0], p[1])
    await page.waitForTimeout(200)
  }
  await page.waitForTimeout(400)
  const texto = await page.getByText(/ km · /).innerText()
  const km = parseFloat((texto.match(/([\d.,]+) km/) ?? [])[1]?.replace(',', '.'))
  const ha = parseFloat((texto.match(/([\d.,]+) ha/) ?? [])[1]?.replace(',', '.'))
  // Referencia independiente: haversine con el radio medio que usa Turf (6 371 008,8 m)
  const R = 6371008.8
  const rad = d => (d * Math.PI) / 180
  const hav = ([a1, o1], [a2, o2]) => 2 * R * Math.asin(Math.sqrt(Math.sin(rad(a2 - a1) / 2) ** 2 + Math.cos(rad(a1)) * Math.cos(rad(a2)) * Math.sin(rad(o2 - o1) / 2) ** 2))
  const ref = (hav(coords[0], coords[1]) + hav(coords[1], coords[2])) / 1000
  const err = Math.abs(km - ref) / ref * 100
  await page.getByRole('button', { name: 'Limpiar medición y salir' }).click().catch(() => {})
  const ok = Number.isFinite(km) && Number.isFinite(ha) && err <= 0.5
  registrar('RF-10', ok ? 'Cumple' : 'No cumple', `${km} km · ${ha} ha · referencia haversine ${ref.toFixed(2)} km · diferencia ${err.toFixed(3)} %`,
    'La referencia usa las coordenadas del cursor (4 decimales, ±6 m), así que la diferencia mide sobre todo ese redondeo; tolerancia 0,5 %')
})

// ── RF-11 Coordenadas del cursor ────────────────────────────────────────────
await correr('RF-11', async () => {
  const leer = async (x, y) => {
    await page.mouse.move(x, y)
    await page.waitForTimeout(100)
    return page.getByLabel('Coordenadas del cursor').innerText()
  }
  const a = await leer(700, 400)
  const b = await leer(720, 410)
  const formato = /^-?\d+\.\d{4}, -?\d+\.\d{4}$/
  const ok = formato.test(a) && formato.test(b) && a !== b
  registrar('RF-11', ok ? 'Cumple' : 'No cumple', `"${a}" → "${b}" al mover el cursor 20 px`)
})

// ── RF-12 Fichas pedagógicas ────────────────────────────────────────────────
await correr('RF-12', async () => {
  const ids = fs.readdirSync(RAIZ + 'public/fichas').filter(f => f.endsWith('.json'))
  const fallas = []
  for (const f of ids) {
    const d = JSON.parse(fs.readFileSync(RAIZ + 'public/fichas/' + f, 'utf8'))
    const palabras = `${d.descripcion} ${d.importancia}`.split(/\s+/).length
    const p = d.preguntas_reflexivas.length
    const v = d.vocabulario.length
    const g = d.galeria.length
    if (palabras < 150 || g < 1 || g > 5 || p < 3 || p > 5 || v < 5 || v > 8) fallas.push(`${f} (${palabras} pal., ${g} img., ${p} preg., ${v} térm.)`)
  }
  await page.goto(VISOR('&layers=agua_humedales'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const punto = await puntoDeElemento(page)
  await page.mouse.click(punto.x, punto.y)
  await page.waitForSelector('.ficha-panel.open', { timeout: 5000 })
  const ok = fallas.length === 0
  registrar('RF-12', ok ? 'Cumple' : 'No cumple', `${ids.length} fichas revisadas · ${fallas.length} fuera de criterio · se abre en panel lateral`, fallas.join('; '))
})

// ── RF-13 Multimedia en popup ───────────────────────────────────────────────
await correr('RF-13', async () => {
  const pop = await page.locator('.leaflet-popup-content img').first()
  const miniatura = (await pop.count()) > 0
  const lazy = miniatura && (await pop.getAttribute('loading')) === 'lazy'
  await page.waitForSelector('.ficha-panel [role="tablist"]', { timeout: 8000 })
  const enlacesVideo = await page.locator('.ficha-panel a[href*="youtube.com/watch"]').count()
  const iframeAutoplay = await page.locator('iframe[src*="autoplay=1"]').count()
  registrar('RF-13', 'Parcial',
    `miniatura en popup: ${miniatura ? 'sí' : 'no'} (lazy: ${lazy ? 'sí' : 'no'}) · videos: ${enlacesVideo} enlaces a YouTube en la ficha · autoplay: ${iframeAutoplay ? 'sí' : 'no'}`,
    'Los videos abren en YouTube en vez de un modal con react-player, y el popup no tiene botón de reproducción')
})

// ── RF-14 Recorridos ────────────────────────────────────────────────────────
await correr('RF-14', async () => {
  await page.goto(`${BASE}/visor?recorrido=huellas_cafe`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[aria-label="Recorrido guiado"]', { timeout: 8000 })
  await page.waitForTimeout(2500)
  await vigilarFinMovimiento(page)
  await marcarInicio(page)
  await page.getByRole('button', { name: 'Siguiente parada' }).click()
  const dur = await duracionMovimiento(page)
  const atras = await page.getByRole('button', { name: 'Parada anterior' }).isEnabled()
  const ok = dur !== null && Math.abs(dur - 800) <= 200 && atras
  registrar('RF-14', ok ? 'Cumple' : dur !== null && atras ? 'Parcial' : 'No cumple',
    `Siguiente/Anterior: sí · vuelo a la parada en ${dur === null ? '—' : ms(dur)} (SRS: 800 ms ± 200)`, 'El uso sin conexión se verifica en RF-19')
})

// ── RF-15 Línea de tiempo ───────────────────────────────────────────────────
await correr('RF-15', async () => {
  await page.goto(VISOR('&layers=biodiversidad_cobertura_50k'), { waitUntil: 'load' })
  await expandir(page, 'Biodiversidad')
  const control = await page.locator('input[type="range"]:not([aria-label^="Opacidad"]), [aria-label*="año" i], [aria-label*="línea de tiempo" i]').count()
  registrar('RF-15', control > 0 ? 'Parcial' : 'No cumple', control > 0 ? 'hay un control de años' : 'no hay control de línea de tiempo',
    control > 0 ? '' : 'No implementado (ver plan-geo2, bloque 4)')
})

// ── RF-16 Glosario ──────────────────────────────────────────────────────────
await correr('RF-16', async () => {
  await page.goto(`${BASE}/glosario`, { waitUntil: 'networkidle' })
  const total = await page.locator('article').count()
  await page.getByRole('searchbox', { name: 'Buscar en el glosario' }).fill('páramo')
  const filtrados = await page.locator('article').count()
  await page.getByRole('link', { name: /Ver en el visor/ }).first().click()
  await page.waitForURL(/\/visor/)
  await page.waitForTimeout(1200)
  const fichaAbierta = await page.locator('.ficha-panel.open').count()
  const ok = filtrados > 0 && filtrados < total && fichaAbierta > 0
  registrar('RF-16', ok ? 'Cumple' : filtrados > 0 && filtrados < total ? 'Parcial' : 'No cumple',
    `${total} términos · búsqueda "páramo" → ${filtrados} · el enlace abre ${fichaAbierta ? 'la ficha' : `el visor en la categoría (${new URL(page.url()).search})`}`)
})

// ── RF-17 Exportar PNG ──────────────────────────────────────────────────────
await correr('RF-17', async () => {
  await page.goto(VISOR('&layers=agua_cuencas'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const t0 = Date.now()
  const [descarga] = await Promise.all([
    page.waitForEvent('download', { timeout: 20000 }),
    page.getByRole('button', { name: 'Exportar vista del mapa como imagen PNG' }).click(),
  ])
  const ruta = await descarga.path()
  const t = Date.now() - t0
  const png = fs.readFileSync(ruta)
  const w = png.readUInt32BE(16)
  const h = png.readUInt32BE(20)
  const okRes = w >= 1920 && h >= 1080
  registrar('RF-17', t < 3000 && okRes ? 'Cumple' : t < 3000 ? 'Parcial' : 'No cumple', `PNG descargado en ${ms(t)} · ${w} × ${h} px (ventana de 1440 × 900)`,
    okRes ? '' : 'La imagen tiene el tamaño del mapa en pantalla; no alcanza 1920 × 1080')
})

// ── RF-18 Compartir URL ─────────────────────────────────────────────────────
await correr('RF-18', async () => {
  const url = `${BASE}/visor?layers=agua_cuencas,territorio_division&lat=4.0500&lng=-75.8500&zoom=12&base=esri`
  const otro = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' })
  const p2 = await otro.newPage()
  await p2.goto(url, { waitUntil: 'networkidle' })
  await p2.waitForTimeout(1500)
  const q = new URL(p2.url()).searchParams
  const paths = await p2.locator('.leaflet-overlay-pane path').count()
  const esri = await p2.locator('img.leaflet-tile-loaded[src*="arcgisonline.com"]').count()
  await otro.close()
  const ok = q.get('layers') === 'agua_cuencas,territorio_division' && q.get('zoom') === '12' && q.get('lat') === '4.0500' && q.get('lng') === '-75.8500' && paths > 0 && esri > 0
  registrar('RF-18', ok ? 'Cumple' : 'No cumple', `en otra sesión: capas ${q.get('layers')}, zoom ${q.get('zoom')}, centro ${q.get('lat')}, ${q.get('lng')}, mapa satélite: ${esri > 0 ? 'sí' : 'no'}`)
})

// ── RF-19 Offline ───────────────────────────────────────────────────────────
await correr('RF-19', async () => {
  const off = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'allow' })
  const p = await off.newPage()
  await p.goto(`${BASE}/visor?layers=agua_cuencas,territorio_division&lat=4.16&lng=-75.89&zoom=11`, { waitUntil: 'networkidle' })
  // Primera visita: el service worker precarga las teselas de Sevilla (z10–14) antes de activarse
  await p.evaluate(() => navigator.serviceWorker.ready)
  const teselasCache = await p.evaluate(async () => {
    const c = await caches.open('osm-tiles-precache-v2')
    return (await c.keys()).length
  })
  await p.waitForTimeout(2000)
  await off.setOffline(true)
  const resultado = {}
  // a) Abrir la app sin conexión y entrar al visor desde el menú
  try {
    await p.goto(`${BASE}/`, { waitUntil: 'load', timeout: 15000 })
    resultado.inicio = (await p.locator('main').count()) > 0
  } catch {
    resultado.inicio = false
  }
  // b) Abrir directamente un enlace al visor sin conexión
  try {
    const r = await p.goto(`${BASE}/visor?layers=agua_cuencas,territorio_division`, { waitUntil: 'load', timeout: 15000 })
    await p.waitForTimeout(1500)
    resultado.enlace = !!r && (await p.locator('.leaflet-container').count()) > 0
  } catch {
    resultado.enlace = false
  }
  // c) Entrar al visor desde el menú y volar a una zona no visitada (zoom 13)
  try {
    if (!resultado.enlace) {
      await p.waitForTimeout(1500)
      await p.goto(`${BASE}/`, { waitUntil: 'load', timeout: 15000 }).catch(() => p.goto(`${BASE}/`, { waitUntil: 'load', timeout: 15000 }))
      await p.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: /Visor/ }).click()
    }
    await p.waitForSelector('.leaflet-container', { timeout: 10000 })
    await p.waitForTimeout(1500)
    await p.evaluate(() => window.dispatchEvent(new CustomEvent('geocoderFlyTo', { detail: { lat: 4.3, lng: -75.95, zoom: 13 } })))
    await p.waitForTimeout(4000)
    resultado.visor = true
    resultado.paths = await p.locator('.leaflet-overlay-pane path').count()
    resultado.teselas = await p.locator('img.leaflet-tile-loaded[src*="tile.openstreetmap.org"]').count()
    // Solo cuentan las teselas dentro de la zona precargada (BBOX de src/sw.ts, z10–14)
    const pendientes = await p.evaluate(() =>
      [...document.querySelectorAll('img.leaflet-tile:not(.leaflet-tile-loaded)')].map(i => i.src)
    )
    const enZona = src => {
      const m = src.match(/\/(\d+)\/(\d+)\/(\d+)\.png/)
      if (!m) return false
      const [z, x, y] = m.slice(1).map(Number)
      const n = 2 ** z
      const tx = lng => Math.floor(((lng + 180) / 360) * n)
      const ty = lat => {
        const r = (lat * Math.PI) / 180
        return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n)
      }
      return z >= 10 && z <= 14 && x >= tx(-76.06) && x <= tx(-75.72) && y >= ty(4.43) && y <= ty(3.88)
    }
    resultado.teselasFallidas = pendientes.filter(enZona).length
    // c) Una capa WMS sin conexión debe mostrar un aviso
    await expandir(p, 'Biodiversidad')
    await p.getByRole('checkbox', { name: 'Activar capa Cobertura de la Tierra 2024' }).check()
    await p.waitForTimeout(14000)
    resultado.avisoWms = (await p.getByText(/no respondió/).count()) > 0
  } catch (e) {
    resultado.visor ??= false
    resultado.error = e.message.split('\n')[0]
  }
  await off.close()
  const ok = teselasCache >= 500 && resultado.inicio && resultado.enlace && resultado.visor && resultado.paths > 0 && resultado.teselas > 0 && resultado.teselasFallidas === 0 && resultado.avisoWms
  registrar('RF-19', ok ? 'Cumple' : resultado.inicio || resultado.visor ? 'Parcial' : 'No cumple',
    `${teselasCache} teselas precargadas · sin conexión: inicio ${resultado.inicio ? 'abre' : 'no abre'}, enlace directo al visor ${resultado.enlace ? 'abre' : 'no abre'}, visor desde el menú ${resultado.visor ? 'abre' : 'no abre'}` +
      (resultado.visor ? ` · en z13: ${resultado.paths} elementos GeoJSON, ${resultado.teselas} teselas OSM cargadas y ${resultado.teselasFallidas} sin cargar dentro de la zona precargada · aviso WMS: ${resultado.avisoWms ? 'sí' : 'no'}` : ''),
    resultado.error ?? '')
})

// ── RF-20 y RF-21 Accesibilidad (axe-core) ──────────────────────────────────
const PAGINAS = ['/', '/visor?layers=agua_cuencas,biodiversidad_cobertura_50k&lat=4.16&lng=-75.89&zoom=11', '/recorridos', '/glosario', '/guia', '/creditos', '/privacidad']
await correr('RF-20', async () => {
  const fallas = []
  for (const ruta of PAGINAS) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    if (ruta.startsWith('/visor')) {
      const punto = await puntoDeElemento(page)
      await page.mouse.click(punto.x, punto.y)
      await page.waitForSelector('.ficha-panel.open', { timeout: 5000 })
      await page.locator('.ficha-panel').getByRole('tab', { name: 'Galería' }).click().catch(() => {})
      await page.waitForTimeout(800)
    }
    const v = await axe(page, { runOnly: { type: 'rule', values: ['image-alt', 'svg-img-alt', 'role-img-alt', 'input-image-alt'] } })
    for (const x of v) fallas.push(`${ruta.split('?')[0]}: ${x.id} (${x.nodos})`)
  }
  registrar('RF-20', fallas.length === 0 ? 'Cumple' : 'No cumple', `${PAGINAS.length} páginas (visor con popup y ficha abiertos) · ${fallas.length} violaciones de texto alternativo`, fallas.join('; '))
})

await correr('RF-21', async () => {
  const fallas = []
  for (const ruta of PAGINAS) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const v = await axe(page, { runOnly: { type: 'tag', values: ['cat.keyboard'] } })
    for (const x of v) fallas.push(`${ruta.split('?')[0]}: ${x.id} (${x.nodos})`)
  }
  // Foco visible: recorre con Tab los primeros 60 controles del visor
  await page.goto(VISOR('&layers=agua_cuencas'), { waitUntil: 'networkidle' })
  const sinFoco = []
  let recorridos = 0
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const s = getComputedStyle(el)
      const visible = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'
      const nombre = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName
      return { visible, nombre }
    })
    if (!info) continue
    recorridos++
    if (!info.visible) sinFoco.push(info.nombre)
  }
  const ok = fallas.length === 0 && sinFoco.length === 0
  registrar('RF-21', ok ? 'Cumple' : 'No cumple',
    `${PAGINAS.length} páginas · ${fallas.length} violaciones de teclado (axe) · ${recorridos} controles recorridos con Tab, ${sinFoco.length} sin foco visible`,
    [...fallas, ...(sinFoco.length ? [`sin foco visible: ${[...new Set(sinFoco)].slice(0, 8).join(', ')}`] : [])].join('; '))
})

await browser.close()

// ── Informe ─────────────────────────────────────────────────────────────────
const fecha = new Date().toISOString().slice(0, 10)
const ids = Object.keys(RF)
const cuenta = e => ids.filter(id => resultados[id]?.estado === e).length
const cumplen = cuenta('Cumple')
const pct = ((cumplen / ids.length) * 100).toFixed(1).replace('.', ',')
fs.writeFileSync(SALIDA + 'requisitos/resultados.json', JSON.stringify({ fecha, base: BASE, resultados }, null, 2) + '\n')

const celda = s => String(s ?? '').replace(/\|/g, '\\|')
const filas = ids.map(id => {
  const [nombre, criterio] = RF[id]
  const r = resultados[id] ?? { estado: 'Sin ejecutar', medicion: '' }
  const cobertura = [`requisitos.mjs ${id}`, ...(VALIDAR[id] ?? []).map(n => `validar.mjs: ${n}`)].join('<br>')
  return `| ${id} | ${nombre} | ${celda(criterio)} | ${celda(cobertura)} | ${celda(r.medicion)}${r.nota ? `<br>*${celda(r.nota)}*` : ''} | **${r.estado}** |`
})
const md = `# Trazabilidad de requisitos funcionales

Generado por \`tests/e2e/requisitos.mjs\` el ${fecha} contra ${BASE}.
Criterios de aceptación tomados del *Documento de Requerimientos v2* (sección 7).
Datos crudos: [\`requisitos/resultados.json\`](requisitos/resultados.json).

## Resumen

| Resultado | RF |
|---|---|
| Cumple | ${cumplen} |
| Parcial | ${cuenta('Parcial')} |
| No cumple | ${cuenta('No cumple')} |
| Error de la prueba | ${cuenta('ERROR')} |
| **% de RF que cumplen su criterio** | **${pct} %** (${cumplen} de ${ids.length}) |

"Parcial" significa que la función existe y se usa, pero no cumple todo el criterio del SRS
(la nota de cada fila explica qué falta). Para el indicador solo cuenta "Cumple".

## Detalle

| RF | Nombre | Criterio de aceptación (SRS) | Prueba | Medición | Resultado |
|---|---|---|---|---|---|
${filas.join('\n')}

## Cómo regenerar

\`\`\`bash
BASE=https://www.refiup.app npm run test:rf
\`\`\`

\`validar.mjs\` es la prueba de regresión (debe pasar siempre); \`requisitos.mjs\` mide cada RF
contra su criterio y puede reportar "Parcial" o "No cumple" sin que eso sea una regresión.
`
fs.writeFileSync(SALIDA + 'trazabilidad-rf.md', md)
console.log(`\n${cumplen}/${ids.length} RF cumplen su criterio (${pct} %) · ${cuenta('Parcial')} parciales · ${cuenta('No cumple')} no cumplen · ${cuenta('ERROR')} errores`)
