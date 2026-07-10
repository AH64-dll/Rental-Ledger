from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class TenantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    notes: str | None = None


class TenantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    notes: str | None = None


class TenantResponse(BaseModel):
    id: int
    name: str
    email: str | None
    phone: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChargeSummary(BaseModel):
    id: int
    lease_id: int | None
    description: str
    amount_cents: int
    paid_cents: int
    balance_cents: int
    status: str
    due_date: date | None


class TenantBalanceResponse(BaseModel):
    net_balance_cents: int
    deposits_held_cents: int
    charges: list[ChargeSummary]
