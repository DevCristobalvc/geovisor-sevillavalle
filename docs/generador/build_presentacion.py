# -*- coding: utf-8 -*-
"""Genera la Presentacion 1 (corte 1) del proyecto en PDF horizontal 16:9.

Diapositivas en ingles (exposicion oral en espanol), estilo minimalista y formal,
con marca de agua, URL en el pie y codigo QR en la portada y el cierre.

Requisitos: pip install reportlab qrcode pillow
Uso:       python build_presentacion.py "../../Presentacion 1 - Geovisor Ecopedagogico.pdf"
"""
import os
import sys

import qrcode
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

SP = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SP, "Presentacion 1.pdf")

URL = "https://www.refiup.app"
URL_SHORT = "www.refiup.app"

# ─────────────────────────────── Tipografia ───────────────────────────────
FONTS = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")
pdfmetrics.registerFont(TTFont("UI", os.path.join(FONTS, "segoeui.ttf")))
pdfmetrics.registerFont(TTFont("UI-Bold", os.path.join(FONTS, "segoeuib.ttf")))
pdfmetrics.registerFont(TTFont("UI-Italic", os.path.join(FONTS, "segoeuii.ttf")))
pdfmetrics.registerFont(TTFont("UI-Semi", os.path.join(FONTS, "seguisb.ttf")))
pdfmetrics.registerFont(TTFont("UI-Light", os.path.join(FONTS, "segoeuil.ttf")))
pdfmetrics.registerFontFamily("UI", normal="UI", bold="UI-Bold", italic="UI-Italic",
                              boldItalic="UI-Bold")

# ─────────────────────────────── Paleta ───────────────────────────────
GREEN = HexColor("#2D6A4F")      # verde institucional del geovisor
GREEN_LIGHT = HexColor("#52B788")
MINT = HexColor("#D8F3DC")
INK = HexColor("#1F2933")
GRAY = HexColor("#5F6B7A")
LINE = HexColor("#D9DEE3")
BG = HexColor("#FAFBF9")
WATERMARK = Color(0.18, 0.42, 0.31, alpha=0.06)

W, H = 960, 540                  # 16:9 en puntos (13.33 x 7.5 in)
MX = 64                          # margen horizontal
TOP = H - 60


# ─────────────────────────────── Utilidades ───────────────────────────────
def style(name="UI", size=14, leading=None, color=INK, align=0, space_after=0):
    return ParagraphStyle(name=f"{name}-{size}-{color}", fontName=name, fontSize=size,
                          leading=leading or size * 1.35, textColor=color,
                          alignment=align, spaceAfter=space_after)


def para(c, text, x, y, width, st, height=400):
    """Dibuja un parrafo con ajuste de linea; devuelve la altura usada."""
    p = Paragraph(text, st)
    _, h = p.wrap(width, height)
    p.drawOn(c, x, y - h)
    return h


def bullets(c, items, x, y, width, st, gap=6, marker="•", marker_color=GREEN):
    """Lista con viñeta; devuelve la Y final."""
    for it in items:
        c.setFillColor(marker_color)
        c.setFont("UI-Bold", st.fontSize)
        c.drawString(x, y - st.fontSize, marker)
        h = para(c, it, x + 18, y, width - 18, st)
        y -= h + gap
    return y


def pin_logo(c, x, y, size, fill=GREEN, dot=MINT):
    """Logo del geovisor: pin de ubicacion sobre un cuadrado redondeado."""
    c.saveState()
    c.setFillColor(fill)
    c.roundRect(x, y, size, size, size * 0.22, stroke=0, fill=1)
    s = size / 32.0
    p = c.beginPath()
    cx, cy = x + 16 * s, y + (32 - 13) * s
    r = 8 * s
    p.arc(cx - r, cy - r, cx + r, cy + r, startAng=-20, extent=220)
    p.lineTo(x + 16 * s, y + 5 * s)
    p.close()
    c.setFillColor(dot)
    c.drawPath(p, stroke=0, fill=1)
    c.circle(cx, cy, 3.2 * s, stroke=0, fill=1)
    c.setFillColor(fill)
    c.circle(cx, cy, 2.0 * s, stroke=0, fill=1)
    c.restoreState()


