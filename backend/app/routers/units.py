from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Lease, Property, Unit
from app.schemas.units import UnitCreate, UnitResponse, UnitUpdate

router = APIRouter(prefix="/properties/{property_id}/units", tags=["units"])


def _get_property_or_404(db: Session, property_id: int) -> Property:
    prop = db.get(Property, property_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop


@router.get("/", response_model=list[UnitResponse])
def list_units(
    property_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[Unit]:
    _get_property_or_404(db, property_id)
    return db.execute(
        select(Unit).where(Unit.property_id == property_id).order_by(Unit.name)
    ).scalars().all()


@router.post("/", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
def create_unit(
    property_id: int,
    body: UnitCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Unit:
    _get_property_or_404(db, property_id)
    unit = Unit(property_id=property_id, **body.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.get("/{unit_id}", response_model=UnitResponse)
def get_unit(
    property_id: int,
    unit_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Unit:
    _get_property_or_404(db, property_id)
    unit = db.get(Unit, unit_id)
    if unit is None or unit.property_id != property_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
    return unit


@router.put("/{unit_id}", response_model=UnitResponse)
def update_unit(
    property_id: int,
    unit_id: int,
    body: UnitUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Unit:
    _get_property_or_404(db, property_id)
    unit = db.get(Unit, unit_id)
    if unit is None or unit.property_id != property_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(unit, key, value)
    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit(
    property_id: int,
    unit_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    _get_property_or_404(db, property_id)
    unit = db.get(Unit, unit_id)
    if unit is None or unit.property_id != property_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
    any_lease = db.execute(
        select(Lease).where(Lease.unit_id == unit_id)
    ).first()
    if any_lease:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete unit with tenancy history.",
        )
    db.delete(unit)
    db.commit()
