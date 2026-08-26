import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.case import Case
from app.models.case_access import CaseAccess
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.case import CaseCreate, CaseResponse

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.officer, UserRole.admin)),
) -> Case:
    case = Case(
        case_number=payload.case_number,
        title=payload.title,
        status=payload.status,
        created_by=current_user.id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("", response_model=list[CaseResponse])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Case]:
    now = datetime.now(timezone.utc)
    accessible_case_ids = (
        db.query(CaseAccess.case_id)
        .filter(
            CaseAccess.user_id == current_user.id,
            CaseAccess.expires_at > now,
        )
        .scalar_subquery()
    )

    return (
        db.query(Case)
        .filter(or_(Case.created_by == current_user.id, Case.id.in_(accessible_case_ids)))
        .all()
    )


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Case:
    not_found = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    case = db.get(Case, case_id)
    if case is None:
        raise not_found

    if case.created_by == current_user.id:
        return case

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
        raise not_found

    return case
