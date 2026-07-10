from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Tenant
from app.schemas.charges import ChargeResponse
from app.services.balance import (
    compute_paid_cents,
    compute_balance_cents,
    derive_charge_status,
)

router = APIRouter(prefix="/charges", tags=["charges"])


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
def list_charges_flat(
    tenant_id: int | None = Query(None),
    status: str | None = Query(None),
    overdue: bool | None = Query(None),
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[ChargeResponse]:
    q = select(Charge)
    if tenant_id is not None:
        q = q.where(Charge.tenant_id == tenant_id)

    charges = db.execute(q.order_by(Charge.charge_date.desc())).scalars().all()

    result = []
    for c in charges:
        paid = compute_paid_cents(db, c.id)
        balance = compute_balance_cents(c.amount_cents, paid)
        st = derive_charge_status(balance, paid, c.due_date)

        if status is not None and st != status:
            continue
        if overdue and st != "overdue":
            continue

        result.append(_build_charge_response(c, paid))

    return result
