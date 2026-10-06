# -*- coding: utf-8 -*-
"""Construye la Presentacion 1 sobre la plantilla oficial USC (.pptx).

Toma la plantilla, conserva la portada y la diapositiva de cierre (que llevan el
fondo institucional), elimina las diapositivas de ejemplo y genera las de contenido
sobre el layout "Titulo y objetos" (cabecera USC, sello y esquina dorada).

Requisitos: pip install python-pptx qrcode pillow
Uso:  python build_presentacion_usc.py PLANTILLA.pptx "SALIDA.pptx"
"""
import copy
import os
import sys
import tempfile

import qrcode
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

TEMPLATE = sys.argv[1]
OUT = sys.argv[2]

URL = "https://www.refiup.app"
URL_SHORT = "www.refiup.app"

NAVY = RGBColor(0x00, 0x20, 0x60)       # azul institucional de la plantilla
GOLD = RGBColor(0xC9, 0xA2, 0x27)
INK = RGBColor(0x26, 0x2B, 0x33)
GRAY = RGBColor(0x5F, 0x6B, 0x7A)
CARD = RGBColor(0xF1, 0xF4, 0xF9)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

# Area util bajo la cabecera y libre del sello (arriba-derecha) y la esquina dorada
LEFT, TOP, WIDTH = 0.7, 1.55, 7.9

# ─────────────────────────────── Utilidades ───────────────────────────────
def qr_png():
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=1,
                      box_size=10)
    q.add_data(URL)
    q.make(fit=True)
    img = q.make_image(fill_color="#002060", back_color="white").convert("RGB")
    path = os.path.join(tempfile.gettempdir(), "refiup_qr.png")
    img.save(path)
    return path


QR_PNG = qr_png()


def _set_bullet(paragraph, char="•"):
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set("marL", str(Inches(0.25)))
    pPr.set("indent", str(-Inches(0.25)))
    for tag in ("a:buNone", "a:buChar", "a:buAutoNum"):
        for el in pPr.findall(qn(tag)):
            pPr.remove(el)
    bu = pPr.makeelement(qn("a:buChar"), {"char": char})
    pPr.append(bu)


