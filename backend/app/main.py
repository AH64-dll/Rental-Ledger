from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import current_user
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
    units,
)

app = FastAPI(title="Rental Ledger API", version="0.1.0")

# CORS: locked to the frontend origin in production (RENT-5). Local dev allows 5173.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(leases.router)
app.include_router(charges.router)
app.include_router(charges_flat.router)
app.include_router(payments.router)
app.include_router(payments_flat.router)
app.include_router(dashboard.router)
app.include_router(deposits.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/me")
def me(username: str | None = Depends(current_user)) -> dict:
    # Full auth wiring lands in RENT-1; this stub proves the dependency chain works.
    return {"username": username}
