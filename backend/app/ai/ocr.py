"""
OCR module -- turns document bytes into plain text.
"""

import io
import pytesseract
from PIL import Image


def run_ocr(image_path: str) -> str:
    """
    Original file-path based version. Kept for local testing, but the
    real pipeline now goes through run_ocr_from_bytes since documents
    arrive decrypted in-memory, not as files on disk.
    """
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)


def run_ocr_from_bytes(file_bytes: bytes, mime_type: str = "image/png") -> str:
    """
    Takes the raw decrypted bytes of a document and returns the OCR'd
    text. Used by the real /ai/process/{document_id} endpoint, since
    documents are decrypted in-memory (never written to disk).

    NOTE: this currently assumes an image mime type (png/jpg). If
    documents can be uploaded as PDFs, this needs a PDF-to-image step
    first (e.g. via pdf2image) -- confirm with the team what mime
    types actually come through the upload endpoint.
    """
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image)
