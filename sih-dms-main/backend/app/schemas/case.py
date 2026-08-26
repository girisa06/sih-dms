import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseCreate(BaseModel):
    case_number: str
    title: str
    status: str


class CaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_number: str
    title: str
    created_by: uuid.UUID
    status: str
    created_at: datetime
