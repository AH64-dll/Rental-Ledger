from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func as sa_func, case as sa_case
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Deposit, Lease, Payment
from app.schemas.dashboard import DashboardResponse
from app.services.lease import lazy_expire_leases

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardResponse)
def get_overview(
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> DashboardResponse:
    lazy_expire_leases(db)
    active_leases = db.scalar(
        select(sa_func.count()).select_from(Lease).where(Lease.status == "active")
    ) or 0

    today = date.today()

    balance_subquery = (
        select(
            Charge.id,
            Charge.due_date,
            Charge.amount_cents,
            sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0).label("paid_cents"),
            (
                sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0)
                * sa_case((Charge.amount_cents < 0, -1), else_=1)
                + Charge.amount_cents
            ).label("balance"),
        )
        .outerjoin(Payment, Payment.charge_id == Charge.id)
        .group_by(Charge.id)
    ).subquery()

    total_owed = db.scalar(
        select(sa_func.coalesce(sa_func.sum(balance_subquery.c.balance), 0))
        .where(balance_subquery.c.balance > 0)
    ) or 0

    overdue_count = db.scalar(
        select(sa_func.count())
        .select_from(balance_subquery)
        .where(
            balance_subquery.c.balance > 0,
            balance_subquery.c.due_date.isnot(None),
            balance_subquery.c.due_date < today,
        )
    ) or 0

    deposits_held = db.scalar(
        select(
            sa_func.coalesce(
                sa_func.sum(Deposit.amount_held_cents - Deposit.refunded_amount_cents), 0
            )
        ).where(Deposit.status != "refunded")
    ) or 0

    thirty_days = today + timedelta(days=30)
    expiring = db.scalar(
        select(sa_func.count())
        .select_from(Lease)
        .where(
            Lease.status == "active",
            Lease.end_date >= today,
            Lease.end_date <= thirty_days,
        )
    ) or 0

    return DashboardResponse(
        active_leases=active_leases,
        overdue_charges=overdue_count,
        total_owed_to_you_cents=int(total_owed),
        deposits_held_cents=int(deposits_held),
        expiring_leases=expiring,
    )
