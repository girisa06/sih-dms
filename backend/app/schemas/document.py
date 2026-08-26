import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import DocType


class DocumentUploadResponse(BaseModel):
    document_id: uuid.UUID


class DocumentMetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    version: int
    uploaded_by: uuid.UUID
    evidentiary_hash: str
    mime_type: str
    created_at: datetime


class CaseDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    doc_type: DocType
    uploaded_by: uuid.UUID
    version: int
    mime_type: str
    evidentiary_hash: str
    classification: str | None
    created_at: datetime
