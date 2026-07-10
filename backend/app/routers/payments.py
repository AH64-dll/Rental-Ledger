from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Payment
from app.schemas.payments import PaymentCreate, PaymentResponse, PaymentUpdate
from app.services.balance import compute_paid_cents

router = APIRouter(prefix="/charges/{charge_id}/payments", tags=["payments"])


@router.get("/", response_model=list[PaymentResponse])
def list_payments(
    charge_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[Payment]:
    charge = db.get(Charge, charge_id)
    if charge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found")
    return db.execute(
        select(Payment).where(Payment.charge_id == charge_id).order_by(Payment.payment_date.desc())
    ).scalars().all()


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    charge_id: int,
    body: PaymentCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Payment:
    charge = db.get(Charge, charge_id)
    if charge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found")

    currently_paid = compute_paid_cents(db, charge_id)
    remaining = charge.amount_cents - currently_paid
    if body.amount_cents > remaining:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Payment exceeds remaining balance. Maximum allowed: {remaining} cents.",
        )

    payment = Payment(charge_id=charge_id, **body.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
