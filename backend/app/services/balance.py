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
    return amount_cents - paid_cents


def derive_charge_status(balance_cents: int, paid_cents: int, due_date: date | None) -> str:
    if balance_cents == 0:
        return "paid"
    is_past_due = due_date is not None and due_date < date.today()
    if is_past_due:
        return "overdue"
    if paid_cents > 0 and balance_cents > 0:
        return "partial"
    return "unpaid"


def compute_tenant_balance(db: Session, tenant_id: int) -> dict:
    from app.models import Charge, Deposit, Lease, Payment

    charges_result = db.execute(
        select(sa_func.coalesce(sa_func.sum(Charge.amount_cents), 0)).where(
            Charge.tenant_id == tenant_id
        )
    ).scalar()

    payments_result = db.execute(
        select(sa_func.coalesce(sa_func.sum(Payment.amount_cents), 0))
        .join(Charge, Payment.charge_id == Charge.id)
        .where(Charge.tenant_id == tenant_id)
    ).scalar()

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
        "net_balance_cents": int(charges_result) - int(payments_result),
        "deposits_held_cents": int(deposits_result),
    }
