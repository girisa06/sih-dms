import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseAccessGrant(BaseModel):
    user_id: uuid.UUID
    expires_at: datetime


class CaseAccessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: uuid.UUID
    user_id: uuid.UUID
    granted_by: uuid.UUID
    expires_at: datetime
