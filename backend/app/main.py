import logging
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.cases import router as cases_router
from app.api.routes.documents import router as documents_router
from app.api.security import router as security_router

logger = logging.getLogger(__name__)

from app.api.security import router as security_router

app = FastAPI(title="Secure DMS API")
app.include_router(security_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(documents_router)
app.include_router(security_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
def seed_test_user() -> None:
    from app.core.security import hash_password
    from app.db.session import SessionLocal
    from app.models.enums import UserRole
    from app.models.user import User

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "test@test.com").first() is None:
            db.add(User(
                id=uuid.uuid4(),
                name="Test User",
                email="test@test.com",
                password_hash=hash_password("testpass123"),
                role=UserRole.admin,
            ))
            db.commit()
    except Exception:
        logger.exception("Startup seeding failed; continuing without seeded test user")
    finally:
        db.close()