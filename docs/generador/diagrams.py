# -*- coding: utf-8 -*-
"""Fuentes Mermaid de los diagramas de ambos manuales."""
import os

SP = os.path.dirname(os.path.abspath(__file__))
MMD = os.path.join(SP, "mmd")

DIAGRAMS = {}

# ─────────────────────────── MANUAL DE USUARIO ───────────────────────────

DIAGRAMS["mu-01"] = """flowchart LR
    A["Abrir el<br/>Geovisor"] --> B["Elegir una<br/>categoría"]
    B --> C["Activar<br/>una capa"]
    C --> D["Explorar<br/>el mapa"]
    D --> E["Leer la ficha<br/>pedagógica"]
"""

DIAGRAMS["mu-02"] = """flowchart TD
    H["Inicio"] --> V["Visor<br/><small>el mapa interactivo</small>"]
    H --> R["Recorridos<br/><small>rutas temáticas guiadas</small>"]
    H --> G["Glosario<br/><small>términos clave</small>"]
    H --> U["Guía<br/><small>instrucciones de uso</small>"]
    R --> V
    G --> V
"""

DIAGRAMS["mu-03"] = """flowchart LR
    A["Panel izquierdo<br/><small>seis categorías de capas,<br/>opacidad y leyenda</small>"]
    B["Área central<br/><small>el mapa: zoom, paneo<br/>y mapa base</small>"]
    C["Panel derecho<br/><small>ficha pedagógica,<br/>al hacer clic</small>"]
    A --> B --> C
"""

DIAGRAMS["mu-04"] = """flowchart LR
    A["Clic en una categoría<br/><small>por ejemplo, Agua</small>"] --> B["Se despliega<br/>la lista de capas"]
    B --> C["Marcar la casilla<br/>de una capa"]
    C --> D["La capa aparece<br/>con su leyenda"]
    D --> E["Ajustar la opacidad"]
    D --> F["Zoom a la extensión"]
"""

DIAGRAMS["mu-05"] = """flowchart TD
    F["Ficha pedagógica"] --> A["Descripción<br/><small>qué es y dónde está</small>"]
    F --> B["Importancia<br/><small>por qué importa</small>"]
    F --> C["Preguntas<br/><small>de 3 a 5, para reflexionar</small>"]
    F --> D["Vocabulario<br/><small>términos clave</small>"]
    F --> E["Galería y videos<br/><small>material multimedia</small>"]
"""

DIAGRAMS["mu-06"] = """flowchart LR
    A["Elegir un<br/>recorrido"] --> B["Parada 1<br/><small>el mapa vuela al punto</small>"]
    B -->|"Siguiente"| C["Parada 2"]
    C -->|"Siguiente"| D["Parada N"]
    D --> E["Fin del<br/>recorrido"]
    C -.->|"Anterior"| B
"""

DIAGRAMS["mu-07"] = """flowchart TD
    T["Herramientas del Visor"] --> A["Medir<br/><small>distancias en kilómetros<br/>y áreas en hectáreas</small>"]
    T --> B["Exportar PNG<br/><small>guardar el mapa<br/>como imagen</small>"]
    T --> C["Compartir<br/><small>copiar el enlace de<br/>la vista actual</small>"]
    T --> D["Buscar<br/><small>lugares y elementos<br/>de las capas activas</small>"]
"""

DIAGRAMS["mu-08"] = """flowchart LR
    A["Primera visita<br/>con internet"] --> B["El navegador<br/>guarda una copia"]
    B --> C["Mapa base, capas<br/>y fichas disponibles"]
    C --> D["Visitas siguientes<br/>sin conexión"]
    D -.->|"siguen requiriendo internet"| E["Capas WMS<br/>y videos"]
"""

DIAGRAMS["mu-09"] = """flowchart LR
    A["Una capa<br/>no aparece"] --> B{"¿Está marcada<br/>la casilla?"}
    B -->|"No"| C["Marcarla en el<br/>panel izquierdo"]
    B -->|"Sí"| D{"¿Hay conexión<br/>a internet?"}
    D -->|"No"| E["Las capas WMS<br/>requieren internet"]
    D -->|"Sí"| F["Ajustar el zoom:<br/>algunas capas solo se<br/>ven a cierta escala"]
"""

# ───────────────────────── MANUAL TÉCNICO ─────────────────────────

DIAGRAMS["mt-01"] = """flowchart LR
    U["Navegador<br/>del usuario"] --> A["Geovisor<br/><small>SPA React</small>"]
    A -->|"HTTPS"| W["Geoservicios WMS<br/><small>CVC, IGAC, IDEAM</small>"]
    A -->|"HTTPS"| T["Teselas XYZ<br/><small>OSM, ESRI, GBIF</small>"]
    A -->|"archivo estático"| G["GeoJSON y fichas<br/><small>del repositorio</small>"]
"""

