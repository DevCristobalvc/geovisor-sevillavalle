# -*- coding: utf-8 -*-
"""Genera las capas GeoJSON del geovisor a partir de los servicios oficiales de la CVC.

Fuente: Corporación Autónoma Regional del Valle del Cauca (CVC), Portal GeoCVC
(ArcGIS Enterprise, https://portal-geo.cvc.gov.co/server/rest/services).

Para cada capa el script:
  1. consulta el FeatureServer con el límite municipal oficial de Sevilla como filtro;
  2. recorta al municipio las geometrías que lo desbordan (cuencas, páramos, áreas protegidas…);
  3. simplifica la geometría (~5 m) y redondea las coordenadas a 5 decimales;
  4. conserva solo atributos públicos y descriptivos: los campos con datos personales
     (nombres de contacto, teléfonos, correos, observadores, propietarios, NIT) se descartan;
  5. escribe un FeatureCollection con un bloque `metadata` que documenta la procedencia.

Las capas de actores sociales de humedales, páramo y bosque seco no tienen registros
oficiales para Sevilla en la CVC; esas tres se mantienen como datos ilustrativos y este
script no las toca.

Requisitos: pip install requests shapely
Uso (desde la raíz del repositorio):  python scripts/datos/build_capas_oficiales.py
"""
import datetime as dt
import hashlib
import json
import math
import os
import sys
import time
from pathlib import Path

import requests
from shapely.geometry import LinearRing, MultiPoint, MultiPolygon, Point, Polygon, mapping
from shapely.ops import unary_union

CVC = "https://portal-geo.cvc.gov.co/server/rest/services"
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "data"
COD_SEVILLA = "76736"
HOY = dt.date.today().isoformat()
FUENTE = "Corporación Autónoma Regional del Valle del Cauca (CVC) — Portal GeoCVC"
SIMPLIFICAR = 0.00005  # grados (~5,5 m)
H = {"User-Agent": "Mozilla/5.0 geovisor-sevillavalle"}
# El portal está detrás de un WAF (FortiWeb) que bloquea la IP durante varios minutos si
# recibe ráfagas: pausa entre peticiones, reintentos espaciados y formato f=json.
PAUSA_S = 3.0
REINTENTOS = 3
# Caché opcional de respuestas para iterar sin repetir peticiones:
#   GEOVISOR_CACHE=ruta/a/carpeta python scripts/datos/build_capas_oficiales.py
CACHE = Path(os.environ["GEOVISOR_CACHE"]) if os.environ.get("GEOVISOR_CACHE") else None

# Latitud media de Sevilla: base de la aproximación de áreas en metros
LAT0 = math.radians(4.16)
M_LON = 111_320 * math.cos(LAT0)
M_LAT = 110_574


def consulta(url, **params):
    params.setdefault("f", "json")
    clave = None
    if CACHE:
        clave = CACHE / (hashlib.sha1(json.dumps([url, params], sort_keys=True).encode()).hexdigest() + ".json")
        if clave.exists():
            return json.loads(clave.read_text(encoding="utf-8"))
    for intento in range(REINTENTOS):
        time.sleep(PAUSA_S * (4**intento))
        try:
            r = requests.post(url, data=params, headers=H, timeout=180)
            r.raise_for_status()
            data = r.json()
        except (requests.RequestException, ValueError) as e:
            print(f"    reintento {intento + 1}/{REINTENTOS} ({e.__class__.__name__})")
            continue
        if "error" in data:
            raise RuntimeError(f"{url}: {data['error']}")
        if clave:
            CACHE.mkdir(parents=True, exist_ok=True)
            clave.write_text(json.dumps(data), encoding="utf-8")
        return data
    raise RuntimeError(f"Sin respuesta de {url} (¿bloqueo temporal del WAF?)")


def area_ha(geom):
    """Área aproximada en hectáreas (proyección equirectangular local; error < 0,5 %)."""
    from shapely.affinity import scale

    return scale(geom, xfact=M_LON, yfact=M_LAT, origin=(0, 0)).area / 10_000


def redondear(obj, nd=5):
    if isinstance(obj, (list, tuple)):
        if obj and isinstance(obj[0], (int, float)):
            return [round(c, nd) for c in obj[:2]]
        return [redondear(o, nd) for o in obj]
    return obj


def fecha(ms):
    if ms in (None, ""):
        return None
    return dt.datetime.fromtimestamp(ms / 1000, tz=dt.timezone.utc).date().isoformat()


