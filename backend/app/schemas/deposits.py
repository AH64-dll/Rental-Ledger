from datetime import date

from pydantic import BaseModel, Field


class DepositCreate(BaseModel):
    amount_held_cents: int = Field(..., gt=0)
    collected_date: date
    notes: str | None = None


class DepositResponse(BaseModel):
    id: int
    lease_id: int
    amount_held_cents: int
    collected_date: date
    status: str
    refunded_amount_cents: int
    notes: str | None

    model_config = {"from_attributes": True}
