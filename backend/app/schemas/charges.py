from __future__ import annotations

from datetime import date, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field


def _not_zero(v: int) -> int:
    if v == 0:
        raise ValueError("amount_cents must not be zero")
    return v


NonZeroCents = Annotated[int, AfterValidator(_not_zero)]


class ChargeCreate(BaseModel):
    description: str = Field(min_length=1)
    amount_cents: NonZeroCents
    charge_date: date
    due_date: date | None = None
    category: str = "other"


class ChargeCreateFlat(BaseModel):
    tenant_id: int
    lease_id: int | None = None
    description: str = Field(min_length=1)
    amount_cents: NonZeroCents
    charge_date: date
    due_date: date | None = None
    category: str = "other"


class ChargeUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1)
    amount_cents: NonZeroCents | None = None
    due_date: date | None = None


class ChargeResponse(BaseModel):
    id: int
    lease_id: int | None
    tenant_id: int
    description: str
    amount_cents: int
    charge_date: date
    due_date: date | None
    category: str
    late_fee_applied: bool
    paid_cents: int
    balance_cents: int
    status: str
    tenant_name: str
    created_at: datetime

    model_config = {"from_attributes": True}
