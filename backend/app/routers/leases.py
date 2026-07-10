from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Lease, LeaseStatus, Tenant, Property
from app.schemas.leases import LeaseCreate, LeaseResponse, LeaseUpdate
from app.services.lease import lazy_expire_leases

router = APIRouter(prefix="/leases", tags=["leases"])


def _build_lease_response(lease: Lease) -> LeaseResponse:
    return LeaseResponse(
        id=lease.id,
        property_id=lease.property_id,
        tenant_id=lease.tenant_id,
        start_date=lease.start_date,
        end_date=lease.end_date,
        monthly_rent_cents=lease.monthly_rent_cents,
        rent_due_day_of_month=lease.rent_due_day_of_month,
        late_fee_percent=float(lease.late_fee_percent),
        security_deposit_cents=lease.security_deposit_cents,
        status=lease.status.value if hasattr(lease.status, "value") else lease.status,
        tenant_name=lease.tenant.name if lease.tenant else "",
        property_name=lease.property.name if lease.property else "",
        created_at=lease.created_at,
    )


@router.get("/", response_model=list[LeaseResponse])
def list_leases(
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[LeaseResponse]:
    lazy_expire_leases(db)
    leases = db.execute(
        select(Lease)
        .options(joinedload(Lease.tenant), joinedload(Lease.property))
        .order_by(Lease.created_at.desc())
    ).unique().scalars().all()
    return [_build_lease_response(lease) for lease in leases]


@router.post("/", response_model=LeaseResponse, status_code=status.HTTP_201_CREATED)
def create_lease(
    body: LeaseCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> LeaseResponse:
    property_obj = db.get(Property, body.property_id)
    if property_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    tenant = db.get(Tenant, body.tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    conflict = db.execute(
        select(Lease).where(
            Lease.property_id == body.property_id,
            Lease.status == LeaseStatus.ACTIVE,
            Lease.start_date <= body.end_date,
            Lease.end_date >= body.start_date,
        )
    ).scalars().first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property is already occupied during this period.",
        )

    lease = Lease(
        property_id=body.property_id,
        tenant_id=body.tenant_id,
        start_date=body.start_date,
        end_date=body.end_date,
        monthly_rent_cents=body.monthly_rent_cents,
        rent_due_day_of_month=body.rent_due_day_of_month,
        late_fee_percent=body.late_fee_percent,
        security_deposit_cents=body.security_deposit_cents,
    )
    db.add(lease)
    db.commit()
    db.refresh(lease)
    return _build_lease_response(lease)


@router.get("/{lease_id}", response_model=LeaseResponse)
def get_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> LeaseResponse:
    lazy_expire_leases(db)
    lease = db.execute(
        select(Lease)
        .options(joinedload(Lease.tenant), joinedload(Lease.property))
        .where(Lease.id == lease_id)
    ).unique().scalar_one_or_none()
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
    return _build_lease_response(lease)


@router.put("/{lease_id}", response_model=LeaseResponse)
def update_lease(
    lease_id: int,
    body: LeaseUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> LeaseResponse:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lease, key, value)
    db.commit()
    db.refresh(lease)
    return _build_lease_response(lease)


@router.delete("/{lease_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
    existing_charges = db.execute(
        select(Charge).where(Charge.lease_id == lease_id)
    ).first()
    if existing_charges:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete lease with existing charges. Delete the charges first.",
        )
    db.delete(lease)
    db.commit()


@router.post("/{lease_id}/end", response_model=LeaseResponse)
def end_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> LeaseResponse:
    lease = db.get(Lease, lease_id)
    if lease is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
    if lease.status != LeaseStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Lease is already {lease.status.value}.",
        )
    lease.status = LeaseStatus.ENDED
    db.commit()
    db.refresh(lease)
    return _build_lease_response(lease)
