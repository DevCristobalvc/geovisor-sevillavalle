// Validación end-to-end del geovisor con Playwright y el Chrome del sistema.
//
// Uso:  npm run build && npx vite preview --port 4173 (en otra terminal)
//       npm run test:e2e                      → contra http://localhost:4173, navegador visible
//       BASE=https://www.refiup.app npm run test:e2e   → contra producción
//       HEADLESS=1 npm run test:e2e -- --sin-cvc        → sin ventana y sin las WMS de la CVC
//
// --sin-cvc omite las capas WMS de la CVC: su firewall bloquea la IP ante ráfagas de
// peticiones. Las capturas y resultados.json quedan en tests/e2e/capturas/ (ignorada por git).
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const SHOTS = new URL('./capturas/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
fs.mkdirSync(SHOTS, { recursive: true })
const SIN_CVC = process.argv.includes('--sin-cvc')

// Límite oficial de Sevilla (con margen) para comprobar que los datos caen en el municipio
const BBOX = { minLat: 3.88, maxLat: 4.43, minLng: -76.06, maxLng: -75.72 }

const GEOJSON = [
  'actores_humedales', 'actores_paramo', 'actores_bosque_andino', 'actores_bosque_seco',
  'agua_cuencas', 'agua_humedales', 'agua_calidad', 'agua_monitoreo_subterraneo',
  'agua_predios_art111', 'biodiversidad_paramos', 'biodiversidad_especies',
  'biodiversidad_areas_protegidas', 'clima_estaciones', 'territorio_division',
  'territorio_resguardos', 'territorio_pcc',
]
const WMS = [
  ['agua_red_hidrica', 'portal-geo.cvc.gov.co'],
  ['biodiversidad_cobertura_50k', 'visualizador.ideam.gov.co'],
  ['biodiversidad_ecosistemas', 'portal-geo.cvc.gov.co'],
  ['biodiversidad_zonificacion_forestal', 'portal-geo.cvc.gov.co'],
  ['clima_isoyetas', 'portal-geo.cvc.gov.co'],
  ['clima_pisos_termicos', 'visualizador.ideam.gov.co'],
  ['suelos_conflictos_uso', 'mapas.igac.gov.co'],
]


// Clic en un elemento vectorial visible que no quede tapado por el panel de capas
async function clickFeature(page) {
  const cajas = await page.locator('.leaflet-overlay-pane path.leaflet-interactive').evaluateAll(els =>
    els.map(e => { const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width } }))
  const c = cajas.find(b => b.x > 360 && b.x < 1300 && b.y > 120 && b.y < 820)
  if (!c) throw new Error('sin elementos visibles para hacer clic')
  await page.mouse.click(c.x, c.y)
}

async function expandirCategorias(page) {
  for (const cat of ['Actores Sociales', 'Agua', 'Biodiversidad', 'Cambio Climático', 'Suelos', 'Territorio']) {
    const btn = page.locator('aside button[aria-expanded]', { hasText: cat }).first()
    if ((await btn.getAttribute('aria-expanded')) !== 'true') await btn.click()
  }
}

const FICHAS = [
  'actores_bosque_andino', 'actores_bosque_seco', 'actores_humedales', 'actores_paramo',
  'agua_calidad', 'agua_cuencas', 'agua_humedales', 'agua_monitoreo_subterraneo',
  'agua_predios_art111', 'agua_red_hidrica', 'biodiversidad_areas_protegidas',
  'biodiversidad_cobertura', 'biodiversidad_ecosistemas', 'biodiversidad_especies',
  'biodiversidad_paramos', 'biodiversidad_zonificacion_forestal', 'clima_estaciones',
  'clima_isoyetas', 'clima_pisos_termicos', 'suelos_conflictos_uso', 'territorio_division',
  'territorio_pcc', 'territorio_resguardos',
]

