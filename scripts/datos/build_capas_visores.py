# -*- coding: utf-8 -*-
"""Capas de la CVC que pide el documento "Visores básicos" (tesis colaboradora), recortadas a Sevilla.

Complementa build_capas_oficiales.py con el mismo procesamiento (filtro con el límite municipal
oficial, recorte, simplificación, solo atributos públicos y bloque `metadata`) para las capas que
el documento agrega a los visores del geovisor: áreas de drenaje y subzonas hidrográficas,
fragmentación de ecosistemas, cobertura y uso del suelo 1:100.000, piso térmico 1:100.000,
conflicto de uso del suelo 1:50.000 y límite municipal con perímetro urbano.

El portal de la CVC está detrás de un WAF que rechaza las peticiones de Python, así que este
script **no descarga**: trabaja solo con la caché (GEOVISOR_CACHE). El flujo es:

  1. Anotar lo que falta:   GEOVISOR_CACHE=cache GEOVISOR_REGISTRAR=pendientes.json \\
                              python scripts/datos/build_capas_visores.py
  2. Descargarlo con Chrome: node scripts/datos/descargar_pendientes.mjs cache pendientes.json
  3. Repetir 1 y 2 hasta que no queden pendientes (cada ronda revela las consultas siguientes:
     primero el límite, luego los esquemas de cada servicio, luego los datos).
  4. Construir:             GEOVISOR_CACHE=cache python scripts/datos/build_capas_visores.py

Requisitos: pip install shapely requests
"""
import hashlib
import json
import os
import re
import sys
from pathlib import Path

import build_capas_oficiales as b
from shapely.ops import unary_union

if not b.CACHE:
    sys.exit("Defina GEOVISOR_CACHE: este script solo lee respuestas guardadas (ver docstring).")

REGISTRO = Path(os.environ["GEOVISOR_REGISTRAR"]) if os.environ.get("GEOVISOR_REGISTRAR") else None
pendientes = []


class Pendiente(Exception):
    """La respuesta no está en la caché y quedó anotada para descargarla."""


def consulta(url, **params):
    params.setdefault("f", "json")
    clave = hashlib.sha1(json.dumps([url, params], sort_keys=True).encode()).hexdigest()
    archivo = b.CACHE / f"{clave}.json"
    if archivo.exists():
        data = json.loads(archivo.read_text(encoding="utf-8"))
        if "error" in data:
            raise RuntimeError(f"{url}: {data['error']}")
        return data
    # Sin la respuesta en caché la capa se omite (y, en modo registro, la consulta se anota)
    if REGISTRO is not None and all(p["clave"] != clave for p in pendientes):
        pendientes.append({"clave": clave, "url": url, "params": params})
    raise Pendiente(url)


b.consulta = consulta

# Geometrías de todo el Valle (cobertura, piso térmico, conflicto): el servidor las generaliza
# a ~11 m antes de enviarlas, para que la respuesta no pese decenas de MB.
LIGERO = {"maxAllowableOffset": 0.0001, "geometryPrecision": 6}


def filtro_sevilla(limite):
    filtro = limite.simplify(0.0005)
    esri = {"rings": [list(map(list, filtro.exterior.coords))], "spatialReference": {"wkid": 4326}}
    return dict(
        geometry=json.dumps(esri),
        geometryType="esriGeometryPolygon",
        inSR=4326,
        spatialRel="esriSpatialRelIntersects",
    )


