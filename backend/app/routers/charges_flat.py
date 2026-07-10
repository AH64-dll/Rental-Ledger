from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge
from app.schemas.charges import ChargeResponse
from app.services.balance import (
    compute_paid_cents,
    compute_balance_cents,
    derive_charge_status,
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
    q = select(Charge)
    if tenant_id is not None:
        q = q.where(Charge.tenant_id == tenant_id)

    charges = db.execute(q.order_by(Charge.charge_date.desc())).scalars().all()

    result = []
    for c in charges:
        paid = compute_paid_cents(db, c.id)
        balance = compute_balance_cents(c.amount_cents, paid)
        st = derive_charge_status(balance, paid, c.due_date)

        if status_filter is not None and st != status_filter:
            continue
        if overdue and st != "overdue":
            continue

        result.append(build_charge_response(c, paid))

    return result
