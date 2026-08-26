"""
Entity extraction module — pulls out case number, dates, sections, and
names from OCR'd text using regex pattern matching.

Output shape matches the locked contract (CONTRACT.md):
{
    "case_no": "string",
    "sections": [...],
    "names": [...],
    "dates": [...]
}
"""

import re


def extract_entities(text: str) -> dict:
    """
    Finds specific pieces of information in the text and returns them
    in the exact shape Person 5's UI expects.
    """
    case_matches = re.findall(
        r"(?:FIR\s*No\.?|Case\s*No\.?)\s*[:.]?\s*([\w/]+)", text, re.IGNORECASE
    )
    dates = re.findall(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", text)
    sections = re.findall(r"Section\s+\d+[A-Za-z]?", text, re.IGNORECASE)

    # case_no is a single string per the locked contract, not a list.
    # If we found one or more matches, take the first. If none, empty string.
    case_no = case_matches[0] if case_matches else ""

    # Name extraction isn't built yet (would need spaCy NER for real accuracy).
    # Returning an empty list for now so the key always exists, per Person 5's
    # expectation, rather than omitting it.
    names = []

    return {
        "case_no": case_no,
        "sections": sections,
        "names": names,
        "dates": dates,
    }
