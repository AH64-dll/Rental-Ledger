from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Lease, Payment, Tenant
from app.schemas.charges import ChargeCreate, ChargeResponse, ChargeUpdate
from app.services.balance import (
    compute_paid_cents,
    compute_balance_cents,
    derive_charge_status,
)

router = APIRouter(prefix="/leases/{lease_id}/charges", tags=["charges"])


def _build_charge_response(charge: Charge, paid_cents: int) -> ChargeResponse:
    balance_cents = compute_balance_cents(charge.amount_cents, paid_cents)
    return ChargeResponse(
        id=charge.id,
        lease_id=charge.lease_id,
        tenant_id=charge.tenant_id,
        description=charge.description,
        amount_cents=charge.amount_cents,
        charge_date=charge.charge_date,
        due_date=charge.due_date,
        category=charge.category.value if hasattr(charge.category, "value") else charge.category,
        late_fee_applied=charge.late_fee_applied,
        paid_cents=paid_cents,
        balance_cents=balance_cents,
        status=derive_charge_status(balance_cents, paid_cents, charge.due_date),
        tenant_name=charge.tenant_relation.name if charge.tenant_relation else "",
        created_at=charge.created_at,
    )


@router.get("/", response_model=list[ChargeResponse])
def list_charges(
    lease_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[ChargeResponse]:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")

    charges = db.execute(
        select(Charge)
        .where(Charge.lease_id == lease_id)
        .order_by(Charge.charge_date.desc())
    ).scalars().all()

    result = []
    for c in charges:
        paid = compute_paid_cents(db, c.id)
        result.append(_build_charge_response(c, paid))
    return result


@router.post("/", response_model=ChargeResponse, status_code=status.HTTP_201_CREATED)
def create_charge(
    lease_id: int,
    body: ChargeCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> ChargeResponse:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")

    charge = Charge(
        lease_id=lease_id,
        tenant_id=lease.tenant_id,
        description=body.description,
        amount_cents=body.amount_cents,
        charge_date=body.charge_date,
        due_date=body.due_date,
        category=body.category,
    )
    db.add(charge)
    db.commit()
    db.refresh(charge)

    db.refresh(charge, attribute_names=["tenant_relation"])
    return _build_charge_response(charge, 0)


@router.get("/{charge_id}", response_model=ChargeResponse)
def get_charge(
    lease_id: int,
    charge_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> ChargeResponse:
    charge = db.get(Charge, charge_id)
    if charge is None or charge.lease_id != lease_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found")
    paid = compute_paid_cents(db, charge.id)
    return _build_charge_response(charge, paid)


@router.put("/{charge_id}", response_model=ChargeResponse)
def update_charge(
    lease_id: int,
    charge_id: int,
    body: ChargeUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> ChargeResponse:
    charge = db.get(Charge, charge_id)
    if charge is None or charge.lease_id != lease_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(charge, key, value)
    db.commit()
    db.refresh(charge)
    paid = compute_paid_cents(db, charge.id)
    return _build_charge_response(charge, paid)


@router.delete("/{charge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_charge(
    lease_id: int,
    charge_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    charge = db.get(Charge, charge_id)
    if charge is None or charge.lease_id != lease_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found")
    existing_payments = db.execute(
        select(Payment).where(Payment.charge_id == charge_id)
    ).first()
    if existing_payments:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete charge with payments. Delete the payments first.",
        )
    db.delete(charge)
    db.commit()
