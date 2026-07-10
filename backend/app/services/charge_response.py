from app.models import Charge
from app.schemas.charges import ChargeResponse
from app.services.balance import (
    compute_balance_cents,
    derive_charge_status,
)


def build_charge_response(charge: Charge, paid_cents: int) -> ChargeResponse:
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
