"""
Classification module — guesses what type of legal document this is,
based on keywords found in the OCR'd text.
"""


def classify_document(text: str) -> str:
    """
    Looks for keywords in the text to guess the document type.
    """
    lowered = text.lower()

    if "first information report" in lowered or "fir no" in lowered:
        return "FIR"
    elif "chargesheet" in lowered or "charge sheet" in lowered:
        return "Chargesheet"
    elif "forensic" in lowered:
        return "Forensic Report"
    elif "court" in lowered or "judgment" in lowered:
        return "Court Filing"
    else:
        return "Unclassified"
