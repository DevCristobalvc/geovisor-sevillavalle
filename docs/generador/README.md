# Generador de los manuales

Los manuales de `docs/` no se editan a mano: se generan desde estos scripts. Así el
documento entregable y su fuente viven juntos en el repositorio y pueden regenerarse
cuando el código cambie.

## Qué hay aquí

| Archivo | Función |
|---------|---------|
| `apa.py` | Utilidades de formato APA 7 sobre python-docx (portada, títulos, figuras, tablas, referencias) |
| `diagrams.py` | Fuente Mermaid de los 21 diagramas; los escribe en `mmd/` |
| `build_manual_usuario.py` | Construye el Manual de Usuario |
| `build_manual_tecnico.py` | Construye el Manual Técnico |
| `mmd/` | Diagramas Mermaid y el tema visual compartido |

## Requisitos

```bash
pip install python-docx
npm install @mermaid-js/mermaid-cli
```

## Regenerar

```bash
# 1. Escribir las fuentes Mermaid
python diagrams.py

# 2. Renderizar cada diagrama a PNG (escala 3 para impresión)
mkdir -p img
for f in mmd/mu-*.mmd mmd/mt-*.mmd; do
  n=$(basename "$f" .mmd)
  mmdc -i "$f" -o "img/$n.png" -c mmd/theme.json -b white -s 3
done

# 3. Construir los documentos
python build_manual_usuario.py "../Manual de Usuario - Geovisor Ecopedagogico.docx"
python build_manual_tecnico.py  "../Manual Tecnico - Geovisor Ecopedagogico.docx"
```

Los PDF se obtienen exportando los `.docx` desde Word o LibreOffice
(`soffice --headless --convert-to pdf archivo.docx`).

## Convenciones

- **Formato:** APA 7 — Times New Roman 12, interlineado doble, márgenes de 1 pulgada,
  numeración en el encabezado derecho, sangría francesa en las referencias.
- **Figuras:** rótulo `Figura N` en negrita, título en cursiva, imagen centrada y nota
  explicativa. Se escalan al ancho útil (6,5 in) sin superar 6,5 in de alto.
- **Diagramas:** ninguno debe superar una proporción alto/ancho de 0,85; por encima de
  eso conviene reorientarlo a `flowchart LR` para que no ocupe una página entera.
- **Contenido:** debe reflejar el código real. Al cambiar `layers.config.ts`, los
  recorridos o los requisitos, actualizar aquí las cifras correspondientes.
