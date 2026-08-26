from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.audit_log import AuditLog
from app.models.document import Document
from app.models.signature import Signature
from app.models.user import User
from app.security.certificate import build_section_63_certificate
from app.security.encryption import decrypt_from_storage
from app.security.ledger import append_audit_event, verify_audit_chain
from app.security.signatures import sign_document
from app.security.watermark import watermark_pdf

router = APIRouter(prefix="/documents", tags=["security"])


def current_actor(user: User) -> UUID:
    return user.id


def get_document(document_id: UUID, db: Session) -> Document:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document


@router.post("/{document_id}/verify")
def verify_document(
    document_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> dict[str, bool]:
    current_actor(current_user)
    get_document(document_id, db)
    return {"valid": verify_audit_chain(db, document_id)}


@router.get("/{document_id}/audit-log")
def audit_log(
    document_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[dict[str, str | None]]:
    current_actor(current_user)
    get_document(document_id, db)
    events = db.scalars(
        select(AuditLog)
        .where(AuditLog.document_id == document_id)
        .order_by(AuditLog.timestamp.asc(), AuditLog.id.asc())
    ).all()
    return [
        {
            "action": event.action,
            "actor": str(event.actor_id),
            "timestamp": event.timestamp.isoformat(),
            "event_hash": event.event_hash,
        }
        for event in events
    ]


@router.post("/{document_id}/sign")
def sign(
    document_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> dict[str, str]:
    actor_id = current_actor(current_user)
    document = get_document(document_id, db)
    signature = Signature(
        document_id=document.id,
        signer_id=actor_id,
        signature_value=sign_document(document.evidentiary_hash),
    )
    db.add(signature)
    append_audit_event(db, document.id, actor_id, "sign")
    db.commit()
    db.refresh(signature)
    return {"signature_value": signature.signature_value, "signed_at": signature.signed_at.isoformat()}


@router.post("/{document_id}/certificate")
def certificate(
    document_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Response:
    actor_id = current_actor(current_user)
    document = get_document(document_id, db)
    pdf = build_section_63_certificate(
        document.id, document.evidentiary_hash, document.mime_type, document.version
    )
    append_audit_event(db, document.id, actor_id, "certificate")
    db.commit()
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{document.id}-section-63.pdf"'},
    )


@router.get("/{document_id}/download")
def download(
    document_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> StreamingResponse:
    actor_id = current_actor(current_user)
    document = get_document(document_id, db)
    try:
        plaintext = decrypt_from_storage(
            document.storage_path, document.id, document.wrapped_dek, document.nonce
        )
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unable to decrypt document") from exc
    import hashlib

    if hashlib.sha256(plaintext).hexdigest() != document.evidentiary_hash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Document integrity check failed")
    append_audit_event(db, document.id, actor_id, "view")
    db.commit()
    if document.mime_type == "application/pdf":
        plaintext = watermark_pdf(plaintext, f"Secure DMS | Document {document.id}")
    return StreamingResponse(iter([plaintext]), media_type=document.mime_type)
