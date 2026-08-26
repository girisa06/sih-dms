import logging
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.config import settings
from app.security.encryption import encrypt_and_store
from app.security.ledger import append_audit_event
from app.db.session import get_db
from app.models.case import Case
from app.models.case_access import CaseAccess
from app.models.document import Document
from app.models.enums import DocType, UserRole
from app.models.user import User
from app.schemas.document import DocumentMetadataResponse, DocumentUploadResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["documents"])


def _trigger_ai_processing(document_id: uuid.UUID) -> None:
    url = f"{settings.ai_process_base_url}/ai/process/{document_id}"
    try:
        httpx.post(url, timeout=5.0)
    except Exception:
        logger.warning(
            "AI processing trigger failed for document %s (endpoint may not be implemented yet)",
            document_id,
        )


@router.post(
    "/cases/{case_id}/documents",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    case_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    doc_type: DocType = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.officer, UserRole.forensic_expert, UserRole.admin)),
) -> DocumentUploadResponse:
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    if case.created_by != current_user.id:
        now = datetime.now(timezone.utc)
        has_access = (
            db.query(CaseAccess)
            .filter(
                CaseAccess.case_id == case_id,
                CaseAccess.user_id == current_user.id,
                CaseAccess.expires_at > now,
            )
            .first()
        )
        if has_access is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    plaintext = await file.read()
    doc_id = uuid.uuid4()

    try:
        encryption_result = encrypt_and_store(plaintext, str(doc_id))
    except RuntimeError as exc:
        logger.error("Encryption failed for document %s: %s", doc_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document encryption failed. Please contact an administrator.",
        ) from exc

    document = Document(
        id=doc_id,
        case_id=case_id,
        doc_type=doc_type,
        uploaded_by=current_user.id,
        version=1,
        storage_path=encryption_result["storage_path"],
        evidentiary_hash=encryption_result["evidentiary_hash"],
        wrapped_dek=encryption_result["wrapped_dek"],
        nonce=encryption_result["nonce"],
        mime_type=file.content_type or "application/octet-stream",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        append_audit_event(db, document.id, current_user.id, "upload")
        db.commit()
    except Exception:
        db.rollback()
        logger.warning(
            "Failed to record 'upload' audit event for document %s", document.id, exc_info=True
        )

    background_tasks.add_task(_trigger_ai_processing, document.id)

    return DocumentUploadResponse(document_id=document.id)


def _ensure_document_access(db: Session, document: Document, current_user: User) -> None:
    case = db.get(Case, document.case_id)
    if case is not None and case.created_by == current_user.id:
        return

    now = datetime.now(timezone.utc)
    has_access = (
        db.query(CaseAccess)
        .filter(
            CaseAccess.case_id == document.case_id,
            CaseAccess.user_id == current_user.id,
            CaseAccess.expires_at > now,
        )
        .first()
    )
    if has_access is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


@router.get("/documents/{document_id}", response_model=DocumentMetadataResponse)
def get_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Document:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    _ensure_document_access(db, document, current_user)
    return document


@router.get("/documents/{document_id}/versions", response_model=list[DocumentMetadataResponse])
def get_document_versions(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Document]:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    _ensure_document_access(db, document, current_user)

    # No original_document_id/version-chain field on the model yet (out of scope
    # for this demo) -- return the single document as a one-element version list
    # so the response shape matches the contract (a list of versions).
    return [document]