DIAGRAMS["mt-02"] = """flowchart LR
    A["Interfaz<br/><small>React 18<br/>TypeScript 5</small>"] --> B["Cartografía<br/><small>Leaflet 1.9<br/>React-Leaflet 4</small>"]
    B --> C["Estado<br/><small>Context API<br/>useReducer</small>"]
    C --> D["Offline<br/><small>Workbox 7<br/>Service Worker</small>"]
    D --> E["Despliegue<br/><small>Vite 5<br/>GitHub Actions</small>"]
"""

DIAGRAMS["mt-03"] = """flowchart LR
    A["7 capas WMS<br/><small>ráster, en vivo</small>"] --> C["layers.config.ts"]
    B["16 capas GeoJSON<br/><small>versionadas en el repositorio</small>"] --> C
    C --> D["23 capas<br/>en 6 categorías"]
"""

DIAGRAMS["mt-04"] = """flowchart TD
    R["geovisor-sevillavalle"] --> P["public/<br/><small>data · fichas · icons</small>"]
    R --> S["src/"]
    S --> C1["components/<br/><small>MapViewer · LayerPanel<br/>InfoPanel · RecorridoHUD</small>"]
    S --> C2["pages/<br/><small>Home · Visor · Recorridos<br/>Glosario · Guía</small>"]
    S --> C3["config/<br/><small>layers.config.ts</small>"]
    S --> C4["context/ · hooks/<br/><small>MapContext · useUrlSync</small>"]
"""

DIAGRAMS["mt-05"] = """flowchart TD
    CTX["MapContext<br/><small>estado global</small>"] --> LP["LayerPanel<br/><small>selector de capas</small>"]
    CTX --> MV["MapViewer<br/><small>render del mapa</small>"]
    CTX --> MT["MapToolbar<br/><small>mapa base y herramientas</small>"]
    MV --> IP["InfoPanel<br/><small>ficha pedagógica</small>"]
    LP --> IP
"""

DIAGRAMS["mt-06"] = """flowchart TD
    A{"Tipo de capa"} -->|"geojson"| B["fetch del archivo<br/>y render vectorial"]
    A -->|"wms"| C["WMSTileLayer<br/>petición al geoservicio"]
    A -->|"xyz"| D["TileLayer<br/>teselas del proveedor"]
    B --> E["Capa visible<br/>en el mapa"]
    C --> E
    D --> E
"""

DIAGRAMS["mt-07"] = """flowchart LR
    A["Un componente<br/>despacha una acción"] --> B["mapReducer<br/><small>seis acciones posibles</small>"]
    B --> C["Nuevo estado<br/><small>inmutable</small>"]
    C --> D["Se re-renderizan<br/>los consumidores"]
    D -.->|"nueva interacción"| A
"""

DIAGRAMS["mt-08"] = """flowchart LR
    A["LayerPanel<br/><small>fuera de MapContainer</small>"] -->|"dispatchEvent"| B["Evento de window<br/><small>zoomToLayer</small>"]
    B --> C["Controlador<br/>dentro del mapa"]
    C -->|"useMap()"| D["Leaflet ejecuta<br/>el desplazamiento"]
"""

DIAGRAMS["mt-09"] = """sequenceDiagram
    participant U as Usuario
    participant P as LayerPanel
    participant C as MapContext
    participant M as MapViewer
    U->>P: Marca una capa
    P->>C: TOGGLE_LAYER
    C-->>M: capasActivas actualizado
    M->>M: fetch del GeoJSON
    M-->>U: Capa visible con leyenda
"""

DIAGRAMS["mt-10"] = """flowchart LR
    A["LayerConfig<br/><small>id · nombre · categoría<br/>tipo · url · fichaId</small>"] -->|"fichaId"| B["FichaPedagogica<br/><small>descripción · importancia<br/>preguntas · vocabulario</small>"]
    C["Recorrido<br/><small>id · título · paradas</small>"] --> D["RecorridoParada<br/><small>título · narración<br/>lat · lng · zoom</small>"]
"""

DIAGRAMS["mt-11"] = """flowchart TD
    SW["Service Worker<br/><small>Workbox</small>"] --> A["Precaché<br/><small>aplicación, GeoJSON y fichas</small>"]
    SW --> B["Cache first<br/><small>teselas OSM, zoom 10 a 14</small>"]
    SW --> C["Network first<br/><small>servicios WMS de la CVC</small>"]
"""

DIAGRAMS["mt-12"] = """flowchart LR
    A["push a la<br/>rama principal"] --> B["GitHub Actions"]
    B --> C["npm ci"]
    C --> D["npm run build"]
    D --> E["Publicación<br/>del sitio"]
"""

if __name__ == "__main__":
    os.makedirs(MMD, exist_ok=True)
    for name, src in DIAGRAMS.items():
        with open(os.path.join(MMD, name + ".mmd"), "w", encoding="utf-8") as f:
            f.write(src)
    print("escritos:", len(DIAGRAMS))
