from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class ChargeCreate(BaseModel):
    description: str = Field(min_length=1)
    amount_cents: int = Field(gt=0)
    charge_date: date
    due_date: date | None = None
    category: str = "other"


class ChargeUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1)
    amount_cents: int | None = Field(default=None, gt=0)
    due_date: date | None = None


class ChargeResponse(BaseModel):
    id: int
    lease_id: int
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
