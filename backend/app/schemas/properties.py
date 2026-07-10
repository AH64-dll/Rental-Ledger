from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class UnitRef(BaseModel):
    id: int
    name: str
    notes: str | None

    model_config = {"from_attributes": True}


class PropertyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    address: str | None = None
    notes: str | None = None


class PropertyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = None
    notes: str | None = None


class PropertyResponse(BaseModel):
    id: int
    name: str
    address: str | None
    notes: str | None
    units: list[UnitRef] = []
    created_at: datetime

    model_config = {"from_attributes": True}
