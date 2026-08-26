from io import BytesIO

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas


def watermark_pdf(content: bytes, label: str) -> bytes:
    source = PdfReader(BytesIO(content))
    output = PdfWriter()
    for page in source.pages:
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        overlay_buffer = BytesIO()
        canvas = Canvas(overlay_buffer, pagesize=(width or A4[0], height or A4[1]))
        canvas.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.25))
        canvas.setFont("Helvetica", 11)
        canvas.drawString(36, 24, label)
        canvas.save()
        overlay_buffer.seek(0)
        page.merge_page(PdfReader(overlay_buffer).pages[0])
        output.add_page(page)
    result = BytesIO()
    output.write(result)
    return result.getvalue()