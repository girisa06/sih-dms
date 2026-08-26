"""
Entity extraction module — pulls out case numbers, dates, and legal
sections from OCR'd text using regex pattern matching.
"""

import re


def extract_entities(text: str) -> dict:
    """
    Finds specific pieces of information in the text:
    case numbers, dates, and IPC/BNS sections.
    """
    case_number = re.findall(
        r"(?:FIR\s*No\.?|Case\s*No\.?)\s*[:.]?\s*([\w/]+)", text, re.IGNORECASE
    )
    dates = re.findall(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", text)
    sections = re.findall(r"Section\s+\d+[A-Za-z]?", text, re.IGNORECASE)

    return {
        "case_numbers": case_number,
        "dates": dates,
        "sections": sections,
    }
