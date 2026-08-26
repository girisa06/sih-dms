"""
API routes for the AI/ML piece.

Endpoints:
    POST /ai/process/{document_id}  -- triggered by Person 1's upload flow
    GET  /ai/search

_trigger_ai_processing (in documents.py) calls this endpoint with NO
body/query params -- just POST to the URL. So this endpoint looks up
the document, decrypts it via Person 2's decrypt_from_storage(), then
runs OCR on the decrypted bytes.
"""

import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.ocr import run_ocr_from_bytes
from app.ai.classify import classify_document
from app.ai.extract import extract_entities

from app.db.session import get_db
from app.models.document import Document
from app.security.encryption import decrypt_from_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/process/{document_id}")
def process_document(document_id: uuid.UUID, db: Session = Depends(get_db)):
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    try:
        plaintext_bytes = decrypt_from_storage(
            storage_path=document.storage_path,
            doc_id=document.id,
            wrapped_dek=document.wrapped_dek,
            nonce=document.nonce,
        )
    except Exception as exc:
        logger.error("Decryption failed for document %s: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document decryption failed during AI processing.",
        ) from exc

    text = run_ocr_from_bytes(plaintext_bytes, mime_type=document.mime_type)
    doc_type = classify_document(text)
    entities = extract_entities(text)

    # Write onto the SAME row Person 1's upload created -- no parallel table.
    document.ocr_text = text
    document.classification = doc_type
    document.entities = entities  # assumes a JSON/JSONB column

    db.commit()
    db.refresh(document)

    return {
        "ocr_text": document.ocr_text,
        "classification": document.classification,
        "entities": document.entities,
    }


@router.get("/search")
def search(q: str, db: Session = Depends(get_db)):
    results = db.query(Document).filter(Document.ocr_text.ilike(f"%{q}%")).all()
    return {
        "query": q,
        "results": [
            {
                "document_id": doc.id,
                "ocr_text": doc.ocr_text,
                "classification": doc.classification,
                "entities": doc.entities,
            }
            for doc in results
        ],
    }
