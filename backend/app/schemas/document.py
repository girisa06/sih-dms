import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