def qr_image(url):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=1,
                      box_size=10)
    q.add_data(url)
    q.make(fit=True)
    img = q.make_image(fill_color="#1F2933", back_color="white").convert("RGB")
    return ImageReader(img)


QR = qr_image(URL)


def watermark(c, color=WATERMARK):
    c.saveState()
    c.setFillColor(color)
    c.setFont("UI-Bold", 92)
    c.translate(W / 2, H / 2)
    c.rotate(28)
    c.drawCentredString(0, -30, URL_SHORT)
    c.restoreState()


def end_slide(c, color=WATERMARK):
    """La marca de agua se dibuja al final, encima del contenido, para que las
    tarjetas blancas no la oculten."""
    watermark(c, color)
    c.showPage()


def footer(c, n, total):
    c.saveState()
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(MX, 38, W - MX, 38)
    c.setFillColor(GRAY)
    c.setFont("UI", 8.5)
    c.drawString(MX, 24, f"{URL_SHORT}   ·   Ecopedagogical Web Geovisor for Sevilla, "
                         f"Valle del Cauca   ·   Presentation 1")
    c.drawRightString(W - MX, 24, f"{n} / {total}")
    c.restoreState()


def slide_start(c, n, total, title=None, kicker=None):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    footer(c, n, total)
    pin_logo(c, W - MX - 26, H - 52, 26)
    if kicker:
        c.setFillColor(GREEN_LIGHT)
        c.setFont("UI-Semi", 10)
        c.drawString(MX, TOP + 18, kicker.upper())
    if title:
        c.setFillColor(INK)
        c.setFont("UI-Light", 30)
        c.drawString(MX - 1, TOP - 14, title)
        c.setStrokeColor(GREEN)
        c.setLineWidth(2)
        c.line(MX, TOP - 26, MX + 48, TOP - 26)


