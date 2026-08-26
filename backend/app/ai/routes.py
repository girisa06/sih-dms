"""
API routes for the AI/ML piece.

This file defines the two web addresses (endpoints) that Person 1's
upload flow and Person 4/5's frontend will call:

    POST /ai/process/{document_id}
    GET  /search

We use FastAPI's "APIRouter" here instead of creating our own separate
FastAPI app. This is the standard pattern for a multi-person FastAPI
project — each feature area (auth, cases, ai, etc.) defines its own
router, and main.py "includes" all of them into one app.
"""

from fastapi import APIRouter

from app.ai.ocr import run_ocr
from app.ai.classify import classify_document
from app.ai.extract import extract_entities

router = APIRouter(prefix="/ai", tags=["ai"])


# ------------------------------------------------------------------------
# TEMPORARY FAKE DATABASE
# ------------------------------------------------------------------------
# Replace this with real calls to Person 1's database once their
# `documents` table and DB session are ready. Ask Person 1 how to
# import their DB connection (likely something in app/db/).
FAKE_DATABASE = {}


@router.post("/process/{document_id}")
def process_document(document_id: str, image_path: str):
    text = run_ocr(image_path)
    doc_type = classify_document(text)
    entities = extract_entities(text)

    FAKE_DATABASE[document_id] = {
        "ocr_text": text,
        "classification": doc_type,
        "entities": entities,
    }

    return FAKE_DATABASE[document_id]


@router.get("/search")
def search(q: str):
    results = []
    for doc_id, data in FAKE_DATABASE.items():
        if data["ocr_text"] and q.lower() in data["ocr_text"].lower():
            results.append({"document_id": doc_id, **data})
    return {"query": q, "results": results}
