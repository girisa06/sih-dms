"""
OCR module — turns a scanned document image into plain text.
"""

import pytesseract
from PIL import Image


def run_ocr(image_path: str) -> str:
    """
    Takes the file path of a scanned document image and returns
    the plain text found inside it.
    """
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text
