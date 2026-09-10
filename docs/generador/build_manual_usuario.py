# -*- coding: utf-8 -*-
"""Genera el Manual de Usuario del Geovisor Ecopedagogico en formato .docx (APA 7)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apa import (new_document, add_page_numbers, title_page, abstract, h1, h2,
                 body, bullet, numbered, figure, table, reference, para)

SP = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(SP, "img")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SP, "Manual de Usuario.docx")


def img(name):
    return os.path.join(IMG, name + ".png")


doc = new_document()
add_page_numbers(doc)

# ─────────────────────────────── Portada ───────────────────────────────
title_page(
    doc,
    title="Manual de Usuario",
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
    "El Geovisor Ecopedagógico es una herramienta web que permite explorar las "
    "transformaciones socioecosistémicas del municipio de Sevilla, Valle del Cauca, "
    "mediante mapas interactivos, fichas pedagógicas y recorridos guiados. Este manual "
    "describe, paso a paso, cómo utilizarla. Está dirigido a estudiantes de básica "
    "secundaria de 10 a 15 años, a docentes y al público general. La herramienta no "
    "requiere instalación: funciona en cualquier navegador moderno y, después de la "
    "primera visita, también sin conexión a internet. El documento se organiza en once "
    "secciones apoyadas en nueve figuras que resumen visualmente cada procedimiento.",
    "geovisor, ecopedagogía, cartografía digital, educación ambiental, Sevilla",
)

# ─────────────────────────── 1. Qué es ───────────────────────────
h1(doc, "Qué es el Geovisor")
body(doc,
     "El Geovisor es una aplicación de mapas que muestra las transformaciones del "
     "territorio de Sevilla: sus aguas, bosques, páramos, suelos, actores sociales y el "
     "Paisaje Cultural Cafetero. Cada capa del mapa incluye una ficha pedagógica con "
     "explicaciones, preguntas de reflexión, vocabulario y material multimedia.")

h2(doc, "Qué se puede hacer")
bullet(doc, "Explorar 23 capas geográficas del municipio, agrupadas en seis categorías.")
bullet(doc, "Consultar 23 fichas pedagógicas con galería de imágenes y videos.")
bullet(doc, "Seguir cuatro recorridos guiados temáticos, parada por parada.")
bullet(doc, "Medir distancias y áreas sobre el mapa.")
bullet(doc, "Exportar la vista actual como imagen y compartirla mediante un enlace.")
bullet(doc, "Consultar un glosario de términos y una guía rápida de uso.")
bullet(doc, "Utilizar el mapa sin conexión después de la primera visita.")
para(doc, "")

figure(doc, 1, "Flujo básico de uso, del inicio a la consulta de una ficha",
       img("mu-01"),
       "El recorrido mínimo para obtener contenido pedagógico consta de cinco pasos.")

# ─────────────────────── 2. Antes de empezar ───────────────────────
h1(doc, "Antes de Empezar")
body(doc,
     "Solo se necesita un navegador moderno —Chrome, Firefox, Edge o Safari— y, la "
     "primera vez, conexión a internet. No hay que instalar programas ni crear una "
     "cuenta. La herramienta funciona igualmente en computador, tableta o teléfono, y "
     "puede instalarse como aplicación desde el propio navegador.")

# ─────────────────── 3. Cómo moverse por la aplicación ───────────────────
h1(doc, "Cómo Moverse por la Aplicación")
body(doc,
     "La aplicación tiene cinco secciones principales, accesibles desde la barra "
     "superior en cualquier momento.")

table(doc, 1, "Secciones de la aplicación y su propósito",
      ["Sección", "Para qué sirve"],
      [
          ["Inicio", "Presentación del territorio y accesos rápidos"],
          ["Visor", "El mapa interactivo; es el corazón de la herramienta"],
          ["Recorridos", "Rutas temáticas guiadas, parada por parada"],
          ["Glosario", "Términos clave con su definición y enlace al visor"],
          ["Guía", "Instrucciones rápidas de uso"],
      ],
      col_widths=[1.6, 4.9])

figure(doc, 2, "Mapa de navegación entre las secciones de la aplicación",
       img("mu-02"),
       "Desde Recorridos y Glosario se llega también al Visor, que concentra la "
       "exploración cartográfica.")

# ─────────────────── 4. La pantalla del Visor ───────────────────
h1(doc, "La Pantalla del Visor")
body(doc,
     "El Visor se organiza en tres zonas, inspiradas en los visores geográficos "
     "profesionales pero simplificadas para el aula.")

figure(doc, 3, "Anatomía de la pantalla del Visor y sus tres zonas",
       img("mu-03"),
       "El panel derecho permanece oculto hasta que se hace clic sobre un elemento "
       "del mapa.")

h2(doc, "Panel izquierdo")
body(doc,
     "Contiene las seis categorías de capas organizadas en un acordeón. Al abrir una "
     "categoría y marcar una capa, esta muestra su control de opacidad y su leyenda de "
     "colores.")

h2(doc, "Área central")
body(doc,
     "Es el mapa. Permite acercar y alejar con la rueda del ratón o con los botones de "
     "más y menos, desplazarse arrastrando, y cambiar el mapa base entre callejero, "
     "satélite y topográfico. En la parte inferior aparecen la escala gráfica y las "
     "coordenadas del cursor.")

h2(doc, "Panel derecho")
body(doc,
     "Al hacer clic sobre un elemento del mapa aparece un globo con su información "
     "básica y un botón para abrir la ficha pedagógica completa, que se despliega en "
     "este panel.")

# ─────────────────── 5. Explorar capas ───────────────────
h1(doc, "Explorar Capas Paso a Paso")
numbered(doc, "Abrir el Visor desde la barra superior.")
numbered(doc, "Hacer clic en una categoría, por ejemplo Agua, para desplegarla.")
numbered(doc, "Marcar la casilla de una capa, por ejemplo Cuencas Hidrográficas.")
numbered(doc, "La capa aparece en el mapa con su simbología y su leyenda.")
numbered(doc, "Ajustar la opacidad con el deslizador para ver el mapa de fondo.")
numbered(doc, "Usar el botón de zoom a la extensión para encuadrar la capa completa.")
para(doc, "")
body(doc,
     "Se pueden activar varias capas a la vez para compararlas. Por ejemplo, "
     "superponer las cuencas hidrográficas y las áreas protegidas permite observar qué "
     "parte del agua del municipio nace en territorio conservado.")

figure(doc, 4, "Pasos para activar una capa y ajustar su presentación",
       img("mu-04"),
       "La opacidad y el encuadre son ajustes opcionales, disponibles una vez la capa "
       "está activa.")

# ─────────────────── 6. Fichas pedagógicas ───────────────────
h1(doc, "Consultar una Ficha Pedagógica")
body(doc,
     "Las fichas son el contenido educativo del Geovisor. Cada capa tiene la suya y se "
     "abre desde el globo de información, al hacer clic sobre un elemento del mapa.")

figure(doc, 5, "Componentes de una ficha pedagógica",
       img("mu-05"),
       "Las preguntas de reflexión están pensadas para trabajarse en grupo, no para "
       "tener una única respuesta correcta.")

# ─────────────────── 7. Recorridos guiados ───────────────────
h1(doc, "Recorridos Guiados")
body(doc,
     "Un recorrido es una ruta temática con varias paradas. El mapa se desplaza de una "
     "parada a otra mientras se lee una breve narración en cada punto. Es la forma más "
     "sencilla de usar el Geovisor en una clase, porque el itinerario ya está "
     "preparado.")

table(doc, 2, "Recorridos guiados disponibles",
      ["Recorrido", "Paradas", "Duración", "Nivel"],
      [
          ["Las huellas del café", "4", "20 min", "Grados 6 a 9"],
          ["El agua en Sevilla", "5", "25 min", "Grados 7 a 9"],
          ["El páramo: fábrica de agua", "3", "15 min", "Grados 8 a 11"],
          ["Territorios de vida", "4", "20 min", "Grados 8 a 11"],
      ],
      note="La duración es orientativa y no incluye el tiempo de discusión en aula.",
      col_widths=[2.9, 1.0, 1.3, 1.3])

figure(doc, 6, "Navegación de un recorrido guiado",
       img("mu-06"),
       "Los botones Siguiente y Anterior permiten avanzar y retroceder; el recorrido "
       "puede abandonarse en cualquier momento.")

# ─────────────────── 8. Herramientas ───────────────────
h1(doc, "Herramientas del Visor")
body(doc,
     "Además de explorar capas, el Visor incorpora cuatro herramientas de trabajo "
     "accesibles desde la barra lateral derecha del mapa.")

figure(doc, 7, "Herramientas disponibles en el Visor",
       img("mu-07"),
       "Las cuatro herramientas funcionan sobre las capas que estén activas en ese "
       "momento.")

h2(doc, "Medir")
body(doc,
     "Permite trazar una línea para conocer una distancia en kilómetros, o un polígono "
     "para calcular un área en hectáreas. Es útil para dimensionar, por ejemplo, cuánto "
     "mide el frente de un río o qué superficie ocupa un humedal.")

h2(doc, "Exportar como imagen")
body(doc,
     "Descarga la vista actual del mapa como archivo PNG, con las capas activas tal "
     "como se ven en pantalla. Sirve para incluir el mapa en un trabajo escrito o en una "
     "presentación.")

h2(doc, "Compartir la vista")
body(doc,
     "La dirección web del navegador guarda siempre el estado del mapa: las capas "
     "activas, el nivel de acercamiento y el punto central. Copiar esa dirección y "
     "enviarla basta para que otra persona vea exactamente el mismo mapa.")

h2(doc, "Buscar")
body(doc,
     "El buscador de la barra superior localiza lugares del municipio por su nombre. "
     "Además, la búsqueda dentro de capas filtra los elementos de las capas activas por "
     "nombre o atributo y los resalta en el mapa.")

# ─────────────────── 9. Uso sin conexión ───────────────────
h1(doc, "Uso sin Conexión")
body(doc,
     "En la primera visita con internet, la aplicación guarda en el dispositivo el mapa "
     "base, las capas y las fichas, de modo que pueda volver a usarse sin conexión. Es "
     "especialmente útil para clases en zonas rurales con señal intermitente.")

figure(doc, 8, "Funcionamiento del modo sin conexión",
       img("mu-08"),
       "Las capas de tipo imagen provenientes de servidores externos y los videos "
       "siguen requiriendo internet; el Geovisor lo advierte con claridad.")

# ─────────────────── 10. Glosario y Guía ───────────────────
h1(doc, "Glosario y Guía")
body(doc,
     "El Glosario reúne los términos clave del proyecto —ecopedagógicos, ecosistémicos "
     "y cartográficos— con búsqueda por texto y enlace a la capa relacionada en el "
     "Visor. La Guía ofrece instrucciones rápidas para quien usa la herramienta por "
     "primera vez.")

# ─────────────────── 11. Problemas frecuentes ───────────────────
h1(doc, "Problemas Frecuentes")

figure(doc, 9, "Qué revisar cuando una capa no aparece en el mapa",
       img("mu-09"),
       "La mayoría de incidencias se resuelven verificando la casilla de la capa, la "
       "conexión y el nivel de acercamiento.")

table(doc, 3, "Incidencias habituales y su solución",
      ["Situación", "Qué hacer"],
      [
          ["El mapa se ve vacío",
           "Acercar o alejar el zoom; algunas capas solo se ven a cierta escala"],
          ["Un video no abre",
           "Requiere internet; sin conexión se muestra un aviso"],
          ["Una imagen no carga",
           "Puede requerir internet; se muestra el crédito del autor como respaldo"],
          ["El recorrido no avanza",
           "Comprobar que se pulsa Siguiente; la última parada desactiva el botón"],
      ],
      col_widths=[2.2, 4.3])

# ─────────────────── Referencias ───────────────────
doc.add_page_break()
h1(doc, "Referencias")
reference(doc,
          "Corporación Autónoma Regional del Valle del Cauca. (2024). Portal GeoCVC. "
          "https://geo.cvc.gov.co/inicio/")
reference(doc,
          "Organización de las Naciones Unidas para la Educación, la Ciencia y la "
          "Cultura. (2011). Paisaje Cultural Cafetero de Colombia. "
          "https://whc.unesco.org/en/list/1121")
reference(doc,
          "Zimmermann, M. (2005). Ecopedagogía: El planeta en emergencia. Ecoe "
          "Ediciones.")

doc.save(OUT)
print("Generado:", OUT)
