# -*- coding: utf-8 -*-
"""Genera el Manual Tecnico del Geovisor Ecopedagogico en formato .docx (APA 7)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apa import (new_document, add_page_numbers, title_page, abstract, h1, h2,
                 body, bullet, figure, table, reference, para)

SP = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(SP, "img")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SP, "Manual Tecnico.docx")


def img(name):
    return os.path.join(IMG, name + ".png")


doc = new_document()
add_page_numbers(doc)

# ─────────────────────────────── Portada ───────────────────────────────
title_page(
    doc,
    title="Manual Técnico",
    subtitle="Geovisor Ecopedagógico de Sevilla, Valle del Cauca",
    authors="Cristóbal Valencia Cerón y José David Molina Delgado",
    affiliation="Facultad de Ingeniería, Universidad Santiago de Cali",
    program="Programa de Ingeniería de Sistemas",
    course="Trabajo de grado",
    instructor="Director: Diego Fernando Loaiza — Grupo de Investigación INFORMA",
    date="2026",
)

# ─────────────────────────────── Resumen ───────────────────────────────
abstract(
    doc,
    "Este documento describe la arquitectura, los componentes, el modelo de datos y el "
    "flujo de despliegue del Geovisor Ecopedagógico de Sevilla, Valle del Cauca. La "
    "aplicación es una single page application que se ejecuta íntegramente en el "
    "navegador: no dispone de servidor propio, interfaz de programación de aplicaciones "
    "ni base de datos. Consume geoservicios públicos conformes al estándar Web Map "
    "Service y archivos GeoJSON estáticos versionados en el repositorio. La exposición "
    "avanza de lo general a lo particular, apoyada en doce figuras y siete tablas, e "
    "incluye un anexo con los veintiún requisitos funcionales y sus criterios de "
    "aceptación verificables.",
    "arquitectura de software, sistemas de información geográfica, aplicación web "
    "progresiva, WMS, JAMstack",
)

# ─────────────── 1. Visión general de la arquitectura ───────────────
h1(doc, "Visión General de la Arquitectura")
body(doc,
     "El Geovisor es una single page application que se ejecuta al cien por ciento en "
     "el cliente. Todo ocurre en el navegador, que consume geoservicios públicos y "
     "archivos estáticos versionados junto al código. Esta decisión elimina el costo de "
     "operación de un servidor y el riesgo asociado a custodiar datos personales, a "
     "cambio de depender de la disponibilidad de terceros para las capas ráster.")

figure(doc, 1, "Vista de arquitectura de alto nivel",
       img("mt-01"),
       "El navegador es el único entorno de ejecución; los geoservicios y las teselas "
       "son dependencias externas.")

# ─────────────── 2. Stack tecnológico ───────────────
h1(doc, "Stack Tecnológico")

figure(doc, 2, "Capas del stack tecnológico",
       img("mt-02"),
       "Cada capa depende únicamente de la anterior, lo que permite sustituirlas de "
       "forma aislada.")

table(doc, 1, "Componentes del stack y su versión",
      ["Capa", "Tecnología", "Versión"],
      [
          ["Interfaz", "React + TypeScript", "18.x / 5.x"],
          ["Empaquetado", "Vite", "5.x"],
          ["Motor cartográfico", "Leaflet + React-Leaflet", "1.9 / 4.x"],
          ["Estilos", "Tailwind CSS", "3.x"],
          ["Primitivos accesibles", "Radix UI", "1.x"],
          ["Ruteo", "React Router", "6.x"],
          ["Estado", "Context API + useReducer", "—"],
          ["Offline", "vite-plugin-pwa + Workbox", "7.x"],
          ["Geometría", "Turf.js", "7.x"],
          ["Exportación de imagen", "html2canvas", "1.4"],
          ["Calidad", "ESLint + Prettier + Husky", "—"],
          ["Despliegue", "GitHub Actions", "—"],
      ],
      note="El estado no se persiste en almacenamiento local: se serializa en los "
           "parámetros de la dirección web, lo que permite compartir una vista.",
      col_widths=[2.0, 3.1, 1.4])

# ─────────────── 3. Origen y estrategia de datos ───────────────
h1(doc, "Origen y Estrategia de Datos")
body(doc,
     "Las capas se consumen de dos formas según su naturaleza. Los vectores pequeños se "
     "sirven como GeoJSON estático versionado en el repositorio, lo que garantiza su "
     "disponibilidad sin conexión. Las capas ráster —coberturas, clima, conflictos de "
     "uso— se consultan en vivo mediante Web Map Service, porque su tamaño y su "
     "frecuencia de actualización desaconsejan replicarlas.")

figure(doc, 3, "Composición del inventario de capas por tipo de servicio",
       img("mt-03"),
       "Las 23 capas se declaran en un único archivo de configuración, con "
       "independencia de su origen.")

table(doc, 2, "Fuentes de datos e instituciones proveedoras",
      ["Institución", "Tipo", "Contenido"],
      [
          ["CVC — Portal GeoCVC", "WMS", "Cuencas, coberturas, conflictos de uso"],
          ["IGAC", "WMS", "Cartografía base y catastral"],
          ["IDEAM", "WMS", "Isoyetas y estaciones hidroclimatológicas"],
          ["Instituto Humboldt", "WMS", "Delimitación de páramos"],
          ["RUNAP", "WMS", "Áreas protegidas"],
          ["GBIF / SiB Colombia", "XYZ", "Registros de presencia de especies"],
          ["OpenStreetMap", "XYZ", "Mapa base callejero"],
          ["ESRI World Imagery", "XYZ", "Mapa base satelital"],
      ],
      note="Todas las fuentes son de acceso público y conservan sus licencias de "
           "origen.",
      col_widths=[2.2, 0.9, 3.4])

table(doc, 3, "Distribución de las capas por categoría",
      ["Categoría", "Capas", "Tipo de dato"],
      [
          ["Actores sociales", "4", "GeoJSON"],
          ["Agua", "6", "GeoJSON y WMS"],
          ["Biodiversidad", "6", "GeoJSON y WMS"],
          ["Cambio climático", "3", "GeoJSON y WMS"],
          ["Suelos", "1", "WMS"],
          ["Territorio", "3", "GeoJSON y WMS"],
      ],
      note="Total: 23 capas, de las cuales 16 son GeoJSON estático y 7 son WMS.",
      col_widths=[2.4, 1.2, 2.9])

# ─────────────── 4. Estructura del proyecto ───────────────
h1(doc, "Estructura del Proyecto")

figure(doc, 4, "Organización de carpetas y módulos",
       img("mt-04"),
       "La configuración de capas está aislada en un único módulo, de modo que añadir "
       "una capa no requiere modificar ningún componente.")

# ─────────────── 5. Componentes de la interfaz ───────────────
h1(doc, "Componentes de la Interfaz")
body(doc,
     "El estado global reside en MapContext y lo consumen tanto el panel de capas como "
     "el visor del mapa. Los componentes no se comunican entre sí directamente: lo hacen "
     "a través del estado compartido o, cuando eso no es posible, mediante eventos.")

figure(doc, 5, "Componentes React y su relación con el estado global",
       img("mt-05"),
       "InfoPanel se alimenta tanto del clic sobre el mapa como de la selección en el "
       "panel de capas.")

table(doc, 4, "Responsabilidad de los componentes principales",
      ["Componente", "Responsabilidad"],
      [
          ["MapViewer", "Contenedor Leaflet; renderiza GeoJSON, WMS y teselas"],
          ["LayerPanel", "Acordeón de categorías, activación y opacidad de capas"],
          ["InfoPanel", "Panel lateral con la ficha pedagógica"],
          ["MapToolbar", "Mapa base, medición, exportación y búsqueda"],
          ["RecorridoHUD", "Navegación de las paradas de un recorrido"],
          ["FeatureSearchPanel", "Búsqueda por atributos en las capas activas"],
      ],
      col_widths=[1.9, 4.6])

# ─────────────── 6. Flujo de carga de una capa ───────────────
h1(doc, "Flujo de Carga de una Capa")

figure(doc, 6, "Ruta de carga según el tipo de capa",
       img("mt-06"),
       "El tipo declarado en la configuración determina el componente de Leaflet que se "
       "instancia.")

# ─────────────── 7. Gestión de estado ───────────────
h1(doc, "Gestión de Estado")
body(doc,
     "El estado global se maneja con un reducer. Cada interacción despacha una acción, "
     "el reducer produce un estado nuevo e inmutable y los componentes suscritos se "
     "vuelven a renderizar. No se emplea ninguna biblioteca externa de gestión de "
     "estado.")

figure(doc, 7, "Ciclo de actualización del estado global",
       img("mt-07"),
       "El flujo es unidireccional: ninguna vista modifica el estado directamente.")

table(doc, 5, "Acciones del reducer de MapContext",
      ["Acción", "Efecto sobre el estado"],
      [
          ["TOGGLE_LAYER", "Añade o quita una capa del listado de capas activas"],
          ["SET_LAYER_OPACITY", "Fija la opacidad de una capa concreta"],
          ["SET_MAPA_BASE", "Cambia el mapa base entre callejero, satélite y topográfico"],
          ["SET_ZOOM", "Actualiza el nivel de acercamiento"],
          ["SET_CENTER", "Actualiza el punto central del mapa"],
          ["SET_STATE_FROM_URL", "Restaura el estado a partir de la dirección web"],
      ],
      note="El encuadre a la extensión de una capa y la apertura de la ficha no pasan "
           "por el reducer: se resuelven mediante eventos, como se detalla en la "
           "sección siguiente.",
      col_widths=[2.1, 4.4])

# ─────────────── 8. Comunicación entre componentes ───────────────
h1(doc, "Comunicación entre Componentes")
body(doc,
     "Los componentes que viven fuera del árbol del contenedor del mapa —como la barra "
     "de navegación o el panel de capas— no pueden acceder a la instancia de Leaflet "
     "mediante el hook correspondiente. La solución adoptada fue desacoplarlos mediante "
     "eventos personalizados de la ventana, que unos controladores situados dentro del "
     "mapa escuchan y traducen a llamadas de Leaflet.")

figure(doc, 8, "Comunicación entre componentes mediante eventos de la ventana",
       img("mt-08"),
       "Este mecanismo se emplea para el encuadre a una capa y para la apertura de la "
       "ficha pedagógica.")

# ─────────────── 9. Secuencia de activación ───────────────
h1(doc, "Secuencia de Activación de una Capa")

figure(doc, 9, "Secuencia completa de activación de una capa GeoJSON",
       img("mt-09"),
       "El diagrama recoge el recorrido extremo a extremo, desde el clic del usuario "
       "hasta la capa visible.")

# ─────────────── 10. Modelo de datos ───────────────
h1(doc, "Modelo de Datos")
body(doc,
     "El modelo se apoya en dos estructuras centrales: la configuración declarativa de "
     "las capas y la ficha pedagógica, un archivo por capa. Los recorridos guiados "
     "constituyen una tercera estructura independiente.")

figure(doc, 10, "Relación entre configuración de capas, fichas y recorridos",
       img("mt-10"),
       "El campo fichaId enlaza cada capa con su contenido pedagógico.")

# ─────────────── 11. Capa offline ───────────────
h1(doc, "Capa sin Conexión")
body(doc,
     "El Service Worker aplica una estrategia de caché diferenciada según el tipo de "
     "recurso. La aplicación, los archivos GeoJSON y las fichas se precargan en la "
     "instalación. Las teselas del mapa base se sirven primero desde caché. Los "
     "servicios WMS se consultan primero en red y solo recurren a la caché si esta no "
     "responde.")

figure(doc, 11, "Estrategia de caché del Service Worker",
       img("mt-11"),
       "Las teselas precargadas cubren el área del municipio entre los niveles de "
       "acercamiento 10 y 14, aproximadamente 50 MB.")

# ─────────────── 12. Despliegue ───────────────
h1(doc, "Despliegue e Integración Continua")

figure(doc, 12, "Flujo de integración y despliegue continuo",
       img("mt-12"),
       "El proceso es automático: no requiere intervención manual tras la publicación "
       "de cambios.")

# ─────────────── 13. Requisitos no funcionales ───────────────
h1(doc, "Requisitos No Funcionales")

table(doc, 6, "Requisitos no funcionales y su estado",
      ["Atributo", "Objetivo", "Estado"],
      [
          ["Rendimiento", "Bundle JavaScript menor a 500 KB comprimido", "142 KB"],
          ["Rendimiento", "Primer contenido visible en menos de 1,5 s", "Por auditar"],
          ["Datos", "Cada archivo GeoJSON menor a 2 MB", "Cumplido"],
          ["Offline", "Teselas del municipio, niveles 10 a 14", "Cumplido"],
          ["Accesibilidad", "WCAG 2.1 nivel AA, contraste mínimo 4.5:1", "En progreso"],
          ["Seguridad", "Solo HTTPS y sin datos personales", "Cumplido"],
          ["Mantenibilidad", "Capas declaradas en un único archivo", "Cumplido"],
      ],
      note="La cifra de rendimiento corresponde a la medición del build de producción "
           "vigente en la fecha de este documento.",
      col_widths=[1.6, 3.5, 1.4])

# ─────────────── Referencias ───────────────
doc.add_page_break()
h1(doc, "Referencias")
reference(doc,
          "Agafonkin, V. (2024). Leaflet: An open-source JavaScript library for "
          "mobile-friendly interactive maps (Versión 1.9) [Software]. "
          "https://leafletjs.com")
reference(doc,
          "Corporación Autónoma Regional del Valle del Cauca. (2024). Portal GeoCVC. "
          "https://geo.cvc.gov.co/inicio/")
reference(doc,
          "Open Geospatial Consortium. (2010). OpenGIS Web Map Service (WMS) "
          "implementation specification (Versión 1.3.0). "
          "https://www.ogc.org/standards/wms")
reference(doc,
          "Vite Team. (2024). Vite: Next generation frontend tooling (Versión 5) "
          "[Software]. https://vitejs.dev")
reference(doc,
          "World Wide Web Consortium. (2018). Web Content Accessibility Guidelines "
          "(WCAG) 2.1. https://www.w3.org/TR/WCAG21/")

# ─────────────── Anexo A ───────────────
doc.add_page_break()
h1(doc, "Anexo A: Requisitos Funcionales y Criterios de Aceptación")
body(doc,
     "Se listan los veintiún requisitos funcionales agrupados por módulo, con su "
     "prioridad y su criterio de aceptación verificable, según el Documento de "
     "Requerimientos v2.0.")

RF_COLS = [0.7, 1.7, 0.8, 3.3]

h2(doc, "Módulo de visualización")
table(doc, 7, "Requisitos funcionales del módulo de visualización",
      ["ID", "Nombre", "Prior.", "Criterio de aceptación"],
      [
          ["RF-01", "Mapa base interactivo", "Alta",
           "Mapa cargado en menos de 3 s; respuesta al zoom en menos de 100 ms"],
          ["RF-02", "Panel de capas jerárquico", "Alta",
           "Al alternar una capa, aparece o desaparece en menos de 500 ms"],
          ["RF-03", "Control de opacidad", "Media",
           "Ajuste fluido, sin retardo perceptible"],
          ["RF-04", "Leyenda dinámica", "Alta",
           "Leyenda visible con la capa; la imagen WMS carga en menos de 2 s"],
          ["RF-05", "Zoom a extensión de capa", "Media",
           "Desplazamiento animado de 300 ms"],
          ["RF-06", "Selector de mapa base", "Alta",
           "Cambio en menos de 1 s sin reiniciar las capas activas"],
      ],
      col_widths=RF_COLS)

h2(doc, "Módulo de consulta")
table(doc, 8, "Requisitos funcionales del módulo de consulta",
      ["ID", "Nombre", "Prior.", "Criterio de aceptación"],
      [
          ["RF-07", "Consulta de atributos al clic", "Alta",
           "Globo de información en menos de 200 ms para capas GeoJSON"],
          ["RF-08", "Búsqueda de lugares", "Media",
           "Sugerencias en menos de 1 s a partir de 3 caracteres"],
          ["RF-09", "Búsqueda en capas activas", "Media",
           "Resultados en tiempo real; resalta el elemento en el mapa"],
          ["RF-10", "Herramienta de medición", "Media",
           "Cálculo con Turf.js; error máximo del 0,01 % frente a referencia"],
          ["RF-11", "Coordenadas del cursor", "Baja",
           "Actualización continua con precisión de cuatro decimales"],
      ],
      col_widths=RF_COLS)

h2(doc, "Módulo pedagógico")
table(doc, 9, "Requisitos funcionales del módulo pedagógico",
      ["ID", "Nombre", "Prior.", "Criterio de aceptación"],
      [
          ["RF-12", "Fichas pedagógicas", "Alta",
           "Al menos 150 palabras, una imagen y tres preguntas por ficha"],
          ["RF-13", "Contenido multimedia", "Alta",
           "Imágenes con carga diferida; videos sin reproducción automática"],
          ["RF-14", "Modo recorrido guiado", "Media",
           "Avance con Siguiente y Anterior; desplazamiento de 800 ms"],
          ["RF-15", "Línea de tiempo", "Media",
           "Pendiente: no hay series históricas disponibles"],
          ["RF-16", "Glosario territorial", "Baja",
           "Buscable por texto; enlaza con la capa relacionada"],
      ],
      col_widths=RF_COLS)

h2(doc, "Módulos de exportación, accesibilidad y uso sin conexión")
table(doc, 10, "Requisitos funcionales de exportación, accesibilidad y uso sin conexión",
      ["ID", "Nombre", "Prior.", "Criterio de aceptación"],
      [
          ["RF-17", "Exportar vista como imagen", "Media",
           "Descarga en menos de 3 s con resolución mínima de 1920 × 1080 px"],
          ["RF-18", "Compartir dirección de la vista", "Media",
           "Abrir la dirección en otro navegador restaura el mismo estado"],
          ["RF-19", "Modo sin conexión", "Alta",
           "Tras la primera visita se explora sin red; avisa si la WMS no responde"],
          ["RF-20", "Texto alternativo de imágenes", "Alta",
           "Auditoría automatizada sin violaciones de tipo image-alt"],
          ["RF-21", "Navegación por teclado", "Alta",
           "Todos los controles operables con teclado y foco visible"],
      ],
      col_widths=RF_COLS)

doc.save(OUT)
print("Generado:", OUT)
