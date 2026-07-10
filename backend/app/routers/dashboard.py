from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func as sa_func
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Deposit, Lease
from app.schemas.dashboard import DashboardResponse
from app.services.balance import compute_balance_cents, compute_paid_cents

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardResponse)
def get_overview(
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> DashboardResponse:
    active_leases = db.execute(
        select(sa_func.count()).select_from(Lease).where(Lease.status == "active")
    ).scalar() or 0

    today = date.today()
    overdue_count = 0
    total_owed = 0

    charges = db.execute(select(Charge)).scalars().all()
    for c in charges:
        paid = compute_paid_cents(db, c.id)
        balance = compute_balance_cents(c.amount_cents, paid)
        if balance > 0:
            total_owed += balance
            if c.due_date and c.due_date < today:
                overdue_count += 1

    deposits_held = db.execute(
        select(sa_func.coalesce(sa_func.sum(Deposit.amount_held_cents - Deposit.refunded_amount_cents), 0))
        .where(Deposit.status != "refunded")
    ).scalar() or 0

    thirty_days = today + timedelta(days=30)
    expiring = db.execute(
        select(sa_func.count())
        .select_from(Lease)
        .where(
            Lease.status == "active",
            Lease.end_date >= today,
            Lease.end_date <= thirty_days,
        )
    ).scalar() or 0

    return DashboardResponse(
        active_leases=active_leases,
        overdue_charges=overdue_count,
        total_owed_to_you_cents=total_owed,
        deposits_held_cents=int(deposits_held),
        expiring_leases=expiring,
    )