def features_ext(servicio, capa, limite, where="1=1", espacial=True, extra=None, paso=None):
    """Como build_capas_oficiales.features, con parámetros extra y paginación.
    paso: elementos por página cuando el servidor corta la respuesta (por defecto, la mitad
    de la primera página). El corte depende del servicio: unos 170 elementos en el conflicto
    de uso 1:50.000 aunque la geometría se generalice más."""
    url = f"{b.CVC}/{servicio}/FeatureServer/{capa}"
    params = dict(where=where, outFields="*", outSR=4326, returnGeometry="true")
    if espacial:
        params.update(filtro_sevilla(limite))
    params.update(extra or {})
    falta = None
    try:  # el esquema (dominios) y la consulta se anotan en la misma ronda si faltan los dos
        doms = b.dominios(servicio, capa)
    except Pendiente as e:
        falta = e
    data = consulta(f"{url}/query", **params)
    if falta:
        raise falta
    filas = list(data["features"])
    if data.get("exceededTransferLimit"):
        # El servidor cortó la respuesta: se cuenta el total y se piden las demás páginas con
        # resultOffset, de la mitad del tamaño de la primera para no volver a exceder el límite
        conteo = {k: v for k, v in params.items() if k not in ("outFields", "returnGeometry", *(extra or {}))}
        total = consulta(f"{url}/query", **conteo, returnCountOnly="true")["count"]
        paso = paso or max(1, len(filas) // 2)
        faltan = None
        for inicio in range(len(filas), total, paso):
            # Si una página también llega cortada, se pide lo que le faltó a partir de donde quedó
            desde, cuantos = inicio, min(paso, total - inicio)
            while cuantos > 0:
                try:
                    pagina = consulta(f"{url}/query", **params, resultOffset=desde, resultRecordCount=cuantos)
                except Pendiente as e:
                    faltan = e
                    break
                n = len(pagina["features"])
                filas += pagina["features"]
                if n == 0:
                    break
                desde, cuantos = desde + n, cuantos - n
        if faltan:
            raise faltan
        if len(filas) != total:
            raise RuntimeError(f"{url}: se esperaban {total} elementos y llegaron {len(filas)}")
    salida = []
    for f in filas:
        props = f["attributes"]
        for campo, tabla in doms.items():
            if props.get(campo) in tabla:
                props[campo] = tabla[props[campo]]
        salida.append({"geometry": b.esri_a_shapely(f.get("geometry")), "properties": props})
    return salida, url


def construir(ruta, fuente, campos, limite, extra_consulta=None, paso=None, **kw):
    """build_capas_oficiales.construir con una sola fuente y parámetros extra de consulta."""
    original = b.features
    b.features = lambda s, c, l, w, e: features_ext(s, c, l, w, e, extra_consulta, paso)
    try:
        b.construir(ruta, [fuente], campos, limite, **kw)
    finally:
        b.features = original


def capa(nombre, fn):
    try:
        fn()
    except Pendiente as e:
        print(f"  {nombre}: falta {e}")


def sin_codigo(texto):
    """'311 - Bosque natural denso' -> 'Bosque natural denso'; '2.3.1. Pastos limpios' -> 'Pastos limpios'."""
    if not isinstance(texto, str):
        return texto
    return re.sub(r"^\s*[\d.]+\s*(-\s*)?", "", texto).strip() or texto


def anno(ms):
    return int(b.fecha(ms)[:4]) if isinstance(ms, (int, float)) else ms


# Primer nivel de la cobertura Corine (primer dígito del código), con los nombres del documento
TIPO_SUPERFICIE = {
    "1": "Superficies construidas",
    "2": "Superficies plantadas",
    "3": "Superficies naturales y seminaturales",
    "4": "Superficies de agua",
}
PISO = {
    "Calido": "Cálido",
    "Templado": "Templado",
    "Medio": "Medio",
    "Frio": "Frío",
    "Muy Frio": "Muy frío",
    "Extremadamente Frio": "Extremadamente frío",
}


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    try:
        limite = b.limite_sevilla()
    except Pendiente:
        return
    lim = consulta(
        f"{b.CVC}/Territorial_Administrativa/Division_Politica/FeatureServer/1/query",
        where=f"COD_MUNICIPIO='{b.COD_SEVILLA}'",
        outFields="*",
        outSR=4326,
    )["features"][0]["attributes"]
    area = lambda p, g: round(b.area_ha(g), 1)  # noqa: E731
    print(f"Sevilla: {b.area_ha(limite) / 100:.1f} km²")

    # ── Agua ────────────────────────────────────────────────────────────────
    capa("áreas de drenaje", lambda: construir(
        "agua/areas_drenaje.json",
        ("Agua/Cuencas_Hidrograficas", 1, "1=1", True),
        {
            "nombre": "COD_AREA_DRENAJE_IDEAM",  # el dominio trae el nombre del área de drenaje
            "cuenca": "COD_CUENCA",
            "subzona_hidrografica": "SUBZONA_HIDRO",
            "codigo": "COD_AREA_DRENAJE",
            "anno_estudio": "ANNO_ESTUDIO",
            "area_en_sevilla_ha": area,
        },
        limite, recortar=True, area_min_ha=5,
    ))
    capa("subzonas hidrográficas", lambda: construir(
        "agua/subzonas_hidrograficas.json",
        ("Agua/Cuencas_Hidrograficas", 2, "1=1", True),
        {
            "nombre": "NOMBRE_SZH",
            "zona_hidrografica": "ZONA_HIDRO",
            "area_hidrografica": "AREA_HIDRO",
            "area_en_sevilla_ha": area,
        },
        limite, recortar=True, area_min_ha=5,
    ))
    capa("lagunas", lambda: construir(
        "agua/lagunas.json",
        ("Agua/Cuerpos_de_Agua", 0, "TIPO_CUERPO_AGUA='1401010201'", True),
        {
            "nombre": lambda p, g: (p.get("NOM_CUERPO_AGUA") or "").strip() or "Sin nombre en el inventario",
            "tipo": "TIPO_CUERPO_AGUA",
            "estado": "ESTADO_CUERPO_AGUA",
            "anno_levantamiento": lambda p, g: anno(p.get("ANNO_LEVANTAMIENTO")),
            "area_ha": area,
        },
        limite, recortar=True,
    ))

    # ── Biodiversidad ───────────────────────────────────────────────────────
    capa("fragmentación", lambda: construir(
        "biodiversidad/fragmentacion.json",
        ("Biodiversidad/Fragmentacion", 0, "1=1", True),
        {
            "fragmentacion": lambda p, g: sin_codigo(p.get("DESFRAG")),
            "ecosistema": "NOM_ECOSISTEMA",
            "anno_estudio": "ANNO_FRAG_ESTUDIO",
            "area_en_sevilla_ha": area,
        },
        limite, extra_consulta=LIGERO, recortar=True, area_min_ha=1,
    ))
    capa("cobertura 1:100.000", lambda: construir(
        "biodiversidad/cobertura_cvc_100k.json",
        ("Suelo/Cobertura_de_Suelo", 2, "1=1", True),
        {
            "cobertura": lambda p, g: sin_codigo(p.get("COD_COB100")),
            "tipo_superficie": lambda p, g: TIPO_SUPERFICIE.get(str(p.get("COD_COB100") or "")[:1]),
            "anno_estudio": lambda p, g: anno(p.get("ANNO_ESTUDIO")),
            "area_ha": area,
        },
        limite, extra_consulta=LIGERO, paso=650, recortar=True, area_min_ha=1, disolver="cobertura",
    ))

    # ── Cambio climático ────────────────────────────────────────────────────
    capa("piso térmico 1:100.000", lambda: construir(
        "clima/pisos_termicos_cvc.json",
        ("Cambio_Climatico/Temperatura", 0, "1=1", True),
        {
            "piso_termico": lambda p, g: PISO.get(p.get("PISO_TERMICO"), p.get("PISO_TERMICO")),
            "area_ha": area,
        },
        limite, extra_consulta=LIGERO, recortar=True, area_min_ha=1, disolver="piso_termico",
    ))

    # ── Suelos ──────────────────────────────────────────────────────────────
    capa("conflicto de uso 1:50.000", lambda: construir(
        "suelos/conflicto_uso_cvc.json",
        ("Suelo/Conflicto_por_Uso_Suelo", 0, "1=1", True),
        {
            "clase": lambda p, g: f'{p.get("GRADO_CONF")}|{p.get("COD_CORINE")}|{p.get("SUBCLASE_USOP")}',
            "grado_conflicto": "GRADO_CONF",
            "uso_actual": lambda p, g: sin_codigo(p.get("COD_CORINE")),
            "uso_potencial": "SUBCLASE_USOP",
            "anno_estudio": lambda p, g: anno(p.get("ANNO_ESTUDIO")),
            "area_ha": area,
        },
        limite, extra_consulta=LIGERO, paso=190, recortar=True, area_min_ha=0.5, disolver="clase",
    ))

    # ── Territorial administrativo: límite municipal y perímetro urbano (C1) ──
    def _limite():
        cabecera, url_cab = b.features(
            "Territorial_Administrativa/Division_Politica", 0, limite, f"COD_MUNICIPIO='{b.COD_SEVILLA}'", False
        )
        feats = [{
            "type": "Feature",
            "properties": {
                "nombre": "Municipio de Sevilla",
                "clase": "Límite municipal",
                "norma": lim.get("NORMA"),
                "area_km2": round(b.area_ha(limite) / 100, 1),
            },
            # Solo el contorno: se dibuja como línea para no tapar las demás capas
            "geometry": {"type": "LineString", "coordinates": b.redondear(list(limite.simplify(b.SIMPLIFICAR).exterior.coords))},
        }]
        for c in cabecera:
            g = c["geometry"].simplify(b.SIMPLIFICAR, preserve_topology=True)
            gj = b.mapping(g)
            feats.append({
                "type": "Feature",
                "properties": {
                    "nombre": "Cabecera municipal",
                    "clase": "Perímetro urbano",
                    "norma": c["properties"].get("FUENTE"),
                    "area_ha": round(b.area_ha(c["geometry"]), 1),
                },
                "geometry": {"type": gj["type"], "coordinates": b.redondear(gj["coordinates"])},
            })
        b.escribir("territorio/limite_municipal.json", feats, {
            "fuente": b.FUENTE,
            "servicios": [
                f"{b.CVC}/Territorial_Administrativa/Division_Politica/FeatureServer/1",
                url_cab,
            ],
            "procesamiento": "Límite municipal oficial como línea y cabecera municipal como perímetro urbano; geometría simplificada (~5 m).",
            "fecha_descarga": b.HOY,
        })

    capa("límite municipal y perímetro urbano", _limite)


if __name__ == "__main__":
    try:
        main()
    finally:
        if REGISTRO is not None:
            REGISTRO.write_text(json.dumps(pendientes, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"{len(pendientes)} consultas pendientes en {REGISTRO}")
