from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select, func as sa_func
from sqlalchemy.orm import Session, joinedload

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Lease, Payment, Tenant
from app.schemas.charges import ChargeCreateFlat, ChargeResponse, ChargeUpdate
from app.services.balance import (
    compute_paid_cents,
)
from app.services.charge_response import build_charge_response

router = APIRouter(prefix="/charges", tags=["charges"])


@router.get("/", response_model=list[ChargeResponse])
def list_charges_flat(
    tenant_id: int | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    overdue: bool | None = Query(None),
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[ChargeResponse]:
    q = (
        select(
            Charge,
            sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0).label("paid_cents")
        )
        .outerjoin(Payment)
        .group_by(Charge.id)
    )

    if tenant_id is not None:
        q = q.where(Charge.tenant_id == tenant_id)

    if status_filter or overdue:
        inner = (
            select(Charge.id)
            .outerjoin(Payment, Payment.charge_id == Charge.id)
            .group_by(Charge.id)
        )
        if status_filter == "paid":
            inner = inner.having(
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0) == Charge.amount_cents
            )
        elif status_filter == "overdue":
            inner = inner.having(
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0) < Charge.amount_cents,
                Charge.due_date.isnot(None),
                Charge.due_date < date.today(),
            )
        elif status_filter == "partial":
            inner = inner.having(
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0) > 0,
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0) < Charge.amount_cents,
            )
        elif status_filter == "unpaid":
            inner = inner.having(
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0) == 0,
                or_(Charge.due_date.is_(None), Charge.due_date >= date.today()),
            )
        if overdue:
            inner = inner.having(
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0) < Charge.amount_cents,
                Charge.due_date.isnot(None),
                Charge.due_date < date.today(),
            )
        q = q.where(Charge.id.in_(inner))

    q = q.options(joinedload(Charge.tenant_relation))
    q = q.order_by(Charge.charge_date.desc())

    charges_results = db.execute(q).all()

    result = []
    for c, paid_cents in charges_results:
        paid = int(paid_cents)
        result.append(build_charge_response(c, paid))

    return result


@router.post("/", response_model=ChargeResponse, status_code=status.HTTP_201_CREATED)
def create_charge_flat(
    body: ChargeCreateFlat,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> ChargeResponse:
    tenant = db.get(Tenant, body.tenant_id)
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )

    if body.lease_id is not None:
        lease = db.get(Lease, body.lease_id)
        if lease is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found"
            )
        if lease.tenant_id != body.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lease does not belong to the tenant",
            )

    charge = Charge(
        tenant_id=body.tenant_id,
        lease_id=body.lease_id,
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
    return build_charge_response(charge, 0)


@router.get("/{charge_id}", response_model=ChargeResponse)
def get_charge_flat(
    charge_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> ChargeResponse:
    charge = db.get(Charge, charge_id)
    if charge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found"
        )
    paid = compute_paid_cents(db, charge.id)
    return build_charge_response(charge, paid)


@router.put("/{charge_id}", response_model=ChargeResponse)
def update_charge_flat(
    charge_id: int,
    body: ChargeUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> ChargeResponse:
    charge = db.get(Charge, charge_id)
    if charge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found"
        )
    paid = compute_paid_cents(db, charge.id)
    if body.amount_cents is not None and abs(body.amount_cents) < paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update charge amount to be less than the amount already paid",
        )
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(charge, key, value)
    db.commit()
    db.refresh(charge)
    return build_charge_response(charge, paid)


@router.delete("/{charge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_charge_flat(
    charge_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    charge = db.get(Charge, charge_id)
    if charge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Charge not found"
        )
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