def esri_a_shapely(g):
    """Geometría Esri JSON -> shapely. En Esri los anillos exteriores van en sentido
    horario y los huecos en antihorario."""
    if not g:
        return None
    if "x" in g:
        return Point(g["x"], g["y"])
    if "points" in g:
        return MultiPoint(g["points"])
    exteriores, huecos = [], []
    for anillo in g.get("rings", []):
        if len(anillo) >= 4:
            (huecos if LinearRing(anillo).is_ccw else exteriores).append(anillo)
    if not exteriores:  # orientación no estándar: todos los anillos como polígonos
        exteriores, huecos = huecos, []
    poligonos = [(ext, []) for ext in exteriores]
    for h in huecos:
        punto = Polygon(h).representative_point()
        for ext, hs in poligonos:
            if Polygon(ext).contains(punto):
                hs.append(h)
                break
    partes = [Polygon(ext, hs) for ext, hs in poligonos]
    geom = partes[0] if len(partes) == 1 else MultiPolygon(partes)
    return geom.buffer(0)


_INFO = {}


def dominios(servicio, capa):
    """Mapa campo -> {código: nombre} de los dominios codificados (una consulta por servicio)."""
    if servicio not in _INFO:
        _INFO[servicio] = {l["id"]: l for l in consulta(f"{CVC}/{servicio}/FeatureServer/layers")["layers"]}
    out = {}
    for f in _INFO[servicio][capa].get("fields") or []:
        dom = f.get("domain") or {}
        if dom.get("type") == "codedValue":
            out[f["name"]] = {c["code"]: c["name"] for c in dom["codedValues"]}
    return out


def limpiar(v):
    if isinstance(v, str):
        v = " ".join(v.split())
        return v or None
    if isinstance(v, float):
        return round(v, 2)
    return v


# ─── Límite municipal oficial ────────────────────────────────────────────────

def limite_sevilla():
    url = f"{CVC}/Territorial_Administrativa/Division_Politica/FeatureServer/1/query"
    data = consulta(url, where=f"COD_MUNICIPIO='{COD_SEVILLA}'", outFields="*", outSR=4326)
    return esri_a_shapely(data["features"][0]["geometry"])


def features(servicio, capa, limite, where="1=1", espacial=True):
    url = f"{CVC}/{servicio}/FeatureServer/{capa}"
    params = dict(where=where, outFields="*", outSR=4326, returnGeometry="true")
    if espacial:
        filtro = limite.simplify(0.0005)
        esri = {"rings": [list(map(list, filtro.exterior.coords))], "spatialReference": {"wkid": 4326}}
        params.update(
            geometry=json.dumps(esri),
            geometryType="esriGeometryPolygon",
            inSR=4326,
            spatialRel="esriSpatialRelIntersects",
        )
    data = consulta(f"{url}/query", **params)
    doms = dominios(servicio, capa)
    salida = []
    for f in data["features"]:
        props = f["attributes"]
        for campo, tabla in doms.items():
            if props.get(campo) in tabla:
                props[campo] = tabla[props[campo]]
        salida.append({"geometry": esri_a_shapely(f.get("geometry")), "properties": props})
    return salida, url


