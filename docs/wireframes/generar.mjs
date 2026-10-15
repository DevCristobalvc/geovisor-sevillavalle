// Genera los wireframes del geovisor a partir de sus pantallas reales.
//
// Uso:  BASE=https://www.refiup.app node docs/wireframes/generar.mjs
//       (por defecto http://localhost:4173, con `npx vite preview --port 4173`)
//
// Recorre cada pantalla con Playwright y el Chrome del sistema, mide la posición de sus
// regiones y controles (cabecera, paneles, mapa, botones, campos, títulos, textos e
// imágenes) y los dibuja como un wireframe de baja fidelidad en SVG y PNG.
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const DIR = new URL('./', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')

const ESCRITORIO = { width: 1440, height: 900 }
const MOVIL = { width: 390, height: 844 }

const PANTALLAS = [
  { id: '01-inicio', titulo: 'Inicio', ruta: '/', vista: ESCRITORIO, completa: true },
  { id: '02-visor', titulo: 'Visor: panel de capas y herramientas', ruta: '/visor?layers=agua_cuencas,territorio_division&lat=4.16&lng=-75.89&zoom=11', vista: ESCRITORIO },
  { id: '03-visor-ficha', titulo: 'Visor: ventana emergente y ficha pedagógica', ruta: '/visor?layers=agua_cuencas&lat=4.16&lng=-75.89&zoom=11', vista: ESCRITORIO, accion: 'ficha' },
  { id: '04-visor-recorrido', titulo: 'Visor: recorrido guiado', ruta: '/visor?recorrido=huellas_cafe', vista: ESCRITORIO },
  { id: '05-recorridos', titulo: 'Recorridos', ruta: '/recorridos', vista: ESCRITORIO, completa: true },
  { id: '06-glosario', titulo: 'Glosario', ruta: '/glosario', vista: ESCRITORIO, completa: true },
  { id: '07-guia', titulo: 'Guía de uso', ruta: '/guia', vista: ESCRITORIO, completa: true },
  { id: '08-creditos', titulo: 'Créditos', ruta: '/creditos', vista: ESCRITORIO, completa: true },
  { id: '09-privacidad', titulo: 'Privacidad', ruta: '/privacidad', vista: ESCRITORIO, completa: true },
  { id: '10-inicio-movil', titulo: 'Inicio (móvil)', ruta: '/', vista: MOVIL, completa: true },
  { id: '11-visor-movil', titulo: 'Visor (móvil)', ruta: '/visor?layers=agua_cuencas,territorio_division&lat=4.16&lng=-75.89&zoom=11', vista: MOVIL },
]

// Lee las cajas de la pantalla (en coordenadas del documento)
function medir() {
  const visible = el => {
    const s = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05 && r.width > 4 && r.height > 4
  }
  const caja = (el, tipo, etiqueta = '') => {
    const r = el.getBoundingClientRect()
    return { tipo, etiqueta: etiqueta.replace(/\s+/g, ' ').trim().slice(0, 48), x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }
  }
  const nombre = el =>
    el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('alt') || el.innerText || el.value || ''
  // Descarta lo que queda tapado por otro elemento (p. ej. la barra de herramientas bajo la
  // ficha). Solo se puede comprobar dentro de la ventana; lo que está más abajo se acepta.
  const encima = el => {
    const r = el.getBoundingClientRect()
    const cx = r.x + r.width / 2
    const cy = r.y + r.height / 2
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return true
    const hit = document.elementFromPoint(cx, cy)
    return !!hit && (el === hit || el.contains(hit) || hit.contains(el))
  }
  const out = []
  const vistos = new Set()
  const agregar = (sel, tipo, etiqueta) => {
    for (const el of document.querySelectorAll(sel)) {
      if (vistos.has(el) || !visible(el) || !encima(el)) continue
      // Nada dentro del mapa salvo el propio mapa y sus ventanas emergentes
      if (el.closest('.leaflet-container') && !el.matches('.leaflet-container, .leaflet-popup-content-wrapper')) continue
      vistos.add(el)
      out.push(caja(el, tipo, etiqueta ? etiqueta(el) : ''))
    }
  }
  const REGION = {
    HEADER: 'Cabecera', NAV: 'Navegación', FOOTER: 'Pie de página', ASIDE: 'Panel', MAIN: '', SECTION: 'Sección',
  }
  agregar('header, nav, footer, aside, [role="dialog"], [role="complementary"], section, .dex-card, article', 'region',
    el => el.getAttribute('aria-label') || REGION[el.tagName] || '')
  agregar('.leaflet-container', 'mapa', () => 'Mapa (Leaflet)')
  agregar('.leaflet-popup-content-wrapper', 'region', () => 'Ventana emergente')
  agregar('canvas', 'imagen', () => 'Animación')
  agregar('img', 'imagen', el => el.getAttribute('alt') || 'Imagen')
  agregar('iframe', 'imagen', () => 'Video')
  agregar('input[type="range"]', 'deslizador', nombre)
  agregar('input[type="checkbox"]', 'casilla', () => '')
  agregar('input, textarea, select', 'campo', nombre)
  // Los botones de solo ícono quedan sin rótulo
  agregar('button, [role="button"], a.dex-btn, a[class*="rounded"]', 'boton', el => el.innerText || '')
  agregar('h1, h2, h3', 'titulo', el => el.innerText)
  // Texto: elementos con texto propio que no están dentro de un control o título ya dibujado
  const conTexto = [...document.querySelectorAll('body *')].filter(
    el =>
      [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1) &&
      !el.closest('button, a, h1, h2, h3, label, select, [role="option"], script, style')
  )
  for (const el of conTexto) {
    if (vistos.has(el) || !visible(el) || !encima(el)) continue
    if (el.closest('.leaflet-container') && !el.closest('.leaflet-popup-content-wrapper')) continue
    vistos.add(el)
    out.push(caja(el, 'texto'))
  }
  const alto = Math.max(document.documentElement.scrollHeight, innerHeight)
  // Las regiones que contienen el mapa no se rellenan, para no taparlo
  const mapa = out.find(c => c.tipo === 'mapa')
  for (const c of out) {
    if (c.tipo !== 'region') continue
    c.contieneMapa = !!mapa && c.x <= mapa.x + 1 && c.y <= mapa.y + 1 && c.x + c.w >= mapa.x + mapa.w - 1 && c.y + c.h >= mapa.y + mapa.h - 1
  }
  return { cajas: out, ancho: innerWidth, alto }
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function svg({ cajas, ancho, alto }, titulo) {
  const ESC = ancho < 800 ? 1 : 0.5
  const cab = 56
  const W = ancho * ESC
  const H = alto * ESC + cab
  const p = []
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif">`)
  p.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`)
  p.push(`<text x="12" y="24" font-size="15" font-weight="bold" fill="#222">${esc(titulo)}</text>`)
  p.push(`<text x="12" y="44" font-size="10" fill="#777">Wireframe generado desde ${esc(BASE)} · ${ancho} px de ancho</text>`)
  p.push(`<g transform="translate(0 ${cab}) scale(${ESC})">`)
  p.push(`<rect x="0" y="0" width="${ancho}" height="${alto}" fill="#fafafa" stroke="#999" stroke-width="2"/>`)
  // El mapa va al fondo; las regiones encima (las que flotan sobre el mapa lo tapan, como en
  // la pantalla real) y luego el contenido
  const orden = ['mapa', 'region', 'imagen', 'texto', 'titulo', 'campo', 'deslizador', 'casilla', 'boton']
  for (const t of orden) {
    for (const c of cajas.filter(b => b.tipo === t)) {
      const { x, y, w, h } = c
      const etq = esc(c.etiqueta)
      switch (t) {
        case 'region':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.contieneMapa ? 'none' : '#fafafa'}" stroke="#9a9a9a" stroke-width="2" stroke-dasharray="8 5" rx="6"/>`)
          break
        case 'mapa':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e6e6e6" stroke="#777" stroke-width="2"/>`)
          p.push(`<path d="M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}" stroke="#cfcfcf" stroke-width="2"/>`)
          p.push(`<text x="${x + w / 2}" y="${y + 48}" font-size="28" fill="#666" text-anchor="middle">${etq}</text>`)
          break
        case 'imagen':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eeeeee" stroke="#aaa" stroke-width="2"/>`)
          p.push(`<path d="M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}" stroke="#c4c4c4" stroke-width="1.5"/>`)
          if (h > 40 && w > 80) p.push(`<text x="${x + 8}" y="${y + 20}" font-size="14" fill="#888">${etq}</text>`)
          break
        case 'texto': {
          const lineas = Math.max(1, Math.min(8, Math.round(h / 22)))
          for (let i = 0; i < lineas; i++) {
            const lw = i === lineas - 1 && lineas > 1 ? w * 0.6 : w
            p.push(`<rect x="${x}" y="${y + 4 + i * (h / lineas)}" width="${lw}" height="${Math.min(8, h / lineas - 3)}" fill="#dddddd" rx="3"/>`)
          }
          break
        }
        case 'titulo':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0" rx="3"/>`)
          p.push(`<text x="${x + 4}" y="${y + h / 2 + 7}" font-size="${Math.min(22, h * 0.7)}" font-weight="bold" fill="#333">${etq}</text>`)
          break
        case 'campo':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" stroke="#666" stroke-width="2" rx="4"/>`)
          p.push(`<text x="${x + 8}" y="${y + h / 2 + 5}" font-size="14" fill="#999">${etq}</text>`)
          break
        case 'deslizador':
          p.push(`<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#666" stroke-width="3"/>`)
          p.push(`<circle cx="${x + w * 0.7}" cy="${y + h / 2}" r="7" fill="#fff" stroke="#444" stroke-width="2"/>`)
          break
        case 'casilla':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#555" stroke-width="2" rx="2"/>`)
          break
        case 'boton':
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" stroke="#333" stroke-width="2" rx="6"/>`)
          if (etq && w > 26) p.push(`<text x="${x + w / 2}" y="${y + h / 2 + 5}" font-size="${Math.min(14, h * 0.55)}" fill="#222" text-anchor="middle">${etq}</text>`)
          break
      }
    }
  }
  // Rótulos de las regiones al final, en la esquina superior derecha, para que no los tape nada
  for (const c of cajas.filter(b => b.tipo === 'region' && b.etiqueta && b.h > 60)) {
    const caben = Math.floor((c.w - 24) / 7.4)
    const texto = c.etiqueta.length > caben ? c.etiqueta.slice(0, Math.max(0, caben - 1)) + '…' : c.etiqueta
    if (caben < 4) continue
    const ancho = texto.length * 7.4 + 12
    const x = Math.max(c.x, c.x + c.w - ancho - 6)
    p.push(`<rect x="${x}" y="${c.y + 4}" width="${ancho}" height="20" fill="#ffffff" fill-opacity="0.9" rx="3"/>`)
    p.push(`<text x="${x + 6}" y="${c.y + 18}" font-size="13" font-style="italic" fill="#7a7a7a">${esc(texto)}</text>`)
  }
  p.push('</g></svg>')
  return p.join('\n')
}

