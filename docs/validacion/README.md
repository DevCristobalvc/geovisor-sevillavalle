# Validación — Fase 3 (octubre y noviembre de 2026)

Evidencia técnica de la validación del geovisor publicado en https://www.refiup.app.

| Evidencia | Archivo | Qué responde |
|---|---|---|
| Auditoría Lighthouse (móvil y escritorio) | [`lighthouse/`](lighthouse/README.md) | Rendimiento, accesibilidad, buenas prácticas y SEO |
| Trazabilidad de los 21 RF | [`trazabilidad-rf.md`](trazabilidad-rf.md) | Qué prueba cubre cada RF, si cumple su criterio y el % de RF que cumplen (Tabla 1 del anteproyecto) |
| Datos crudos de los RF | [`requisitos/resultados.json`](requisitos/resultados.json) | Mediciones de `tests/e2e/requisitos.mjs` |

## Pruebas automatizadas

| Script | Comando | Uso |
|---|---|---|
| `tests/e2e/validar.mjs` | `npm run test:e2e` | Regresión: datos, capas, popups, fichas, leyendas y tema. Debe pasar siempre. |
| `tests/e2e/requisitos.mjs` | `npm run test:rf` | Mide cada RF contra su criterio del SRS y regenera `trazabilidad-rf.md`. |

Ambos aceptan `BASE=https://www.refiup.app` para correr contra producción y `HEADLESS=1`
para no abrir ventana. Usan el Chrome instalado en el equipo (`channel: 'chrome'`).

## Prueba de red antes de las pruebas con usuarios

Las capas WMS de la CVC pasan por un firewall que bloquea la IP unos 40 minutos ante ráfagas
de peticiones. Antes de cada sesión de usabilidad hay que comprobar, **desde la red del lugar
de la prueba**, que las 4 capas WMS de la CVC cargan:

```bash
BASE=https://www.refiup.app npm run test:e2e
```

Deben pasar las validaciones `WMS agua_red_hidrica`, `WMS biodiversidad_ecosistemas`,
`WMS biodiversidad_zonificacion_forestal` y `WMS clima_isoyetas`.

| Fecha | Red | Resultado |
|---|---|---|
| 2026-10-15 | Red del equipo de desarrollo (línea base) | 70/70 validaciones; las 4 WMS de la CVC cargan (8/8 teselas cada una) |
| _pendiente_ | Red del lugar de las pruebas con usuarios | |
