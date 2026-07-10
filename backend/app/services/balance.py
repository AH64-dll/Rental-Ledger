from datetime import date

from sqlalchemy import select, func as sa_func
from sqlalchemy.orm import Session


def compute_paid_cents(db: Session, charge_id: int) -> int:
    from app.models import Payment

    result = db.execute(
        select(sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0)).where(
            Payment.charge_id == charge_id
        )
    ).scalar()
    return int(result)


def compute_balance_cents(amount_cents: int, paid_cents: int) -> int:
    if amount_cents >= 0:
        return amount_cents - paid_cents
    else:
        return amount_cents + paid_cents


def derive_charge_status(balance_cents: int, paid_cents: int, due_date: date | None) -> str:
    if balance_cents == 0:
        return "paid"
    is_past_due = due_date is not None and due_date < date.today()
    if is_past_due:
        return "overdue"
    if paid_cents > 0:
        return "partial"
    return "unpaid"


def compute_tenant_balance(db: Session, tenant_id: int) -> dict:
    from app.models import Charge, Deposit, Lease, Payment

    # Load all charges for the tenant with their accumulated payment sums
    charges_with_payments = db.execute(
        select(
            Charge.amount_cents,
            sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0).label("paid_cents")
        )
        .outerjoin(Payment)
        .where(Charge.tenant_id == tenant_id)
        .group_by(Charge.id)
    ).all()

    net_balance_cents = 0
    for amount_cents, paid_cents in charges_with_payments:
        paid = int(paid_cents)
        if amount_cents >= 0:
            net_balance_cents += amount_cents - paid
        else:
            net_balance_cents += amount_cents + paid

    deposits_result = db.execute(
        select(
            sa_func.coalesce(
                sa_func.sum(Deposit.amount_held_cents - Deposit.refunded_amount_cents), 0
            )
        )
        .join(Lease, Deposit.lease_id == Lease.id)
        .where(Lease.tenant_id == tenant_id, Deposit.status != "refunded")
    ).scalar()

    return {
        "net_balance_cents": net_balance_cents,
        "deposits_held_cents": int(deposits_result),
    }
