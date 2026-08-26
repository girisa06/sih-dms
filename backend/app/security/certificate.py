from io import BytesIO
from uuid import UUID

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas


def build_section_63_certificate(
    document_id: UUID | str, document_hash: str, mime_type: str, version: int
) -> bytes:
    output = BytesIO()
    canvas = Canvas(output, pagesize=A4)
    canvas.setTitle("Section 63 BSA Admissibility Certificate")
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawString(72, 770, "Section 63 (BSA) Admissibility Certificate")
    canvas.setFont("Helvetica", 10)
    fields = [
        ("Document ID", str(document_id)),
        ("Version", str(version)),
        ("MIME type", mime_type),
        ("SHA-256 evidentiary hash", document_hash),
    ]
    y = 730
    for label, value in fields:
        canvas.drawString(72, y, f"{label}: {value}")
        y -= 24
    canvas.drawString(72, y - 12, "This certificate records the integrity metadata for the referenced document.")
    canvas.save()
    return output.getvalue()