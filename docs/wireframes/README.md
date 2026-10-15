# Wireframes del geovisor

Wireframes de baja fidelidad de todas las pantallas del geovisor, elaborados **a partir de
las pantallas actuales** de https://www.refiup.app. El script `generar.mjs` abre cada pantalla
con Playwright, mide la posición real de sus regiones y controles, y los dibuja como cajas:
así los wireframes coinciden con la interfaz publicada y se pueden regenerar cuando cambie.

| # | Pantalla | Archivos |
|---|---|---|
| 01 | Inicio | [`01-inicio.svg`](01-inicio.svg) · [`.png`](01-inicio.png) |
| 02 | Visor: panel de capas y herramientas | [`02-visor.svg`](02-visor.svg) · [`.png`](02-visor.png) |
| 03 | Visor: ventana emergente y ficha pedagógica | [`03-visor-ficha.svg`](03-visor-ficha.svg) · [`.png`](03-visor-ficha.png) |
| 04 | Visor: recorrido guiado | [`04-visor-recorrido.svg`](04-visor-recorrido.svg) · [`.png`](04-visor-recorrido.png) |
| 05 | Recorridos | [`05-recorridos.svg`](05-recorridos.svg) · [`.png`](05-recorridos.png) |
| 06 | Glosario | [`06-glosario.svg`](06-glosario.svg) · [`.png`](06-glosario.png) |
| 07 | Guía de uso | [`07-guia.svg`](07-guia.svg) · [`.png`](07-guia.png) |
| 08 | Créditos | [`08-creditos.svg`](08-creditos.svg) · [`.png`](08-creditos.png) |
| 09 | Privacidad | [`09-privacidad.svg`](09-privacidad.svg) · [`.png`](09-privacidad.png) |
| 10 | Inicio (móvil, 390 px) | [`10-inicio-movil.svg`](10-inicio-movil.svg) · [`.png`](10-inicio-movil.png) |
| 11 | Visor (móvil, 390 px) | [`11-visor-movil.svg`](11-visor-movil.svg) · [`.png`](11-visor-movil.png) |

Las pantallas de escritorio se miden a 1440 × 900 px. Las páginas de contenido (inicio,
recorridos, glosario, guía, créditos y privacidad) se dibujan completas, con todo su alto; las
del visor, solo en el área visible.

## Convenciones

| Elemento | Dibujo |
|---|---|
| Región (cabecera, panel, tarjeta, diálogo) | Rectángulo punteado con su nombre |
| Mapa | Rectángulo gris con una equis y el rótulo "Mapa (Leaflet)" |
| Imagen o animación | Rectángulo claro con una equis |
| Título | Barra gris con el texto del título |
| Texto | Líneas grises |
| Botón | Rectángulo redondeado con su texto |
| Campo de texto | Rectángulo blanco con el texto de ayuda |
| Deslizador y casilla | Línea con control circular; cuadro pequeño |

## Regenerar

```bash
npm run build && npx vite preview --port 4173      # o BASE=https://www.refiup.app
node docs/wireframes/generar.mjs
```
