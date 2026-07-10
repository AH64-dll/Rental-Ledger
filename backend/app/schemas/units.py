from __future__ import annotations

from pydantic import BaseModel, Field


class UnitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    notes: str | None = None


class UnitUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    notes: str | None = None


class UnitResponse(BaseModel):
    id: int
    property_id: int
    name: str
    notes: str | None

    model_config = {"from_attributes": True}
