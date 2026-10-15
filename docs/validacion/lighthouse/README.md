# Auditoría Lighthouse — https://www.refiup.app

**Fecha:** 2026-10-15 (commit `3cab45d`) · **Herramienta:** Lighthouse 12.8.2 con Chrome
estable, perfil limpio y sin extensiones (`--headless=new`).
**Páginas:** inicio (`/`) y visor (`/visor`), cada una en móvil (configuración por defecto:
Moto G Power emulado, red 4G lenta simulada) y escritorio (`--preset=desktop`).

## Puntajes

| Página | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| Inicio | Móvil | 84 | 95 | 100 | 91 |
| Inicio | Escritorio | 95 | 96 | 100 | 91 |
| Visor | Móvil | 71 | 92 | 96 | 92 |
| Visor | Escritorio | 92 | 92 | 100 | 92 |

## Métricas de carga

| Página | Dispositivo | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| Inicio | Móvil | 3,4 s | 3,4 s | 50 ms | 0 | 3,4 s |
| Inicio | Escritorio | 1,1 s | 1,1 s | 0 ms | 0 | 1,3 s |
| Visor | Móvil | 3,4 s | 5,5 s | 120 ms | 0,014 | 3,4 s |
| Visor | Escritorio | 1,1 s | 1,5 s | 0 ms | 0,001 | 1,2 s |

Frente a los requisitos no funcionales del SRS (RNF-01: FCP < 1,5 s y RNF-02: LCP < 2,5 s con
10 Mbps): en escritorio se cumplen en ambas páginas. En móvil no, pero Lighthouse simula una
red de ~1,6 Mbps con 150 ms de latencia y un procesador lento, condición más exigente que la del
SRS. En el visor móvil, el LCP es una tesela del mapa base (OpenStreetMap).

## PWA

Lighthouse eliminó la categoría PWA en la versión 12 (2024), así que ya no da puntaje de PWA.
El funcionamiento sin conexión se verifica con `tests/e2e/requisitos.mjs` (RF-19); ver
[`../trazabilidad-rf.md`](../trazabilidad-rf.md).

## Hallazgos para corregir

| Auditoría | Página | Detalle |
|---|---|---|
| `color-contrast` | Inicio | Un texto de 9 pt en `#cfd9c3` sobre `#2f6b1f` tiene contraste 4,42:1 (mínimo 4,5:1). |
| `label-content-name-mismatch` | Inicio y visor | El `aria-label` no contiene el texto visible: logo ("EcoDex Sevilla, inicio"), "Exportar PNG" y "Ver municipio". |
| `aria-hidden-focus` | Visor | El panel de ficha cerrado (`aria-hidden="true"`) conserva elementos que reciben foco. |
| `aria-prohibited-attr` | Visor | `aria-label` en el `div` de coordenadas del cursor, que no tiene `role`. |
| `robots-txt` | Ambas | No hay `robots.txt`: Vercel responde con `index.html`. |
| `image-size-responsive` | Visor móvil | Las teselas OSM son de 256 px y no tienen versión de alta densidad. Es esperado. |

## Archivos

Por cada página y dispositivo (`inicio-movil`, `inicio-escritorio`, `visor-movil`,
`visor-escritorio`):

- `*.report.html`: informe completo; se abre en cualquier navegador y trae embebidos los datos
  crudos (el JSON se omite para no duplicar ~3 MB).
- `*.puntajes.png`: captura de los cuatro puntajes.
- `*.captura.jpg`: captura final de la página tomada por Lighthouse.

## Cómo repetir

```bash
npm i -g lighthouse@12.8.2
lighthouse https://www.refiup.app/ --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output=json --output-path=./inicio-movil --chrome-flags="--headless=new"
lighthouse https://www.refiup.app/ --preset=desktop ... --output-path=./inicio-escritorio
```