def card(c, x, y, w, h, title, body_html, st_body, accent=GREEN, title_size=13):
    c.saveState()
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(x, y, w, h, 6, stroke=1, fill=1)
    c.setFillColor(accent)
    c.rect(x, y + h - 4, w, 4, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("UI-Semi", title_size)
    c.drawString(x + 16, y + h - 28, title)
    c.restoreState()
    para(c, body_html, x + 16, y + h - 40, w - 32, st_body)


def big_number(c, x, y, number, label, w=180):
    c.setFillColor(GREEN)
    c.setFont("UI-Light", 46)
    c.drawString(x, y, number)
    c.setFillColor(GRAY)
    c.setFont("UI", 11)
    c.drawString(x + 2, y - 18, label)


# ─────────────────────────────── Estilos ───────────────────────────────
BODY = style("UI", 13.5, color=INK)
BODY_S = style("UI", 12, color=INK)
BODY_XS = style("UI", 10.5, color=INK)
CARD = style("UI", 11.5, leading=15.5, color=INK)
MUTED = style("UI", 11, color=GRAY)
REF = style("UI", 9.2, leading=11.8, color=INK)
QUOTE = style("UI-Light", 24, leading=32, color=INK)

TOTAL = 14
c = canvas.Canvas(OUT, pagesize=(W, H))
c.setTitle("Presentation 1 — Ecopedagogical Web Geovisor for Sevilla, Valle del Cauca")
c.setAuthor("Cristóbal Valencia Cerón; José David Molina Delgado")
c.setSubject("Undergraduate thesis proposal — Universidad Santiago de Cali")

# ═══════════════════════════════ 1. Portada ═══════════════════════════════
n = 1
c.setFillColor(white)
c.rect(0, 0, W, H, stroke=0, fill=1)
# banda lateral
c.setFillColor(GREEN)
c.rect(0, 0, 14, H, stroke=0, fill=1)
pin_logo(c, MX, H - 96, 40)
c.setFillColor(GRAY)
c.setFont("UI-Semi", 10.5)
c.drawString(MX + 52, H - 74, "UNIVERSIDAD SANTIAGO DE CALI")
c.setFont("UI", 10.5)
c.drawString(MX + 52, H - 89, "Faculty of Engineering  ·  Systems Engineering Program")

c.setFillColor(GREEN_LIGHT)
c.setFont("UI-Semi", 11)
c.drawString(MX, H - 150, "UNDERGRADUATE THESIS PROPOSAL  ·  PRESENTATION 1")
th = para(c, "Development of an Ecopedagogical Web Geovisor for Sevilla, Valle del Cauca",
          MX, H - 164, 580, style("UI-Light", 34, leading=40, color=INK))
para(c, "A WebGIS that connects official geospatial data with pedagogical content to "
        "foster critical recognition of socio-ecosystem transformations among "
        "secondary-school students.",
     MX, H - 164 - th - 14, 540, style("UI", 12.5, leading=17, color=GRAY))

c.setStrokeColor(LINE)
c.setLineWidth(0.6)
c.line(MX, 178, MX + 560, 178)

c.setFillColor(GRAY)
c.setFont("UI-Semi", 9.5)
c.drawString(MX, 158, "AUTHORS")
c.drawString(MX + 290, 158, "THESIS ADVISORS")
c.setFillColor(INK)
c.setFont("UI", 12.5)
c.drawString(MX, 140, "Cristóbal Valencia Cerón")
c.drawString(MX, 122, "José David Molina Delgado")
c.drawString(MX + 290, 140, "Diego Fernando Loaiza")
c.drawString(MX + 290, 122, "Silvia Andrea Quijano Pérez")
c.setFillColor(GRAY)
c.setFont("UI", 10.5)
c.drawString(MX, 84, "Research Group COMBA I+D  ·  Line: Software Systems Development")
c.drawString(MX, 68, "Santiago de Cali, September 2026")

# QR
qx, qy, qs = W - MX - 190, 160, 190
c.setFillColor(white)
c.setStrokeColor(LINE)
c.roundRect(qx - 14, qy - 58, qs + 28, qs + 84, 10, stroke=1, fill=1)
c.drawImage(QR, qx, qy, qs, qs)
c.setFillColor(INK)
c.setFont("UI-Semi", 12)
c.drawCentredString(qx + qs / 2, qy - 22, URL_SHORT)
c.setFillColor(GRAY)
c.setFont("UI", 9.5)
c.drawCentredString(qx + qs / 2, qy - 38, "Scan to open the Geovisor")
c.setFont("UI-Semi", 9.5)
c.setFillColor(GREEN)
c.drawCentredString(qx + qs / 2, qy + qs + 12, "LIVE PLATFORM")
end_slide(c)

# ═══════════════════════════════ 2. Agenda ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Agenda", "Presentation 1  ·  8 minutes")
items = ["Introduction (context)", "Problem statement", "Research question",
         "Justification", "Theoretical framework", "State of the art",
         "General objective", "Specific objectives", "Methodology & progress",
         "References"]
y = TOP - 70
col = 0
for i, it in enumerate(items):
    x = MX + (0 if i < 5 else 420)
    if i == 5:
        y = TOP - 70
    c.setFillColor(GREEN)
    c.setFont("UI-Light", 26)
    c.drawString(x, y, f"{i + 1:02d}")
    c.setFillColor(INK)
    c.setFont("UI", 15)
    c.drawString(x + 46, y + 2, it)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(x, y - 14, x + 360, y - 14)
    y -= 58
end_slide(c)

# ═══════════════════════════════ 3. Introduccion ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Introduction", "Context")
y = TOP - 62
y = bullets(c, [
    "<b>Sevilla</b>, northern Valle del Cauca, Colombia: a municipality recognised for "
    "its coffee-growing vocation and rich biocultural heritage, part of the UNESCO "
    "<b>Coffee Cultural Landscape</b> (2011).",
    "Over recent decades, <b>socio-ecosystem transformations</b> — land-use change, "
    "the coffee crisis and climate change — have created a growing disconnection "
    "between local communities and their territory.",
    "<b>Territorial education</b> emerges as a key strategy to strengthen environmental "
    "awareness and local identity.",
    "This project proposes a <b>web Geovisor with an ecopedagogical approach</b>: "
    "interactive cartography, official geospatial data and multimedia pedagogical "
    "content for secondary-school students.",
], MX, y, 490, BODY, gap=10)

card(c, W - MX - 300, TOP - 62 - 230, 300, 230, "Articulation",
     "Developed alongside the thesis <i>Cartografiar las huellas del café</i> "
     "(J. Rodríguez Camacho), which builds the <b>pedagogical content</b>.<br/><br/>"
     "This project focuses on the <b>web platform</b>: user interfaces, the geospatial "
     "data model and the technical specification.<br/><br/>"
     "Technical and functional reference: <b>GeoCVC portal</b> (geo.cvc.gov.co), "
     "Corporación Autónoma Regional del Valle del Cauca.",
     BODY_XS)
end_slide(c)

# ═══════════════════════════════ 4. Problema ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Problem statement", "Problem")
cw, ch, gap = 196, 232, 16
x0, y0 = MX, TOP - 62 - ch
cards = [
    ("No integrated tool",
     "Sevilla has no digital tool that displays, in an integrated and pedagogical way, "
     "its socio-ecosystem transformations: social actors, water, biodiversity and "
     "land-use dynamics."),
    ("Classroom technology gap",
     "Secondary-school teachers lack interactive tools to contextualise curricular "
     "content with the local geographic and socio-environmental reality."),
    ("Dispersed official data",
     "Geospatial information from IGAC, CVC, IDEAM and DANE is scattered across "
     "platforms and technical formats not accessible to non-specialists."),
    ("Ecopedagogical demand",
     "Ecological awareness requires didactic strategies that link territorial "
     "experience with critical and systemic thinking (Zimmermann, 2005)."),
]
for i, (t, b) in enumerate(cards):
    card(c, x0 + i * (cw + gap), y0, cw, ch, t, b, CARD, title_size=12.5)
c.setFillColor(GREEN)
c.roundRect(MX, 54, W - 2 * MX, 44, 6, stroke=0, fill=1)
c.setFillColor(white)
c.setFont("UI-Semi", 12.5)
c.drawCentredString(W / 2, 70,
                    "Core problem: the absence of a tool that integrates cartography, "
                    "multimedia and pedagogy for the specific context of Sevilla.")
end_slide(c)

# ═══════════════════════════════ 5. Pregunta ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Research question", "Question")
c.setFillColor(GREEN)
c.setFont("UI-Light", 120)
c.drawString(MX - 4, H / 2 - 30, "?")
para(c, "What are the <b>technical, architectural and user-experience requirements</b> "
        "that an ecopedagogical web Geovisor must meet in order to promote the critical "
        "recognition of socio-ecosystem transformations in Sevilla, Valle del Cauca?",
     MX + 130, H / 2 + 76, 700, QUOTE)
end_slide(c)

# ═══════════════════════════════ 6. Justificacion ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Justification", "Why this project")
cw, ch, gap = 264, 238, 20
y0 = TOP - 62 - ch
cols = [
    ("Technological",
     "Web GIS have democratised access to digital cartography (e.g. GeoCVC), yet they "
     "are not designed with a pedagogical focus nor adapted to secondary-school users."
     "<br/><br/>A system built on <b>OGC standards (WMS)</b>, static GeoJSON and modern "
     "web technologies (<b>React, TypeScript, Leaflet</b>) is a concrete contribution "
     "to educational GIS."),
    ("Educational",
     "Ecopedagogy seeks to go beyond conventional environmental education towards a "
     "real transformation of attitudes to the territory.<br/><br/>The Geovisor "
     "provides <b>pedagogical sheets, multimedia and guided tours</b> aligned with "
     "the Ministry of Education (MEN) guidelines for Natural Sciences and "
     "Environmental Education."),
    ("Territorial",
     "Sevilla faces urgent transformations: cattle expansion into páramos, land-use "
     "conflicts, watershed degradation and loss of coffee identity.<br/><br/>Making "
     "them visible through <b>geographic layers linked to pedagogical narratives</b> "
     "strengthens social fabric and local environmental awareness."),
]
for i, (t, b) in enumerate(cols):
    card(c, MX + i * (cw + gap), y0, cw, ch, t, b, CARD)
c.setFillColor(GRAY)
c.setFont("UI-Italic", 11)
c.drawString(MX, 62, "Academic relevance: a design methodology for ecopedagogical WebGIS, "
                     "replicable in other municipalities of Valle del Cauca and Colombia.")
end_slide(c)

# ═══════════════════════════════ 7. Marco teorico ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Theoretical framework", "Foundations")
cw, ch, gx, gy = 408, 168, 16, 14
x0, y0 = MX, TOP - 62 - ch
blocks = [
    ("Ecopedagogy & territorial education",
     "Zimmermann (2005), <i>Ecopedagogía: el planeta en emergencia</i>. A human–"
     "environment relationship from a psycho-environmental perspective, aimed at an "
     "ecological awareness expressed in everyday behaviour. In this project it drives "
     "design decisions: layer selection as territorial narrative, <b>pedagogical "
     "progressivity</b> in the UI, and critical-reflection modules tied to the map."),
    ("Web Geographic Information Systems (WebGIS)",
     "Platforms to visualise, query and analyse geospatial data from a browser, with "
     "no specialised software (Esri España, 2018). Interoperability via <b>OGC WMS "
     "1.3.0</b> (OGC, 2010). Foundations in Maguire, Goodchild &amp; Rhind (1991); "
     "open-source GIS ecosystem in Steiniger &amp; Hunter (2013)."),
    ("Territory & socio-ecosystems in Sevilla",
     "Part of the UNESCO Coffee Cultural Landscape (2011). Páramo Chilí-Barragán, a "
     "sector of PNN Las Hermosas (65.58 ha), Andean forest, wetlands and tropical dry "
     "forest — of which only <b>1.7 %</b> of the original cover survives in Valle del "
     "Cauca (INCIVA, 2023). Watersheds: Bugalagrande and La Vieja rivers."),
    ("Legal framework",
     "<b>Law 99/1993</b> (National Environmental System, SINA) · <b>Law 115/1994</b> "
     "(General Education Law: environmental education as a mandatory area) · "
     "<b>Law 1523/2012</b> (disaster risk management) · <b>Law 1581/2012</b> "
     "(personal data protection) · ICDE and IGAC guidelines for official geospatial "
     "data."),
]
for i, (t, b) in enumerate(blocks):
    x = x0 + (i % 2) * (cw + gx)
    y = y0 - (i // 2) * (ch + gy)
    card(c, x, y, cw, ch, t, b, CARD, accent=GREEN if i % 2 == 0 else GREEN_LIGHT)
end_slide(c)

# ═══════════════════════════════ 8. Estado del arte ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "State of the art", "Related platforms and research")
rows = [
    ("Platform / work", "Scope", "Official data", "Pedagogical focus"),
    ("GeoCVC portal (CVC, 2024)", "Regional environmental geoportal, Valle del Cauca",
     "Yes — WMS/WFS", "No"),
    ("IGAC geoservices (IGAC, 2024)", "National base and cadastral cartography",
     "Yes — WMS", "No"),
    ("OpenStreetMap (Haklay & Weber, 2008)", "Collaborative, user-generated street maps",
     "Community", "No"),
    ("FOSS GIS ecosystem (Steiniger & Hunter, 2013)",
     "Open-source tools: Leaflet, PostGIS, GeoServer…", "Tooling", "No"),
    ("Ecopedagogical Geovisor of Sevilla (this project)",
     "Municipal WebGIS with sheets, glossary and guided tours",
     "Yes — CVC, IGAC, IDEAM, Humboldt, RUNAP", "Yes"),
]
colw = [292, 260, 176, 104]
x0, y = MX, TOP - 66
rh = 40
for r, row in enumerate(rows):
    last = r == len(rows) - 1
    if r == 0:
        c.setFillColor(MINT)
        c.rect(x0, y - rh, sum(colw), rh, stroke=0, fill=1)
    elif last:
        c.setFillColor(HexColor("#EEF7F0"))
        c.rect(x0, y - rh, sum(colw), rh, stroke=0, fill=1)
    x = x0
    for i, cell in enumerate(row):
        fn = "UI-Semi" if (r == 0 or last) else "UI"
        st = style(fn, 10.5, leading=13, color=INK)
        para(c, cell, x + 8, y - 8, colw[i] - 16, st)
        x += colw[i]
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(x0, y - rh, x0 + sum(colw), y - rh)
    y -= rh
c.setFillColor(GRAY)
c.setFont("UI-Italic", 11)
para(c, "<b>Gap identified:</b> no existing WebGIS for Sevilla combines official "
        "geospatial layers, ecopedagogical sheets and guided tours designed for "
        "secondary-school students. Existing portals serve technical users.",
     MX, y - 14, W - 2 * MX, style("UI", 11.5, leading=15, color=GRAY))
end_slide(c)

# ═══════════════════════════════ 9. Objetivo general ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "General objective", "Objectives")
c.setFillColor(GREEN)
c.rect(MX, H / 2 - 70, 5, 150, stroke=0, fill=1)
para(c, "To <b>develop a web Geovisor with an ecopedagogical approach</b> that promotes "
        "the critical recognition of socio-ecosystem transformations in Sevilla (Valle "
        "del Cauca), contributing to the strengthening of <b>territorial awareness</b> "
        "and the <b>re-signification of biocultural heritage</b>.",
     MX + 30, H / 2 + 84, 780, QUOTE)
end_slide(c)

# ═══════════════════════════════ 10. Objetivos especificos ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Specific objectives", "Objectives")
objs = [
    ("Architecture and data model",
     "Specify the software architecture of the Geovisor (React/TypeScript, Leaflet.js, "
     "WMS services, static GeoJSON) and the geospatial data model for its six thematic "
     "categories."),
    ("Interfaces and requirements",
     "Define the functional and non-functional requirements and design the user "
     "interfaces (wireframes and prototypes) with usability, accessibility and "
     "ecopedagogical coherence."),
    ("Data integration",
     "Integrate official geospatial sources (CVC, IGAC, IDEAM, Humboldt Institute, "
     "RUNAP) through public WMS services and GeoJSON files."),
]
y = TOP - 90
for i, (t, b) in enumerate(objs):
    c.setFillColor(GREEN)
    c.circle(MX + 16, y - 10, 16, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("UI-Semi", 14)
    c.drawCentredString(MX + 16, y - 15, str(i + 1))
    c.setFillColor(INK)
    c.setFont("UI-Semi", 14)
    c.drawString(MX + 46, y - 15, t)
    h = para(c, b, MX + 270, y, W - 2 * MX - 270, BODY)
    y -= max(h, 30) + 40
end_slide(c)

# ═══════════════════════════════ 11. Metodologia ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Methodology", "Four phases")
phases = [
    ("01", "Literature review &\nrequirements analysis",
     "WebGIS, ecopedagogy and territorial information systems in education. Inventory "
     "of official geospatial sources for Sevilla. Functional and non-functional "
     "requirements, in articulation with the partner thesis."),
    ("02", "System design",
     "Software architecture and technology stack. Geospatial data model with six "
     "thematic categories. Wireframes of the main screens."),
    ("03", "Implementation & testing",
     "Static web application integrating official layers. Usability testing with "
     "secondary-school students."),
    ("04", "Documentation & closure",
     "Technical documentation (user and technical manuals) and the final thesis "
     "document."),
]
cw, gap = 196, 16
y0 = TOP - 70
for i, (num, t, b) in enumerate(phases):
    x = MX + i * (cw + gap)
    c.setFillColor(GREEN_LIGHT if i % 2 else GREEN)
    c.setFont("UI-Light", 40)
    c.drawString(x, y0 - 34, num)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(x, y0 - 46, x + cw - 10, y0 - 46)
    yy = y0 - 62
    for line in t.split("\n"):
        c.setFillColor(INK)
        c.setFont("UI-Semi", 12.5)
        c.drawString(x, yy, line)
        yy -= 16
    para(c, b, x, yy - 4, cw - 12, BODY_XS)
c.setFillColor(GRAY)
para(c, "<b>Instruments:</b> requirements matrices, architecture diagrams, wireframes, "
        "usability-test records.&nbsp;&nbsp; <b>Indicators:</b> documented architecture; "
        "data model with six thematic categories; functional prototype deployed; "
        "validated requirements specification.",
     MX, 108, W - 2 * MX, style("UI", 10.5, leading=14, color=GRAY))
end_slide(c)

# ═══════════════════════════════ 12. Avance ═══════════════════════════════
n += 1
slide_start(c, n, TOTAL, "Current progress", "The Geovisor today")
stats = [("23", "thematic layers"), ("6", "categories"), ("23", "pedagogical sheets"),
         ("4", "guided tours"), ("5", "official WMS providers")]
for i, (num, lab) in enumerate(stats):
    big_number(c, MX + i * 168, TOP - 110, num, lab)
c.setStrokeColor(LINE)
c.setLineWidth(0.6)
c.line(MX, TOP - 148, W - MX, TOP - 148)
y = TOP - 170
y = bullets(c, [
    "<b>Single-page application</b> running entirely in the browser: React 18, "
    "TypeScript, Vite, Tailwind CSS and Leaflet — no server, no database, no personal "
    "data.",
    "Layers from <b>CVC, IGAC, IDEAM, Humboldt Institute and RUNAP</b> via OGC WMS, "
    "plus versioned GeoJSON for small vectors.",
    "<b>Progressive Web App</b>: works offline after the first visit — designed for "
    "rural classrooms with intermittent connectivity.",
    "Pedagogical sheets with reflection questions, glossary, measurement tools, "
    "image export and shareable map links.",
    f"Publicly deployed at <b>{URL_SHORT}</b> with continuous deployment.",
], MX, y, 560, BODY_S, gap=8)
qs = 150
qx, qy = W - MX - qs, 92
c.setFillColor(white)
c.setStrokeColor(LINE)
c.roundRect(qx - 12, qy - 34, qs + 24, qs + 46, 8, stroke=1, fill=1)
c.drawImage(QR, qx, qy, qs, qs)
c.setFillColor(INK)
c.setFont("UI-Semi", 10.5)
c.drawCentredString(qx + qs / 2, qy - 18, URL_SHORT)
end_slide(c)

# ═══════════════════════════════ 13-14. Referencias ═══════════════════════════════
refs = [
    "Congreso de Colombia. (1993). <i>Ley 99 de 1993, por la cual se crea el Ministerio "
    "del Medio Ambiente y se organiza el Sistema Nacional Ambiental (SINA)</i>. Diario "
    "Oficial No. 41.146.",
    "Congreso de Colombia. (1994). <i>Ley 115 de 1994, Ley General de Educación</i>. "
    "Diario Oficial No. 41.214.",
    "Congreso de Colombia. (2012a). <i>Ley 1523 de 2012, por la cual se adopta la "
    "política nacional de gestión del riesgo de desastres</i>. Diario Oficial No. 48.411.",
    "Congreso de Colombia. (2012b). <i>Ley 1581 de 2012, por la cual se dictan "
    "disposiciones generales para la protección de datos personales</i>. Diario Oficial "
    "No. 48.587.",
    "Corporación Autónoma Regional del Valle del Cauca. (2024). <i>Portal GeoCVC</i>. "
    "https://geo.cvc.gov.co/inicio/",
    "Esri España. (2018). <i>¿Qué es un WebGIS?</i> https://www.esri.es",
    "Haklay, M., &amp; Weber, P. (2008). OpenStreetMap: User-generated street maps. "
    "<i>IEEE Pervasive Computing, 7</i>(4), 12–18. https://doi.org/10.1109/MPRV.2008.80",
    "Instituto Geográfico Agustín Codazzi. (2024). <i>Geoservicios cartográficos de "
    "Colombia</i>. https://www.igac.gov.co",
    "Instituto para la Investigación y la Preservación del Patrimonio Cultural y "
    "Natural del Valle del Cauca. (2023). <i>Bosque seco tropical en el Valle del "
    "Cauca</i>. INCIVA.",
    "Maguire, D. J., Goodchild, M. F., &amp; Rhind, D. W. (1991). <i>Geographical "
    "information systems: Principles and applications</i>. Longman Scientific &amp; "
    "Technical.",
    "Open Geospatial Consortium. (2010). <i>OpenGIS Web Map Service (WMS) implementation "
    "specification</i> (Version 1.3.0). https://www.ogc.org/standards/wms",
    "Parques Nacionales Naturales de Colombia. (s.f.). <i>Parque Nacional Natural Las "
    "Hermosas</i>. https://www.parquesnacionales.gov.co",
    "Steiniger, S., &amp; Hunter, A. J. S. (2013). The 2012 free and open source GIS "
    "software map: A guide to facilitate research, development, and adoption. "
    "<i>Computers, Environment and Urban Systems, 39</i>, 136–150. "
    "https://doi.org/10.1016/j.compenvurbsys.2012.10.003",
    "UNESCO. (2011). <i>Coffee Cultural Landscape of Colombia</i>. World Heritage List. "
    "https://whc.unesco.org/en/list/1121",
    "Zimmermann, M. (2005). <i>Ecopedagogía: El planeta en emergencia</i>. Ecoe Ediciones.",
]
n += 1
slide_start(c, n, TOTAL, "References", "APA 7th edition")
half = 8
colw = (W - 2 * MX - 28) / 2
for part, chunk in enumerate((refs[:half], refs[half:])):
    x = MX + part * (colw + 28)
    y = TOP - 64
    for r in chunk:
        h = para(c, r, x + 14, y, colw - 14, REF)
        c.setFillColor(GREEN)
        c.rect(x, y - 9, 3, 3, stroke=0, fill=1)
        y -= h + 7
end_slide(c)

# ═══════════════════════════════ 15. Cierre ═══════════════════════════════
n += 1
c.setFillColor(GREEN)
c.rect(0, 0, W, H, stroke=0, fill=1)
pin_logo(c, MX, H - 96, 40, fill=white, dot=GREEN)
c.setFillColor(white)
c.setFont("UI-Light", 44)
c.drawString(MX, H - 190, "Thank you")
c.setFont("UI", 14)
c.setFillColor(MINT)
c.drawString(MX, H - 222, "Questions and discussion")
c.setFont("UI-Semi", 10.5)
c.drawString(MX, 150, "CONTACT")
c.setFont("UI", 12)
c.setFillColor(white)
c.drawString(MX, 130, "cristobal.valencia00@usc.edu.co")
c.drawString(MX, 112, "jose.molina03@usc.edu.co")
c.setFillColor(MINT)
c.setFont("UI", 10.5)
c.drawString(MX, 78, "Universidad Santiago de Cali  ·  Systems Engineering  ·  COMBA I+D")
qs = 190
qx, qy = W - MX - qs, 150
c.setFillColor(white)
c.roundRect(qx - 14, qy - 48, qs + 28, qs + 62, 10, stroke=0, fill=1)
c.drawImage(QR, qx, qy, qs, qs)
c.setFillColor(INK)
c.setFont("UI-Semi", 12.5)
c.drawCentredString(qx + qs / 2, qy - 22, URL_SHORT)
c.setFillColor(GRAY)
c.setFont("UI", 9.5)
c.drawCentredString(qx + qs / 2, qy - 37, "Open the Geovisor")
end_slide(c, Color(1, 1, 1, alpha=0.07))

c.save()
print("Generado:", OUT)
