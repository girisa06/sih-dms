"""
OCR module -- turns document bytes into plain text.
"""

import io
import logging

logger = logging.getLogger(__name__)

try:
    import pytesseract
    from PIL import Image

    _OCR_AVAILABLE = True
except ImportError:
    _OCR_AVAILABLE = False


def run_ocr(image_path: str) -> str:
    """
    Original file-path based version. Kept for local testing, but the
    real pipeline now goes through run_ocr_from_bytes since documents
    arrive decrypted in-memory, not as files on disk.
    """
    if not _OCR_AVAILABLE:
        logger.warning("OCR unavailable: pytesseract/Pillow not installed")
        return "OCR unavailable"

    try:
        image = Image.open(image_path)
        return pytesseract.image_to_string(image)
    except Exception:
        logger.warning("OCR failed for %s", image_path, exc_info=True)
        return "OCR unavailable"


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
    if not _OCR_AVAILABLE:
        logger.warning("OCR unavailable: pytesseract/Pillow not installed")
        return "OCR unavailable"

    try:
        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image)
    except Exception:
        logger.warning("OCR failed on in-memory bytes (mime_type=%s)", mime_type, exc_info=True)
        return "OCR unavailable"
