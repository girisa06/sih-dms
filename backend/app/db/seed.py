"""Development-only users required by the frontend quick-access buttons."""

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User


DEMO_PASSWORD = "demo-password"


def seed_demo_users() -> None:
    db = SessionLocal()
    try:
        for role in UserRole:
            email = f"{role.value}@sih.test"
            if db.query(User).filter(User.email == email).first() is None:
                db.add(
                    User(
                        name=role.value.replace("_", " ").title(),
                        email=email,
                        password_hash=hash_password(DEMO_PASSWORD),
                        role=role,
                    )
                )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()
