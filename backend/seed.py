"""Seed the single operator User from env vars.

Usage: PYTHONPATH=. python seed.py
Creates or updates the operator row. Requires OPERATOR_USERNAME and
OPERATOR_PASSWORD (plaintext; hashed here) OR OPERATOR_PASSWORD_HASH (bcrypt).
"""

import os

from sqlalchemy import select

from app.auth import hash_password
from app.db import Base, SessionLocal, engine
from app.models import (  # noqa: F401
    Charge,
    Deposit,
    Lease,
    Payment,
    Property,
    Tenant,
    Unit,
    User,
)


def main() -> None:
    Base.metadata.create_all(bind=engine)
    username = os.environ.get("OPERATOR_USERNAME", "operator")
    password = os.environ.get("OPERATOR_PASSWORD")
    password_hash = os.environ.get("OPERATOR_PASSWORD_HASH")
    if not password_hash and not password:
        raise SystemExit("Set OPERATOR_PASSWORD or OPERATOR_PASSWORD_HASH")
    if not password_hash:
        password_hash = hash_password(password)
    with SessionLocal() as db:
        existing = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if existing:
            existing.password_hash = password_hash
        else:
            db.add(User(username=username, password_hash=password_hash))
        db.commit()
    print(f"Seeded operator: {username}")


if __name__ == "__main__":
    main()
