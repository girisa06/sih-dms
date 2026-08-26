import hashlib
import json
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def _event_hash(
    document_id: UUID, actor_id: UUID, action: str, timestamp: datetime, prev_hash: str | None
) -> str:
    payload = {
        "action": action,
        "actor_id": str(actor_id),
        "document_id": str(document_id),
        "prev_hash": prev_hash,
        "timestamp": timestamp.isoformat(),
    }
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def append_audit_event(db: Session, document_id: UUID, actor_id: UUID, action: str) -> AuditLog:
    previous = db.scalar(
        select(AuditLog)
        .where(AuditLog.document_id == document_id)
        .order_by(AuditLog.timestamp.desc(), AuditLog.id.desc())
    )
    timestamp = datetime.now().astimezone()
    prev_hash = previous.event_hash if previous else None
    event = AuditLog(
        document_id=document_id,
        actor_id=actor_id,
        action=action,
        prev_hash=prev_hash,
        event_hash=_event_hash(document_id, actor_id, action, timestamp, prev_hash),
        timestamp=timestamp,
    )
    db.add(event)
    db.flush()
    return event


def verify_audit_chain(db: Session, document_id: UUID) -> bool:
    events = db.scalars(
        select(AuditLog)
        .where(AuditLog.document_id == document_id)
        .order_by(AuditLog.timestamp.asc(), AuditLog.id.asc())
    ).all()
    previous_hash = None
    for event in events:
        if event.prev_hash != previous_hash:
            return False
        if event.event_hash != _event_hash(
            event.document_id, event.actor_id, event.action, event.timestamp, event.prev_hash
        ):
            return False
        previous_hash = event.event_hash
    return True