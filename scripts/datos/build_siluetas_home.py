# -*- coding: utf-8 -*-
"""Genera las siluetas que dibuja la pantalla del dex en la página de inicio.

Lee las capas GeoJSON oficiales ya recortadas a Sevilla (public/data) y las proyecta a un
marco de 95 × 160 unidades, el mismo de la silueta del municipio:

    x = (lon - minx) · cos(lat0) · S        y = (maxy - lat) · S        S = 160 / (maxy - miny)

donde (minx, miny, maxx, maxy) son los límites del municipio y lat0 su latitud media.
Después simplifica cada geometría en ese marco y escribe src/config/siluetas.ts.

No hace peticiones de red. Requisitos: pip install shapely
Uso (desde la raíz del repositorio):  python scripts/datos/build_siluetas_home.py
"""
import json
import math
from pathlib import Path

from shapely.geometry import LineString, MultiLineString, MultiPolygon, Polygon, shape
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "public" / "data"
OUT = ROOT / "src" / "config" / "siluetas.ts"
ALTO = 160
TOL_SILUETA = 1.1  # unidades del marco (~0,4 km)
TOL_CAPAS = 0.6


def leer(ruta):
    return json.loads((DATA / ruta).read_text(encoding="utf-8"))["features"]


division = leer("territorio/division_administrativa.json")
municipio = unary_union([shape(f["geometry"]) for f in division])
minx, miny, maxx, maxy = municipio.bounds
COS = math.cos(math.radians((miny + maxy) / 2))
S = ALTO / (maxy - miny)


def proyectar(geom):
    return transform(lambda x, y, z=None: ((x - minx) * COS * S, (maxy - y) * S), geom)


def num(v):
    t = f"{v:.1f}"
    return t[:-2] if t.endswith(".0") else t


def anillo(coords, cerrar=True):
    pts = list(coords)
    if cerrar and len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]
    d = "M" + "L".join(f"{num(x)} {num(y)}" for x, y in pts)
    return d + ("Z" if cerrar else "")


def ruta(geom):
    """Convierte (Multi)Polygon o (Multi)LineString a un atributo `d` de SVG."""
    if geom.is_empty:
        return ""
    if isinstance(geom, Polygon):
        return "".join(anillo(r.coords) for r in [geom.exterior, *geom.interiors])
    if isinstance(geom, LineString):
        return anillo(geom.coords, cerrar=False)
    if isinstance(geom, (MultiPolygon, MultiLineString)) or hasattr(geom, "geoms"):
        return "".join(ruta(g) for g in geom.geoms)
    raise TypeError(geom.geom_type)


def sin_astillas(geom, area_min=1.5):
    """Descarta partes y huecos diminutos (astillas entre polígonos vecinos)."""
    partes = geom.geoms if isinstance(geom, MultiPolygon) else [geom]
    limpias = [
        Polygon(p.exterior, [h for h in p.interiors if Polygon(h).area >= area_min])
        for p in partes
        if p.area >= area_min
    ]
    return limpias[0] if len(limpias) == 1 else MultiPolygon(limpias)


def limpiar(geom, tol):
    return sin_astillas(geom).simplify(tol, preserve_topology=True)


mun = sin_astillas(proyectar(municipio), area_min=50)
silueta = mun.simplify(TOL_SILUETA, preserve_topology=True)

# Cabecera municipal: centroide del polígono urbano
cab = next(shape(f["geometry"]) for f in division if f["properties"]["codigo"].endswith("000"))
cab_c = proyectar(cab).centroid
cab_geo = cab.centroid


def dms(v, pos, neg):
    """Grados y minutos, p. ej. 4°16′ N"""
    g = abs(v)
    return f"{int(g)}°{round((g - int(g)) * 60):02d}′ {pos if v >= 0 else neg}"


# Contorno de cada corregimiento y de la cabecera. Los polígonos de la CVC no comparten
# vértices exactos, así que se dibuja cada anillo exterior en vez de sus bordes comunes.
contornos = []
for f in division:
    g = sin_astillas(proyectar(shape(f["geometry"]))).simplify(0.5, preserve_topology=True)
    contornos += [Polygon(p.exterior) for p in getattr(g, "geoms", [g])]
internos = MultiPolygon(contornos)

cuencas = [
    (f["properties"]["nombre"], limpiar(proyectar(shape(f["geometry"])), TOL_CAPAS))
    for f in leer("agua/cuencas.json")
]
paramos = [
    (f["properties"]["complejo"], limpiar(proyectar(shape(f["geometry"])), TOL_CAPAS))
    for f in leer("biodiversidad/paramos.json")
]
pcc = [
    (f["properties"]["zona"], limpiar(proyectar(shape(f["geometry"])), TOL_CAPAS))
    for f in leer("territorio/pcc.json")
]

km = S / 110.574  # unidades del marco por kilómetro (en latitud)


def lista(items, clave):
    # Mismo formato que Prettier, para que regenerar no ensucie el diff
    filas = [f"  {{\n    {clave}: '{n}',\n    d: '{ruta(g)}',\n  }}," for n, g in items]
    return "[\n" + "\n".join(filas) + "\n]"


ts = f"""// Generado por scripts/datos/build_siluetas_home.py. No editar a mano.
// Geometrías oficiales de public/data (CVC) proyectadas al marco {num(mun.bounds[2])} × {ALTO} de la
// pantalla del dex y simplificadas para dibujarse a pocos píxeles.

/** Límite municipal (unión de corregimientos y cabecera) */
export const SILUETA =
  '{ruta(silueta)}'

/** Centroide de la cabecera municipal */
export const CABECERA = {{ x: {num(cab_c.x)}, y: {num(cab_c.y)} }}

/** Coordenadas geográficas del mismo centroide */
export const CABECERA_COORDS = '{dms(cab_geo.y, "N", "S")} · {dms(cab_geo.x, "E", "O")}'

/** Límites internos entre los 16 corregimientos y la cabecera */
export const CORREGIMIENTOS =
  '{ruta(internos)}'

export const CUENCAS: {{ nombre: string; d: string }}[] = {lista(cuencas, "nombre")}

export const PARAMOS: {{ nombre: string; d: string }}[] = {lista(paramos, "nombre")}

export const PCC: {{ zona: string; d: string }}[] = {lista(pcc, "zona")}

/** Unidades del marco por kilómetro, para la barra de escala */
export const UNIDADES_POR_KM = {km:.3f}
"""

OUT.write_text(ts, encoding="utf-8")
print(f"{OUT.relative_to(ROOT)}: {len(ts) / 1024:.1f} KB")
