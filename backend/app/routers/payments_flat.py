from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func as sa_func
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Payment
from app.schemas.payments import PaymentResponse, PaymentUpdate

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Payment:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int,
    body: PaymentUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Payment:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if body.amount_cents is not None:
        charge = db.get(Charge, payment.charge_id)
        if charge is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found")
        paid_excluding_current = db.execute(
            select(sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0))
            .where(Payment.charge_id == charge.id, Payment.id != payment_id)
        ).scalar()
        remaining = charge.amount_cents - int(paid_excluding_current)
        if body.amount_cents > remaining:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Payment exceeds remaining balance. Maximum allowed: {remaining} cents.",
            )

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(payment, key, value)
    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    db.delete(payment)
    db.commit()
