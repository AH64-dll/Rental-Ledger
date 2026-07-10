from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Property, Unit
from app.schemas.properties import PropertyCreate, PropertyResponse, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["properties"])


def _property_to_response(prop: Property) -> dict:
    data = {c.key: getattr(prop, c.key) for c in prop.__table__.columns}
    data["units"] = [
        {"id": u.id, "name": u.name, "notes": u.notes}
        for u in prop.units
    ]
    return data


@router.get("/", response_model=list[PropertyResponse])
def list_properties(
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[dict]:
    props = db.execute(select(Property).order_by(Property.name)).scalars().all()
    return [_property_to_response(p) for p in props]


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    body: PropertyCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> dict:
    prop = Property(**body.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return _property_to_response(prop)


@router.get("/{prop_id}", response_model=PropertyResponse)
def get_property(
    prop_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> dict:
    prop = db.get(Property, prop_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return _property_to_response(prop)


@router.put("/{prop_id}", response_model=PropertyResponse)
def update_property(
    prop_id: int,
    body: PropertyUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> dict:
    prop = db.get(Property, prop_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prop, key, value)
    db.commit()
    db.refresh(prop)
    return _property_to_response(prop)


@router.delete("/{prop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    prop_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    prop = db.get(Property, prop_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    existing_units = db.execute(
        select(Unit).where(Unit.property_id == prop_id)
    ).first()
    if existing_units:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete property with existing units. Delete the units first.",
        )
    db.delete(prop)
    db.commit()
