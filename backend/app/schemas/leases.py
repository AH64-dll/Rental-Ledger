from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class LeaseCreate(BaseModel):
    unit_id: int
    tenant_id: int
    start_date: date
    end_date: date
    monthly_rent_cents: int = Field(gt=0)
    rent_due_day_of_month: int = Field(ge=1, le=28)
    late_fee_percent: float = Field(ge=0, default=0)
    security_deposit_cents: int = Field(ge=0, default=0)


class LeaseUpdate(BaseModel):
    monthly_rent_cents: int | None = Field(default=None, gt=0)
    rent_due_day_of_month: int | None = Field(default=None, ge=1, le=28)
    late_fee_percent: float | None = Field(default=None, ge=0)
    security_deposit_cents: int | None = Field(default=None, ge=0)


class LeaseResponse(BaseModel):
    id: int
    unit_id: int
    tenant_id: int
    start_date: date
    end_date: date
    monthly_rent_cents: int
    rent_due_day_of_month: int
    late_fee_percent: float
    security_deposit_cents: int
    status: str
    tenant_name: str
    unit_name: str
    created_at: datetime

    model_config = {"from_attributes": True}
