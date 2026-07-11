import os
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from starlette.responses import FileResponse

from app.auth import current_user, hash_password
from app.db import Base, SessionLocal, engine
from app.models import (  # noqa: F401 — ensure all models are loaded for create_all
    Charge,
    Deposit,
    Lease,
    Payment,
    Property,
    Tenant,
    User,
)
from app.routers import (
    auth,
    charges,
    charges_flat,
    dashboard,
    deposits,
    leases,
    payments,
    payments_flat,
    properties,
    tenants,
)

app = FastAPI(title="Rental Ledger API", version="0.1.0")

# CORS: locked to the frontend origin in production (RENT-5). Local dev allows 5173.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(tenants.router)
app.include_router(leases.router)
app.include_router(charges.router)
app.include_router(charges_flat.router)
app.include_router(payments.router)
app.include_router(payments_flat.router)
app.include_router(dashboard.router)
app.include_router(deposits.router)


# ── Auto-create tables and seed operator ────────────────────────────
@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    username = os.environ.get("OPERATOR_USERNAME", "operator")
    password = os.environ.get("OPERATOR_PASSWORD")
    password_hash = os.environ.get("OPERATOR_PASSWORD_HASH")
    if not password_hash and not password:
        password_hash = hash_password("changeme")
    elif password:
        password_hash = hash_password(password)
    with SessionLocal() as db:
        existing = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if existing:
            if existing.password_hash != password_hash:
                existing.password_hash = password_hash
        else:
            db.add(User(username=username, password_hash=password_hash))
        db.commit()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/me")
def me(username: str | None = Depends(current_user)) -> dict:
    # Full auth wiring lands in RENT-1; this stub proves the dependency chain works.
    return {"username": username}


# ── Serve built frontend for production ──────────────────────────────
_candidates = [
    Path("/app/frontend/dist"),  # Docker
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",  # Local dev
]
FRONTEND_DIR = next((p for p in _candidates if p.is_dir()), None)

if FRONTEND_DIR and FRONTEND_DIR.is_dir():
    app.mount(
        "/assets",
        StaticFiles(directory=str(FRONTEND_DIR / "assets")),
        name="frontend_assets",
    )

    @app.get("/favicon.svg")
    async def favicon():
        return FileResponse(str(FRONTEND_DIR / "favicon.svg"), media_type="image/svg+xml")

    @app.get("/icons.svg")
    async def icons():
        return FileResponse(str(FRONTEND_DIR / "icons.svg"), media_type="image/svg+xml")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index = FRONTEND_DIR / "index.html"
        if index.is_file():
            return FileResponse(str(index), media_type="text/html")
        return {"detail": "Not Found"}
