# Geovisor Ecopedagógico — Sevilla, Valle del Cauca

Aplicación web SPA estática para explorar las transformaciones socioecosistémicas del municipio de Sevilla a través de capas geográficas interactivas, fichas pedagógicas y recorridos guiados.

**Proyecto de Grado — Ingeniería de Sistemas · Universidad Santiago de Cali**  
Cristóbal Valencia Cerón · José David Molina Delgado  
Director: Diego Fernando Loaiza · Grupo INFORMA

---

## Stack Tecnológico

- React 18 + TypeScript 5 + Vite 5
- Leaflet.js 1.9 + React-Leaflet 4
- Tailwind CSS 3
- React Router 6
- Workbox (PWA / offline)
- GitHub Actions → GitHub Pages

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:5173/geovisor-sevillavalle/
```

## Compilar para producción

```bash
npm run build      # genera dist/
npm run preview    # previsualiza el build
```

## Despliegue

El deploy es automático al hacer push a `main` via GitHub Actions → GitHub Pages.

## Estructura

```
public/
  data/          # GeoJSON estáticos por categoría (actores/agua/biodiversidad/clima/suelos/territorio)
  fichas/        # Fichas pedagógicas JSON por capa
  images/        # Thumbnails organizados por categoría
src/
  components/    # MapViewer, LayerPanel, InfoPanel, Navbar, Footer, MapToolbar
  pages/         # Home, Visor, Glosario, Recorridos, Guia
  config/        # layers.config.ts — definición central de todas las capas
  context/       # MapContext — estado global del mapa
  hooks/         # useMapLayers, useMediaQuery, useOffline
  types/         # TypeScript types
```

## Fuentes de datos

| Institución | Tipo | URL |
|-------------|------|-----|
| CVC | WMS | geoservicios.cvc.gov.co |
| IGAC | WMS | geoportal.igac.gov.co |
| IDEAM | WMS | geoserver.ideam.gov.co |
| GBIF / SiB | XYZ/API | api.gbif.org |
| OpenStreetMap | XYZ tiles | tile.openstreetmap.org |
| IAvH | WMS | geoservicios.humboldt.org.co |
