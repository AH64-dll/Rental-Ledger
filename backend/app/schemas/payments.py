from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    amount_cents: int = Field(gt=0)
    payment_date: date
    method: str | None = None
    notes: str | None = None


class PaymentUpdate(BaseModel):
    amount_cents: int | None = Field(default=None, gt=0)
    payment_date: date | None = None
    method: str | None = None
    notes: str | None = None


class PaymentResponse(BaseModel):
    id: int
    charge_id: int
    amount_cents: int
    payment_date: date
    method: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