def escribir(ruta, feats, metadata):
    fc = {"type": "FeatureCollection", "metadata": metadata, "features": feats}
    destino = OUT / ruta
    destino.write_text(json.dumps(fc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    kb = destino.stat().st_size / 1024
    print(f"  {ruta}: {len(feats)} elementos, {kb:.1f} KB")


def construir(ruta, fuentes, campos, limite, recortar=False, area_min_ha=0.0, disolver=None, extra=None):
    """fuentes: lista de (servicio, capa, where, espacial). campos: {nuevo: viejo | callable}."""
    salida, urls = [], []
    for servicio, capa, where, espacial in fuentes:
        feats, url = features(servicio, capa, limite, where, espacial)
        urls.append(url)
        for f in feats:
            geom = f["geometry"]
            if geom is None or geom.is_empty:
                continue
            original = f["properties"]
            if recortar:
                geom = geom.intersection(limite)
                if geom.is_empty or (geom.geom_type in ("Polygon", "MultiPolygon") and area_ha(geom) < area_min_ha):
                    continue
            props = {}
            for nuevo, viejo in campos.items():
                v = viejo(original, geom) if callable(viejo) else original.get(viejo)
                v = limpiar(v)
                if v is not None:
                    props[nuevo] = v
            salida.append((geom, props))

    if disolver:
        grupos = {}
        for geom, props in salida:
            grupos.setdefault(props[disolver], []).append((geom, props))
        salida = []
        for _, items in grupos.items():
            geom = unary_union([g for g, _ in items])
            props = dict(items[0][1])
            if "area_ha" in props:
                props["area_ha"] = round(area_ha(geom), 1)
            salida.append((geom, props))

    feats = []
    for geom, props in salida:
        if geom.geom_type in ("Polygon", "MultiPolygon"):
            geom = geom.simplify(SIMPLIFICAR, preserve_topology=True)
        gj = mapping(geom)
        gj = {"type": gj["type"], "coordinates": redondear(gj["coordinates"])}
        feats.append({"type": "Feature", "properties": props, "geometry": gj})

    metadata = {
        "fuente": FUENTE,
        "servicios": urls,
        "procesamiento": (
            "Filtrado con el límite municipal oficial de Sevilla (CVC)"
            + ("; recortado al municipio" if recortar else "")
            + "; geometría simplificada (~5 m); se omiten atributos con datos personales."
        ),
        "fecha_descarga": HOY,
    }
    if extra:
        metadata.update(extra)
    escribir(ruta, feats, metadata)


# ─── Definición de las 13 capas oficiales ────────────────────────────────────

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    print("Descargando límite municipal…")
    limite = limite_sevilla()
    print(f"  Sevilla: {area_ha(limite) / 100:.1f} km², bbox {tuple(round(c, 3) for c in limite.bounds)}")

    # Nombres de cuencas para decodificar los códigos de otras capas
    cuencas, _ = features("Agua/Cuencas_Hidrograficas", 0, limite, "1=1", False)
    nom_cuenca = {f["properties"]["COD_CUENCA"]: f["properties"]["NOM_CUENCA"] for f in cuencas}

    area_sevilla = lambda p, g: round(area_ha(g), 1)  # noqa: E731

    print("Generando capas…")
    construir(
        "territorio/division_administrativa.json",
        [
            ("Territorial_Administrativa/Division_Politica", 2, f"COD_MUNICIPIO='{COD_SEVILLA}'", False),
            ("Territorial_Administrativa/Division_Politica", 0, f"COD_MUNICIPIO='{COD_SEVILLA}'", False),
        ],
        {
            "nombre": "NOM_DIV_POL",
            "clase": "CLASE_DIV_POL",
            "codigo": "COD_DIV_POL",
            "area_km2": lambda p, g: round(area_ha(g) / 100, 2),
            "norma": "FUENTE",
            "anno_ajuste": "ANNO_AJUSTE",
        },
        limite,
    )
    construir(
        "agua/cuencas.json",
        [("Agua/Cuencas_Hidrograficas", 0, "1=1", True)],
        {
            "nombre": "NOM_CUENCA",
            "subzona_hidrografica": "NOM_SUBZONA_HIDRO",
            "codigo_ideam": "COD_CUENCA_IDEAM",
            "vertiente": "VERTIENTE",
            "area_en_sevilla_ha": area_sevilla,
        },
        limite,
        recortar=True,
        area_min_ha=5,
    )
    construir(
        "agua/humedales.json",
        [("Agua/Humedales", 0, "1=1", True)],
        {
            "nombre": "NOMBRE",
            "categoria": "CATEGORIA",
            "condicion": "CONDICION",
            "origen": "ORIGEN",
            "area_ha": "AREA_HA",
            "anno_levantamiento": "FECHA_LEV",
        },
        limite,
    )
    construir(
        "agua/calidad_agua.json",
        [("Agua/Calidad_de_Agua", 0, "1=1", True)],
        {
            "estacion": "CORRIENTE_ESTACION",
            "corriente": "CORRIENTE",
            "categoria": "CATEGORIA",
            "altitud_msnm": "ALTITUD_MSNM",
            "zona_muestreo": "ZONA_MUESTREO",
        },
        limite,
    )
    construir(
        "agua/monitoreo_subterraneo.json",
        [("Agua/Calidad_de_Agua", 1, "1=1", True)],
        {
            "codigo_pozo": "CODIGO_POZO",
            "estado": "ESTADO_POZO",
            "profundidad_m": "PROFUNDIDAD",
            "actividad_monitoreo": "ACTIVIDAD_MONITOREO",
            "cuenca": "NOM_CUENCA",
            "dar": "NOM_DAR",
        },
        limite,
    )
    construir(
        "agua/predios_art111.json",
        [("Agua/Predios_Art__111_Ley_99_de_1993", 0, "1=1", True)],
        {
            "codigo_predio": "CODIGO_PREDIO",
            "corregimiento": "NOMBRE_CORREGIMIENTO",
            "cuenca": lambda p, g: nom_cuenca.get(p.get("NOMBRE_CUENCA"), p.get("NOMBRE_CUENCA")),
            "area_ha": lambda p, g: round(area_ha(g), 1),
            "ecosistema": "NOMBRE_ECOSISTEMA",
            "zona_vida": "NOMBRE_ZONA_VIDA",
        },
        limite,
    )
    construir(
        "biodiversidad/paramos.json",
        [("Biodiversidad/Paramos", 0, "1=1", True)],
        {
            "complejo": "NOM_COMPLEJO",
            "distrito": "NOM_DISTRITO",
            "resolucion": "RESOLUCION",
            "escala": "ESCALA",
            "area_en_sevilla_ha": area_sevilla,
            "area_total_ha": "AREA_HA",
        },
        limite,
        recortar=True,
        area_min_ha=5,
    )
    construir(
        "biodiversidad/areas_protegidas.json",
        [
            ("Biodiversidad/Sistema_Areas_Protegidas", 2, "1=1", True),
            ("Biodiversidad/Sistema_Areas_Protegidas", 3, "1=1", True),
            ("Biodiversidad/Areas_Reserva_Forestal_Ley_2_de_1959", 1, "1=1", True),
        ],
        {
            "nombre": lambda p, g: p.get("NOM_AREA_P") or p.get("AP_NOMBRE")
            or (f"Reserva Forestal {p['NOM_LEY2']}" if p.get("NOM_LEY2") else None),
            "categoria": lambda p, g: p.get("CAT_AREA_P")
            or ("Reserva Natural de la Sociedad Civil" if p.get("AP_NOMBRE") else None)
            or ("Reserva Forestal Nacional Ley 2.ª de 1959" if p.get("NOM_LEY2") else None),
            "acto_administrativo": lambda p, g: (
                f"{p['TIPO_DOC']} {p['NUM_DOC']}" if p.get("TIPO_DOC") else p.get("RES_ZONI")
            ),
            "fecha_declaracion": lambda p, g: fecha(p.get("FECHA_CREA")) or p.get("FECHA_REGISTRO"),
            "autoridad": lambda p, g: p.get("AUTORIDAD") or p.get("ORGANIZACION")
            or ("Ministerio de Ambiente" if p.get("NOM_LEY2") else None),
            "area_en_sevilla_ha": area_sevilla,
        },
        limite,
        recortar=True,
        area_min_ha=1,
    )
    construir(
        "biodiversidad/especies.json",
        [("Biodiversidad/Registro_Especies", 0, "1=1", True)],
        {
            "nombre_cientifico": "NOMBRE_CIENTIFICO_12",
            "nombre_comun": lambda p, g: (p.get("NOMBRE_COMUN") or "").capitalize() or None,
            "familia": "FAMILIA",
            "clase": "CLASE",
            "localidad": "LOCALIDAD",
            "cuenca": "CUENCA",
            "referencia": "CITACION_BIBLIOGRAFICA",
        },
        limite,
    )
    construir(
        "clima/estaciones_hidroclimatologicas.json",
        [("Cambio_Climatico/Red_Hidroclimatologica", 0, "1=1", True)],
        {
            "nombre": "NOMBRE_ESTACION",
            "codigo": "COD_ESTACION",
            "tipo": "TIPO_ESTACION",
            "entidad": lambda p, g: p.get("ENTIDAD") or "CVC",
            "estado": "ESTADO",
            "elevacion_msnm": "ELEVATION",
            "corregimiento": "CORREGIMIENTO",
            "automatica": "AUTOMATICA",
            "en_operacion_desde": lambda p, g: fecha(p.get("FECHA_INICIO")),
        },
        limite,
    )
    construir(
        "territorio/resguardos.json",
        [("Territorial_Administrativa/Grupos_Etnicos", 1, "1=1", True)],
        {
            "nombre": "NOMBRE",
            "pueblo": lambda p, g: (p.get("PUEBLO") or "").title() or None,
            "acto_administrativo": lambda p, g: f"{(p.get('ULTIMO_TIP') or '').capitalize()} {p.get('ULTIMO_NUM') or ''}".strip(),
            "fecha_acto": lambda p, g: fecha(p.get("ULTIMA_FEC")),
            "area_ha": lambda p, g: round(area_ha(g), 1),
        },
        limite,
        disolver="nombre",
        extra={"fuente_primaria": "Agencia Nacional de Tierras (republicado por la CVC)"},
    )
    construir(
        "territorio/pcc.json",
        [("Territorial_Administrativa/Paisaje_Cultural_Cafetero", 0, "1=1", True)],
        {
            "zona": "ZONA",
            "entidad": "ENT_CREA",
            "documento": "DOCUMENTO",
            "area_en_sevilla_ha": area_sevilla,
        },
        limite,
        recortar=True,
        area_min_ha=5,
    )
    construir(
        "actores/actores_bosque_andino.json",
        [
            ("Actores/Actores_Sociales", capa, "MUNICIPIO='Sevilla'", False)
            for capa in (3, 4, 5)  # Actores sociales, comunidades y producción — bosque andino
        ],
        {
            "nombre": "NOMBRE",
            "categoria": "CATEGORIA",
            "tipologia": "TIPOLOGIA",
            "rol": "ROL",
            "ambito": "AMBITO",
            "cuenca": "CUENCA",
            "municipio": "MUNICIPIO",
        },
        limite,
        extra={"nota": "Se omiten NOMBRE_CONTACTO, DIRECCION, TELÉFONO, CELULAR y EMAIL del servicio original."},
    )


if __name__ == "__main__":
    main()