const browser = await chromium.launch({ channel: 'chrome' })
const indice = []
for (const s of PANTALLAS) {
  const ctx = await browser.newContext({ viewport: s.vista, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE + s.ruta, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  if (s.accion === 'ficha') {
    const cajas = await page.locator('.leaflet-overlay-pane path.leaflet-interactive').evaluateAll(els =>
      els.map(e => {
        const b = e.getBoundingClientRect()
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
      })
    )
    const c = cajas.find(b => b.x > 400 && b.x < 1000 && b.y > 150 && b.y < 800)
    await page.mouse.click(c.x, c.y)
    await page.waitForSelector('.ficha-panel.open')
    await page.waitForTimeout(1500)
  }
  const datos = await page.evaluate(medir)
  if (!s.completa) datos.alto = s.vista.height
  datos.cajas = datos.cajas.filter(c => c.y < datos.alto)
  fs.writeFileSync(DIR + s.id + '.svg', svg(datos, s.titulo))
  // PNG del mismo SVG, para insertarlo en documentos
  const png = await browser.newPage({ viewport: { width: Math.ceil(datos.ancho * (datos.ancho < 800 ? 1 : 0.5)), height: 400 }, deviceScaleFactor: 2 })
  await png.setContent(`<body style="margin:0">${svg(datos, s.titulo)}</body>`)
  await png.locator('svg').screenshot({ path: DIR + s.id + '.png' })
  await png.close()
  indice.push(s)
  console.log(`${s.id}  ${datos.cajas.length} elementos`)
  await ctx.close()
}
await browser.close()
console.log(`${indice.length} wireframes en docs/wireframes/`)