const resultados = []
const ok = (nombre, cond, detalle = '') => {
  resultados.push({ nombre, ok: !!cond, detalle })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${nombre}${detalle ? ' — ' + detalle : ''}`)
}

const browser = await chromium.launch({
  channel: 'chrome',
  headless: process.env.HEADLESS === '1',
  slowMo: process.env.HEADLESS === '1' ? 0 : 40,
})
// Sin service worker: queremos medir la red real, no la caché
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
const page = await ctx.newPage()
const consola = []
page.on('console', m => m.type() === 'error' && consola.push(m.text()))
page.on('pageerror', e => consola.push('pageerror: ' + e.message))

// ── 1. Home ────────────────────────────────────────────────────────────────
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const home = await page.locator('main').innerText()
ok('Home: no menciona Humboldt/RUNAP/GBIF/IAvH', !/humboldt|runap|gbif|iavh/i.test(home))
ok('Home: créditos COMBA I+D y directores', /COMBA I\+D/.test(home) && /Silvia Andrea Quijano/.test(home))
ok('Home: área oficial 538 km²', /538 km²/.test(home))
ok('Home: nombra las fuentes oficiales', /CVC/.test(home) && /IDEAM/.test(home) && /IGAC/.test(home))
ok('Navbar: enlace al GeoCVC vigente',
  (await page.locator('a[href="https://portal-geo.cvc.gov.co"]').count()) > 0)
await page.screenshot({ path: SHOTS + '01-home.png' })

// ── 2. Créditos ───────────────────────────────────────────────────────────
await page.goto(BASE + '/creditos', { waitUntil: 'networkidle' })
const cred = await page.locator('main').innerText()
ok('Créditos: sin RUNAP/GBIF/INFORMA', !/runap|gbif|informa/i.test(cred))
ok('Créditos: declara datos ilustrativos', /Datos ilustrativos/.test(cred))

// ── 3. GeoJSON: las 16 capas cargan, tienen elementos y caen en Sevilla ──────
const respuestas = new Map()
const onResp = async r => {
  const u = r.url()
  if (u.includes('/data/') && u.endsWith('.json')) {
    try { respuestas.set(u.split('/data/')[1], { status: r.status(), json: await r.json() }) } catch { /* noop */ }
  }
}
page.on('response', onResp)
await page.goto(`${BASE}/visor?layers=${GEOJSON.join(',')}&lat=4.16&lng=-75.89&zoom=11`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
page.off('response', onResp)

const coordsDe = g => {
  const out = []
  const walk = c => (typeof c[0] === 'number' ? out.push(c) : c.forEach(walk))
  walk(g.coordinates)
  return out
}
const PERSONALES = /correo|email|@|telefono|celular|observador|propietario|nit\b|contacto/i
let totalFeatures = 0
let oficiales = 0
for (const [archivo, { status, json }] of respuestas) {
  const n = json.features?.length ?? 0
  totalFeatures += n
  const pts = json.features.flatMap(f => coordsDe(f.geometry))
  const dentro = pts.every(([x, y]) => x >= BBOX.minLng && x <= BBOX.maxLng && y >= BBOX.minLat && y <= BBOX.maxLat)
  const personales = json.features.some(f =>
    Object.entries(f.properties).some(([k, v]) => PERSONALES.test(k) || /@/.test(String(v))))
  const oficial = json.metadata?.fuente?.includes('CVC')
  ok(`GeoJSON ${archivo}`, status === 200 && n > 0 && !personales && (dentro || !oficial),
    `${n} elementos · ${oficial ? 'oficial CVC' : 'ilustrativo'} · ${dentro ? 'dentro de Sevilla' : 'FUERA del municipio'}${personales ? ' · DATOS PERSONALES' : ' · sin datos personales'}`)
  if (oficial) oficiales++
}
ok('GeoJSON: se pidieron las 16 capas', respuestas.size === 16, `${respuestas.size} respuestas`)
ok('GeoJSON: 13 capas con metadata oficial de la CVC', oficiales === 13, `${oficiales}`)
const paths = await page.locator('.leaflet-overlay-pane path').count()
ok('Mapa: elementos vectoriales dibujados', paths >= totalFeatures * 0.9, `${paths} paths / ${totalFeatures} elementos`)
await page.screenshot({ path: SHOTS + '02-geojson-todas.png' })

// Panel: etiquetas de fuente e "Ilustrativo"
await expandirCategorias(page)
const panel = await page.locator('aside[aria-label="Panel de capas geográficas"]').innerText()
const nIlus = (panel.match(/ILUSTRATIVO/g) || []).length
ok('Panel: solo las 3 capas de actores sin datos oficiales rotuladas Ilustrativo', nIlus === 3, `${nIlus}`)
ok('Panel: capas GeoJSON oficiales marcadas CVC', /CVC · GeoJSON/.test(panel))
ok('Panel: fuente de las WMS visible', /CVC · WMS en vivo/.test(panel) && /IDEAM · WMS en vivo/.test(panel) && /IGAC · WMS en vivo/.test(panel))

// ── 3b. RF-18: un enlace compartido abre el mapa en su lat/lng/zoom ─────────
{
  const tiles = []
  const onTile = r => {
    const m = r.url().match(/tile\.openstreetmap\.org\/(\d+)\/(\d+)\/(\d+)\.png/)
    if (m) tiles.push(m.slice(1).map(Number))
  }
  page.on('request', onTile)
  await page.goto(`${BASE}/visor?lat=4.0500&lng=-75.8500&zoom=12`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  page.off('request', onTile)
  const n = 2 ** 12
  const cx = Math.floor(((-75.85 + 180) / 360) * n)
  const lr = (4.05 * Math.PI) / 180
  const cy = Math.floor(((1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2) * n)
  const z12 = tiles.filter(t => t[0] === 12)
  ok('RF-18: el enlace restaura lat/lng/zoom', z12.length > 0 && z12.some(t => t[1] === cx && t[2] === cy) && !tiles.some(t => t[0] === 13),
    `${z12.length} teselas z12, centro (${cx},${cy}) ${z12.some(t => t[1] === cx && t[2] === cy) ? 'pedido' : 'NO pedido'}`)
}

// ── 4. Popup + ficha con procedencia ────────────────────────────────────────
await page.goto(`${BASE}/visor?layers=agua_monitoreo_subterraneo&lat=4.2704&lng=-75.9335&zoom=16`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await clickFeature(page)
await page.waitForSelector('.leaflet-popup-content', { timeout: 5000 })
const pop = await page.locator('.leaflet-popup-content').innerText()
ok('Popup oficial: atributos legibles y fuente CVC', /Código del pozo/.test(pop) && /vs-pm-1/.test(pop) && /Fuente: CVC/.test(pop) && !/Dato ilustrativo/.test(pop), pop.replace(/\s+/g, ' ').slice(0, 140))
await page.screenshot({ path: SHOTS + '03-popup.png' })
await page.locator('.leaflet-popup-content button').click()
await page.waitForSelector('.ficha-panel.open', { timeout: 5000 })
await page.waitForTimeout(800)
const ficha = await page.locator('.ficha-panel').innerText()
ok('Ficha: muestra "Datos de la capa: CVC" y "Referencias"', /Datos de la capa:\s*CVC/.test(ficha) && /Referencias:/.test(ficha))
await page.screenshot({ path: SHOTS + '04-ficha.png' })

await page.goto(`${BASE}/visor?layers=actores_paramo&lat=4.16&lng=-75.89&zoom=11`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await clickFeature(page)
await page.waitForSelector('.leaflet-popup-content', { timeout: 5000 })
const popI = await page.locator('.leaflet-popup-content').innerText()
ok('Popup ilustrativo: aviso visible y sin nombres de personas', /Dato ilustrativo/.test(popI) && !/Carmen|Nelson|Patiño|Giraldo/.test(popI))
await page.screenshot({ path: SHOTS + '05-popup-ilustrativo.png' })

// ── 5. WMS: cada capa devuelve imágenes válidas del servicio oficial ─────────
for (const [id, host] of WMS) {
  if (SIN_CVC && host.includes('cvc')) continue
  if (host.includes('cvc')) await page.waitForTimeout(20000)
  const imgs = []
  const onWms = async r => {
    if (r.url().includes(host) && /request=GetMap/i.test(r.url())) {
      let bytes = 0
      try { bytes = (await r.body()).length } catch { /* noop */ }
      imgs.push({ status: r.status(), type: r.headers()['content-type'] ?? '', bytes })
    }
  }
  const fallos = []
  const onFail = r => r.url().includes(host) && fallos.push(r.failure()?.errorText)
  page.on('response', onWms)
  page.on('requestfailed', onFail)
  await page.goto(`${BASE}/visor?layers=${id}&lat=4.16&lng=-75.89&zoom=11`, { waitUntil: 'load' })
  await page.waitForTimeout(20000)
  page.off('response', onWms)
  page.off('requestfailed', onFail)
  const buenas = imgs.filter(i => i.status === 200 && i.type.startsWith('image/png') && i.bytes > 500)
  const aviso = await page.getByText('no respondió').count()
  ok(`WMS ${id}`, buenas.length > 0 && aviso === 0,
    `${buenas.length}/${imgs.length} teselas PNG válidas de ${host}${fallos.length ? ` · ${fallos.length} fallidas` : ''}${aviso ? ' · AVISO DE ERROR VISIBLE' : ''}`)
  await page.screenshot({ path: SHOTS + `06-wms-${id}.png` })
}

// ── 6. Leyendas ─────────────────────────────────────────────────────────────
await page.goto(`${BASE}/visor?layers=clima_pisos_termicos,suelos_conflictos_uso,biodiversidad_cobertura_50k&lat=4.16&lng=-75.89&zoom=11`, { waitUntil: 'load' })
await page.waitForTimeout(2500)
await expandirCategorias(page)
const botones = page.getByRole('button', { name: 'Ver leyenda' })
const nb = await botones.count()
for (let i = 0; i < nb; i++) await page.getByRole('button', { name: 'Ver leyenda' }).first().click()
await page.waitForTimeout(3000)
const panelL = await page.locator('aside[aria-label="Panel de capas geográficas"]').innerText()
ok('Leyenda propia de pisos térmicos', /Templado · 18 a 24 °C/.test(panelL))
ok('Leyenda propia de conflictos de uso', /Subutilización/.test(panelL) && /Sobreutilización/.test(panelL))
const legImg = await page.locator('aside img[alt^="Leyenda de"]').evaluateAll(els => els.map(e => e.naturalWidth))
ok('Leyenda GetLegendGraphic (IDEAM cobertura) carga', legImg.some(w => w > 0), `anchos: ${legImg.join(',')}`)
await page.locator('aside[aria-label="Panel de capas geográficas"]').screenshot({ path: SHOTS + '07-leyendas.png' })

// ── 6b. Tema día/noche (RF-06): abre en día, se alterna, dura en la pestaña ──────
{
  // Visita nueva con el sistema en modo oscuro y una preferencia vieja en localStorage:
  // debe abrir igual en modo día.
  const ctxNuevo = await browser.newContext({ colorScheme: 'dark', serviceWorkers: 'block' })
  await ctxNuevo.addInitScript(() => {
    try {
      localStorage.setItem('ecodex-tema', 'oscuro')
    } catch {
      /* noop */
    }
  })
  const visita = await ctxNuevo.newPage()
  await visita.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const oscuroAlAbrir = await visita.evaluate(() => document.documentElement.classList.contains('dark'))
  ok('Tema: toda visita nueva abre en modo día', !oscuroAlAbrir)
  await ctxNuevo.close()
}
await page.goto(`${BASE}/visor?layers=territorio_division`, { waitUntil: 'networkidle' })
await page.evaluate(() => sessionStorage.removeItem('ecodex-tema'))
await page.reload({ waitUntil: 'networkidle' })
const temaInicial = await page.evaluate(() => document.documentElement.classList.contains('dark'))
await page.getByRole('button', { name: /modo (día|noche)/i }).click()
await page.waitForTimeout(400)
const temaTrasClic = await page.evaluate(() => document.documentElement.classList.contains('dark'))
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const temaTrasRecarga = await page.evaluate(() => document.documentElement.classList.contains('dark'))
ok('Tema: el botón alterna a noche y se mantiene al recargar la pestaña', !temaInicial && temaTrasClic && temaTrasRecarga)
const filtro = await page.locator('.mapa-base-filtro').first().evaluate(e => getComputedStyle(e).filter)
ok('Tema oscuro: mapa base con filtro de fósforo', filtro !== 'none', filtro.slice(0, 60))
await page.screenshot({ path: SHOTS + '08-tema-oscuro.png' })
await page.evaluate(() => sessionStorage.setItem('ecodex-tema', 'claro'))

// ── 6c. Fichas: 3–5 preguntas e imágenes solo de Wikimedia Commons ─────────
const fichas = await page.evaluate(async ids => {
  const out = []
  for (const id of ids) {
    const f = await fetch(`/fichas/${id}.json`).then(r => r.json())
    out.push({ id, preguntas: f.preguntas_reflexivas.length, imagenes: f.galeria.map(g => g.url) })
  }
  return out
}, FICHAS)
for (const f of fichas) {
  const imagenesOk = f.imagenes.every(u => /^https:\/\/upload\.wikimedia\.org\//.test(u))
  ok(`Ficha ${f.id}`, f.preguntas >= 3 && f.preguntas <= 5 && imagenesOk,
    `${f.preguntas} preguntas · ${f.imagenes.length} imágenes${imagenesOk ? '' : ' · IMAGEN FUERA DE WIKIMEDIA'}`)
}

// ── 7. Consola ──────────────────────────────────────────────────────────────
const relevantes = consola.filter(t => !/Failed to load resource|ERR_|net::/.test(t))
ok('Consola sin errores de la aplicación', relevantes.length === 0, relevantes.slice(0, 3).join(' | '))

await browser.close()
const fallidas = resultados.filter(r => !r.ok)
console.log(`\n${resultados.length - fallidas.length}/${resultados.length} validaciones correctas`)
fs.writeFileSync(SHOTS + 'resultados.json', JSON.stringify(resultados, null, 2))
process.exit(fallidas.length ? 1 : 0)