def _set_numbered(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set("marL", str(Inches(0.35)))
    pPr.set("indent", str(-Inches(0.35)))
    bu = pPr.makeelement(qn("a:buAutoNum"), {"type": "arabicPeriod"})
    pPr.append(bu)


def _runs(paragraph, content, size, color=INK, bold=None, italic=None, font="Calibri"):
    """content: str o lista de (texto, bold) para negritas parciales."""
    if isinstance(content, str):
        content = [(content, bold)]
    for text, b in content:
        r = paragraph.add_run()
        r.text = text
        r.font.name = font
        r.font.size = Pt(size)
        r.font.color.rgb = color
        if b is not None:
            r.font.bold = b
        if italic is not None:
            r.font.italic = italic


def textbox(slide, x, y, w, h, paragraphs, size=16, color=INK, align=PP_ALIGN.LEFT,
            anchor=MSO_ANCHOR.TOP, space_after=6, line_spacing=1.05):
    """paragraphs: lista de dicts {text|runs, bullet, numbered, bold, italic, size,
    color, align, space_after}."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    tf.margin_top = tf.margin_bottom = Inches(0.03)
    first = True
    for p in paragraphs:
        if isinstance(p, str):
            p = {"text": p}
        para = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        para.alignment = p.get("align", align)
        para.space_after = Pt(p.get("space_after", space_after))
        para.line_spacing = line_spacing
        if p.get("bullet"):
            _set_bullet(para)
        if p.get("numbered"):
            _set_numbered(para)
        _runs(para, p.get("runs", p.get("text", "")), p.get("size", size),
              p.get("color", color), p.get("bold"), p.get("italic"))
    return tb


def title(slide, text, size=30):
    textbox(slide, 1.0, 0.62, 7.4, 0.85, [{"text": text, "bold": True}], size=size,
            color=NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def card(slide, x, y, w, h, heading, body, size=12, heading_size=14):
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w),
                                 Inches(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = CARD
    shp.line.fill.background()
    shp.shadow.inherit = False
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w),
                                 Inches(0.06))
    bar.fill.solid()
    bar.fill.fore_color.rgb = GOLD
    bar.line.fill.background()
    bar.shadow.inherit = False
    textbox(slide, x + 0.08, y + 0.14, w - 0.16, h - 0.2,
            [{"text": heading, "bold": True, "size": heading_size, "color": NAVY,
              "space_after": 4}] + (body if isinstance(body, list) else [{"text": body}]),
            size=size, space_after=4)


def qr_box(slide, x, y, size, label=URL_SHORT, sub="Scan to open the Geovisor",
           dark=False):
    pad = 0.12
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x - pad),
                                 Inches(y - pad), Inches(size + 2 * pad),
                                 Inches(size + 2 * pad + 0.5))
    box.adjustments[0] = 0.06
    box.fill.solid()
    box.fill.fore_color.rgb = WHITE
    box.line.color.rgb = GOLD if dark else RGBColor(0xD9, 0xDE, 0xE3)
    box.line.width = Pt(1)
    box.shadow.inherit = False
    slide.shapes.add_picture(QR_PNG, Inches(x), Inches(y), Inches(size), Inches(size))
    textbox(slide, x - pad, y + size + 0.02, size + 2 * pad, 0.48,
            [{"text": label, "bold": True, "size": 11, "color": NAVY, "space_after": 0},
             {"text": sub, "size": 8, "color": GRAY, "space_after": 0}],
            align=PP_ALIGN.CENTER)


def new_slide(prs):
    return prs.slides.add_slide(prs.slide_layouts[1])   # "Titulo y objetos"


def move_slide(prs, old_index, new_index):
    lst = prs.slides._sldIdLst
    el = list(lst)[old_index]
    lst.remove(el)
    lst.insert(new_index, el)


def delete_slides(prs, indices):
    lst = prs.slides._sldIdLst
    for el in [list(lst)[i] for i in sorted(indices, reverse=True)]:
        prs.part.drop_rel(el.rId)
        lst.remove(el)


# ═══════════════════════════════ Construccion ═══════════════════════════════
prs = Presentation(TEMPLATE)

# ── Portada: se edita el cuadro de texto existente conservando su formato ──
cover = prs.slides[0]
box = next(sh for sh in cover.shapes if sh.has_text_frame)
tf = box.text_frame
lines = {
    0: ("Development of an Ecopedagogical Web Geovisor for Sevilla, Valle del Cauca", 26),
    1: ("", 8),
    2: ("September 17, 2026", 18),
    3: ("", 8),
    4: ("", 8),
    5: ("Cristóbal Valencia Cerón  ·  José David Molina Delgado", 15),
    6: ("Advisors: Diego Fernando Loaiza  ·  Silvia Andrea Quijano Pérez", 15),
    7: ("Modality: Research thesis  ·  Group COMBA I+D", 15),
    8: ("Academic program: Systems Engineering", 15),
}
paras = tf.paragraphs
# La plantilla trae 9 parrafos; si hubiera menos se clonan del primero
while len(tf.paragraphs) < len(lines):
    tf._txBody.append(copy.deepcopy(paras[0]._p))
for i, para in enumerate(tf.paragraphs):
    text, size = lines.get(i, ("", 12))
    if not para.runs:
        _runs(para, "", size)
    para.runs[0].text = text
    for r in para.runs[1:]:
        r._r.getparent().remove(r._r)
    para.runs[0].font.size = Pt(size)
    para.runs[0].font.bold = i in (0, 2)
    para.space_after = Pt(2)
box.top = Inches(2.15)
box.height = Inches(4.5)
qr_box(cover, 8.45, 0.3, 1.05, dark=True, sub="Scan to open")

# ── Se eliminan las diapositivas de ejemplo (2..10); queda portada + cierre ──
delete_slides(prs, range(1, 10))
# La de cierre conserva el nombre interno slide11.xml; se renombra para que las
# nuevas diapositivas (slide2..slideN) no choquen con ella al guardar.
from pptx.opc.packuri import PackURI
prs.slides[1].part.partname = PackURI("/ppt/slides/slide99.xml")

# ─────────────────────────── 2. Introduction ───────────────────────────
s = new_slide(prs)
title(s, "Introduction (context)")
textbox(s, LEFT, TOP, 4.9, 4.7, [
    {"bullet": True, "runs": [("Sevilla", True), (", northern Valle del Cauca: coffee "
     "vocation and rich biocultural heritage, part of the UNESCO ", None),
     ("Coffee Cultural Landscape", True), (" (2011).", None)]},
    {"bullet": True, "runs": [("Recent ", None), ("socio-ecosystem transformations",
     True), (" — land-use change, the coffee crisis and climate change — have "
     "disconnected local communities from their territory.", None)]},
    {"bullet": True, "runs": [("Territorial education", True), (" is a key strategy "
     "to strengthen environmental awareness and local identity.", None)]},
    {"bullet": True, "runs": [("Proposal: a ", None), ("web Geovisor with an "
     "ecopedagogical approach", True), (" — interactive cartography, official "
     "geospatial data and multimedia pedagogical content for secondary-school "
     "students.", None)]},
], size=15, space_after=10)
card(s, 5.85, TOP + 0.05, 2.75, 3.6, "Articulation", [
    {"runs": [("Developed alongside the thesis ", None), ("Cartografiar las huellas "
     "del café", None), (" (J. Rodríguez Camacho), which builds the pedagogical "
     "content.", None)], "space_after": 6},
    {"text": "This project: the web platform — user interfaces, geospatial data "
     "model and technical specification.", "space_after": 6},
    {"runs": [("Technical reference: ", None), ("GeoCVC portal", True),
              (" (geo.cvc.gov.co), CVC.", None)]},
], size=11)

# ─────────────────────────── 3. Problem ───────────────────────────
s = new_slide(prs)
title(s, "Problem statement")
cards = [
    ("No integrated tool", "Sevilla has no digital tool that displays, in an "
     "integrated and pedagogical way, its socio-ecosystem transformations: social "
     "actors, water, biodiversity and land use."),
    ("Classroom technology gap", "Secondary-school teachers lack interactive tools "
     "to contextualise curricular content with the local geographic and "
     "socio-environmental reality."),
    ("Dispersed official data", "Geospatial information from IGAC, CVC, IDEAM and "
     "DANE is scattered across platforms and technical formats not accessible to "
     "non-specialists."),
    ("Ecopedagogical demand", "Ecological awareness requires didactic strategies "
     "linking territorial experience with critical and systemic thinking "
     "(Zimmermann, 2005)."),
]
cw, chh, g = 3.85, 1.75, 0.2
for i, (h, b) in enumerate(cards):
    card(s, LEFT + (i % 2) * (cw + g), TOP + (i // 2) * (chh + g), cw, chh, h, b,
         size=12.5, heading_size=14)
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(LEFT), Inches(TOP + 2 * chh + 2 * g),
                         Inches(WIDTH), Inches(0.62))
bar.fill.solid()
bar.fill.fore_color.rgb = NAVY
bar.line.fill.background()
bar.shadow.inherit = False
textbox(s, LEFT, TOP + 2 * chh + 2 * g, WIDTH, 0.62,
        [{"runs": [("Core problem: ", True), ("no tool integrates cartography, "
          "multimedia and pedagogy for the specific context of Sevilla.", None)],
          "space_after": 0}], size=13, color=WHITE, align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE)

# ─────────────────────────── 4. Research question ───────────────────────────
s = new_slide(prs)
title(s, "Research question")
textbox(s, LEFT, 1.9, 1.0, 1.6, [{"text": "?", "bold": True, "size": 96, "color": GOLD,
                                 "space_after": 0}], align=PP_ALIGN.CENTER)
textbox(s, LEFT + 1.1, 1.9, WIDTH - 1.1, 3.6, [
    {"runs": [("What are the ", None), ("technical, architectural and user-experience "
     "requirements", True), (" that an ecopedagogical web Geovisor must meet in order "
     "to promote the critical recognition of socio-ecosystem transformations in "
     "Sevilla, Valle del Cauca?", None)]},
], size=22, color=NAVY, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.15)

# ─────────────────────────── 5. Justification ───────────────────────────
s = new_slide(prs)
title(s, "Justification")
cols = [
    ("Technological", [
        {"text": "Web GIS have democratised digital cartography (e.g. GeoCVC), but "
         "they lack a pedagogical focus and are not adapted to secondary-school users.",
         "space_after": 6},
        {"runs": [("A system on ", None), ("OGC standards (WMS)", True), (", static "
         "GeoJSON and ", None), ("React, TypeScript, Leaflet", True), (" is a "
         "concrete contribution to educational GIS.", None)]}]),
    ("Educational", [
        {"text": "Ecopedagogy goes beyond conventional environmental education "
         "towards a real transformation of attitudes to the territory.",
         "space_after": 6},
        {"runs": [("Pedagogical sheets, multimedia and guided tours", True),
                  (" aligned with MEN guidelines for Natural Sciences and "
                   "Environmental Education.", None)]}]),
    ("Territorial", [
        {"text": "Sevilla faces urgent transformations: cattle expansion into "
         "páramos, land-use conflicts, watershed degradation and loss of coffee "
         "identity.", "space_after": 6},
        {"runs": [("Geographic layers linked to pedagogical narratives", True),
                  (" strengthen social fabric and local environmental awareness.",
                   None)]}]),
]
cw, g = 2.5, 0.2
for i, (h, b) in enumerate(cols):
    card(s, LEFT + i * (cw + g), TOP, cw, 3.55, h, b, size=12.5)
textbox(s, LEFT, TOP + 3.75, WIDTH, 0.5, [
    {"text": "Academic relevance: a design methodology for ecopedagogical WebGIS, "
     "replicable in other municipalities of Valle del Cauca and Colombia.",
     "italic": True, "space_after": 0}], size=11.5, color=GRAY)

# ─────────────────────────── 6. Theoretical framework ───────────────────────────
s = new_slide(prs)
title(s, "Theoretical framework")
blocks = [
    ("Ecopedagogy & territorial education", [
        {"runs": [("Zimmermann (2005), ", None), ("Ecopedagogía: el planeta en "
         "emergencia", None), (". Ecological awareness expressed in everyday "
         "behaviour. Drives design: layers as territorial narrative, ", None),
         ("pedagogical progressivity", True), (" in the UI, and critical-reflection "
         "modules tied to the map.", None)]}]),
    ("WebGIS", [
        {"runs": [("Visualise, query and analyse geospatial data from a browser "
         "(Esri España, 2018). Interoperability via ", None), ("OGC WMS 1.3.0", True),
         (" (OGC, 2010). Foundations: Maguire et al. (1991); open-source GIS: "
         "Steiniger & Hunter (2013).", None)]}]),
    ("Territory & socio-ecosystems in Sevilla", [
        {"runs": [("UNESCO Coffee Cultural Landscape (2011). Páramo Chilí-Barragán, "
         "PNN Las Hermosas (65.58 ha), Andean forest, wetlands and tropical dry "
         "forest — only ", None), ("1.7 %", True), (" of its original cover survives "
         "in Valle del Cauca (INCIVA, 2023). Bugalagrande and La Vieja rivers.",
         None)]}]),
    ("Legal framework", [
        {"runs": [("Law 99/1993", True), (" (SINA) · ", None), ("Law 115/1994", True),
         (" (General Education Law) · ", None), ("Law 1523/2012", True),
         (" (disaster risk) · ", None), ("Law 1581/2012", True), (" (personal "
         "data) · ICDE and IGAC guidelines for official geospatial data.", None)]}]),
]
cw, chh, g = 3.85, 2.15, 0.2
for i, (h, b) in enumerate(blocks):
    card(s, LEFT + (i % 2) * (cw + g), TOP + (i // 2) * (chh + g), cw, chh, h, b,
         size=12, heading_size=13.5)

# ─────────────────────────── 7. State of the art ───────────────────────────
s = new_slide(prs)
title(s, "State of the art")
rows = [
    ("Platform / work", "Scope", "Official data", "Pedagogical\nfocus"),
    ("GeoCVC portal (CVC, 2024)", "Regional environmental geoportal", "Yes — WMS/WFS",
     "No"),
    ("IGAC geoservices (IGAC, 2024)", "National base & cadastral cartography",
     "Yes — WMS", "No"),
    ("OpenStreetMap (Haklay & Weber, 2008)", "Collaborative street maps", "Community",
     "No"),
    ("FOSS GIS ecosystem (Steiniger & Hunter, 2013)",
     "Open-source tools: Leaflet, PostGIS…", "Tooling", "No"),
    ("Ecopedagogical Geovisor of Sevilla (this project)",
     "Municipal WebGIS: sheets, glossary, guided tours",
     "Yes — CVC, IGAC, IDEAM, Humboldt, RUNAP", "Yes"),
]
tbl = s.shapes.add_table(len(rows), 4, Inches(LEFT), Inches(TOP), Inches(WIDTH),
                         Inches(3.3)).table
for j, w in enumerate((2.6, 2.5, 1.9, 0.9)):
    tbl.columns[j].width = Inches(w)
for i, row in enumerate(rows):
    for j, val in enumerate(row):
        cell = tbl.cell(i, j)
        cell.text = ""
        cell.margin_left = cell.margin_right = Inches(0.06)
        cell.margin_top = cell.margin_bottom = Inches(0.03)
        p = cell.text_frame.paragraphs[0]
        last = i == len(rows) - 1
        _runs(p, val, 10.5 if i else 11, WHITE if i == 0 else INK,
              bold=(i == 0 or last))
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY if i == 0 else (
            RGBColor(0xE8, 0xEE, 0xF8) if last else (WHITE if i % 2 else CARD))
textbox(s, LEFT, TOP + 3.45, WIDTH, 1.0, [
    {"runs": [("Gap identified: ", True), ("no existing WebGIS for Sevilla combines "
     "official geospatial layers, ecopedagogical sheets and guided tours designed "
     "for secondary-school students. Existing portals serve technical users.",
     None)], "space_after": 0}], size=11.5, color=GRAY)

# ─────────────────────────── 8. General objective ───────────────────────────
s = new_slide(prs)
title(s, "General objective")
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(LEFT), Inches(2.1), Inches(0.08),
                         Inches(2.6))
bar.fill.solid()
bar.fill.fore_color.rgb = GOLD
bar.line.fill.background()
bar.shadow.inherit = False
textbox(s, LEFT + 0.35, 2.0, WIDTH - 0.35, 2.8, [
    {"runs": [("To ", None), ("develop a web Geovisor with an ecopedagogical approach",
     True), (" that promotes the critical recognition of socio-ecosystem "
     "transformations in Sevilla (Valle del Cauca), contributing to the "
     "strengthening of ", None), ("territorial awareness", True), (" and the ", None),
     ("re-signification of biocultural heritage", True), (".", None)]},
], size=21, color=NAVY, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.15)

# ─────────────────────────── 9. Specific objectives ───────────────────────────
s = new_slide(prs)
title(s, "Specific objectives")
objs = [
    ("Architecture and data model", "Specify the software architecture of the "
     "Geovisor (React/TypeScript, Leaflet.js, WMS services, static GeoJSON) and the "
     "geospatial data model for its six thematic categories."),
    ("Interfaces and requirements", "Define the functional and non-functional "
     "requirements and design the user interfaces (wireframes and prototypes) with "
     "usability, accessibility and ecopedagogical coherence."),
    ("Data integration", "Integrate official geospatial sources (CVC, IGAC, IDEAM, "
     "Humboldt Institute, RUNAP) through public WMS services and GeoJSON files."),
]
textbox(s, LEFT, TOP + 0.3, WIDTH, 4.5, [
    {"numbered": True, "runs": [(h + " — ", True), (b, None)], "space_after": 16}
    for h, b in objs], size=15)

# ─────────────────────────── 10. Methodology ───────────────────────────
s = new_slide(prs)
title(s, "Methodology")
phases = [
    ("01", "Literature review & requirements", "WebGIS, ecopedagogy and territorial "
     "information systems. Official geospatial sources for Sevilla. Functional and "
     "non-functional requirements."),
    ("02", "System design", "Software architecture and stack. Geospatial data model "
     "with six thematic categories. Wireframes of the main screens."),
    ("03", "Implementation & testing", "Static web application integrating official "
     "layers. Usability testing with secondary-school students."),
    ("04", "Documentation & closure", "Technical documentation (user and technical "
     "manuals) and the final thesis document."),
]
cw, g = 1.85, 0.17
for i, (num, h, b) in enumerate(phases):
    x = LEFT + i * (cw + g)
    textbox(s, x, TOP, cw, 0.7, [{"text": num, "bold": True, "size": 30, "color": GOLD,
                                  "space_after": 0}])
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(TOP + 0.72),
                            Inches(cw - 0.1), Inches(0.02))
    ln.fill.solid()
    ln.fill.fore_color.rgb = NAVY
    ln.line.fill.background()
    ln.shadow.inherit = False
    textbox(s, x, TOP + 0.8, cw, 3.0, [
        {"text": h, "bold": True, "size": 12.5, "color": NAVY, "space_after": 5},
        {"text": b, "size": 10.5}])
textbox(s, LEFT, TOP + 3.7, WIDTH, 0.9, [
    {"runs": [("Instruments: ", True), ("requirements matrices, architecture diagrams, "
     "wireframes, usability-test records.  ", None), ("Indicators: ", True),
     ("documented architecture; data model with six categories; functional prototype "
      "deployed; validated requirements specification.", None)], "space_after": 0}],
    size=10.5, color=GRAY)

# ─────────────────────────── 11. Current progress ───────────────────────────
s = new_slide(prs)
title(s, "Current progress — the Geovisor today")
stats = [("23", "thematic layers"), ("6", "categories"), ("23", "pedagogical sheets"),
         ("4", "guided tours"), ("5", "WMS providers")]
for i, (num, lab) in enumerate(stats):
    textbox(s, LEFT + i * 1.2, TOP - 0.05, 1.2, 0.95, [
        {"text": num, "bold": True, "size": 30, "color": NAVY, "space_after": 0},
        {"text": lab, "size": 9.5, "color": GRAY, "space_after": 0}])
ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(LEFT), Inches(TOP + 1.0),
                        Inches(5.9), Inches(0.015))
ln.fill.solid()
ln.fill.fore_color.rgb = GOLD
ln.line.fill.background()
ln.shadow.inherit = False
textbox(s, LEFT, TOP + 1.15, 5.9, 3.4, [
    {"bullet": True, "runs": [("Single-page application", True), (" in the browser: "
     "React 18, TypeScript, Vite, Tailwind, Leaflet — no server, no database, no "
     "personal data.", None)]},
    {"bullet": True, "runs": [("Layers from ", None), ("CVC, IGAC, IDEAM, Humboldt, "
     "RUNAP", True), (" via OGC WMS, plus versioned GeoJSON.", None)]},
    {"bullet": True, "runs": [("Progressive Web App", True), (": works offline after "
     "the first visit — for rural classrooms.", None)]},
    {"bullet": True, "text": "Pedagogical sheets with reflection questions, glossary, "
     "measurement tools, image export and shareable links."},
    {"bullet": True, "runs": [("Deployed at ", None), (URL_SHORT, True),
                              (" with continuous deployment.", None)]},
], size=12.5, space_after=7)
qr_box(s, 6.95, TOP + 1.25, 1.55)

# ─────────────────────────── 12. References ───────────────────────────
s = new_slide(prs)
title(s, "References (APA 7)")
refs = [
    [("Congreso de Colombia. (1993). ", None), ("Ley 99 de 1993", True),
     (", Sistema Nacional Ambiental (SINA). Diario Oficial No. 41.146.", None)],
    [("Congreso de Colombia. (1994). ", None), ("Ley 115 de 1994, Ley General de "
     "Educación", True), (". Diario Oficial No. 41.214.", None)],
    [("Congreso de Colombia. (2012a). ", None), ("Ley 1523 de 2012", True),
     (", gestión del riesgo de desastres. Diario Oficial No. 48.411.", None)],
    [("Congreso de Colombia. (2012b). ", None), ("Ley 1581 de 2012", True),
     (", protección de datos personales. Diario Oficial No. 48.587.", None)],
    [("Corporación Autónoma Regional del Valle del Cauca. (2024). ", None),
     ("Portal GeoCVC", True), (". https://geo.cvc.gov.co/inicio/", None)],
    [("Esri España. (2018). ", None), ("¿Qué es un WebGIS?", True),
     (" https://www.esri.es", None)],
    [("Haklay, M., & Weber, P. (2008). OpenStreetMap: User-generated street maps. ",
      None), ("IEEE Pervasive Computing, 7", True), ("(4), 12–18. "
     "https://doi.org/10.1109/MPRV.2008.80", None)],
    [("Instituto Geográfico Agustín Codazzi. (2024). ", None), ("Geoservicios "
     "cartográficos de Colombia", True), (". https://www.igac.gov.co", None)],
    [("INCIVA. (2023). ", None), ("Bosque seco tropical en el Valle del Cauca", True),
     (".", None)],
    [("Maguire, D. J., Goodchild, M. F., & Rhind, D. W. (1991). ", None),
     ("Geographical information systems: Principles and applications", True),
     (". Longman.", None)],
    [("Open Geospatial Consortium. (2010). ", None), ("OpenGIS Web Map Service (WMS) "
     "implementation specification", True), (" (v1.3.0). "
     "https://www.ogc.org/standards/wms", None)],
    [("Parques Nacionales Naturales de Colombia. (s.f.). ", None), ("Parque Nacional "
     "Natural Las Hermosas", True), (". https://www.parquesnacionales.gov.co", None)],
    [("Steiniger, S., & Hunter, A. J. S. (2013). The 2012 free and open source GIS "
      "software map. ", None), ("Computers, Environment and Urban Systems, 39", True),
     (", 136–150. https://doi.org/10.1016/j.compenvurbsys.2012.10.003", None)],
    [("UNESCO. (2011). ", None), ("Coffee Cultural Landscape of Colombia", True),
     (". https://whc.unesco.org/en/list/1121", None)],
    [("Zimmermann, M. (2005). ", None), ("Ecopedagogía: El planeta en emergencia", True),
     (". Ecoe Ediciones.", None)],
]
# "bold" aqui se usa como marcador de cursiva (titulos APA)
def ref_paras(chunk):
    out = []
    for r in chunk:
        runs = []
        for t, it in r:
            runs.append((t, None))
        out.append({"runs": runs, "space_after": 4, "_it": r})
    return out


def textbox_refs(slide, x, y, w, h, chunk):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.05)
    first = True
    for r in chunk:
        para = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        para.space_after = Pt(4)
        pPr = para._p.get_or_add_pPr()
        pPr.set("marL", str(Inches(0.2)))
        pPr.set("indent", str(-Inches(0.2)))
        for t, it in r:
            _runs(para, t, 8.5, INK, italic=bool(it))


half = 8
textbox_refs(s, LEFT, TOP, 3.85, 4.8, refs[:half])
textbox_refs(s, LEFT + 4.05, TOP, 3.85, 4.8, refs[half:])

# ─────────────────────────── 13. Cierre (diapositiva final de la plantilla) ───────────────────────────
closing = prs.slides[1]          # tras borrar, la de cierre quedo en indice 1
textbox(closing, 0.6, 0.45, 5.0, 1.3, [
    {"text": "Thank you", "bold": True, "size": 36, "color": GOLD, "space_after": 2},
    {"text": "Questions and discussion", "size": 16, "color": WHITE, "space_after": 0}])
textbox(closing, 0.6, 1.5, 4.2, 1.2, [
    {"text": "cristobal.valencia00@usc.edu.co", "size": 11, "color": WHITE,
     "space_after": 1},
    {"text": "jose.molina03@usc.edu.co", "size": 11, "color": WHITE, "space_after": 4},
    {"text": "Universidad Santiago de Cali  ·  Systems Engineering  ·  COMBA I+D",
     "size": 9.5, "color": RGBColor(0xC8, 0xD3, 0xE6), "space_after": 0}])
qr_box(closing, 8.2, 0.45, 1.3, dark=True, sub="Open the Geovisor")

# La de cierre debe ir al final
move_slide(prs, 1, len(prs.slides) - 1)

prs.save(OUT)
print("Generado:", OUT, "-", len(prs.slides), "diapositivas")
