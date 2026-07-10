from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Deposit, Lease

router = APIRouter(prefix="/leases/{lease_id}/deposits", tags=["deposits"])

from pydantic import BaseModel
from datetime import date


class DepositCreate(BaseModel):
    amount_held_cents: int
    collected_date: date
    notes: str | None = None


class DepositResponse(BaseModel):
    id: int
    lease_id: int
    amount_held_cents: int
    collected_date: date
    status: str
    refunded_amount_cents: int
    notes: str | None

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[DepositResponse])
def list_deposits(
    lease_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[Deposit]:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
    return db.execute(
        select(Deposit).where(Deposit.lease_id == lease_id)
    ).scalars().all()


@router.post("/", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
def create_deposit(
    lease_id: int,
    body: DepositCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Deposit:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")

    deposit = Deposit(lease_id=lease_id, **body.model_dump())
    db.add(deposit)
    db.commit()
    db.refresh(deposit)
    return deposit
