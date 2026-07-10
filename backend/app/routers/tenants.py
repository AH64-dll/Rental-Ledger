from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.db import get_db
from app.models import Charge, Lease, Tenant
from app.schemas.tenants import (
    ChargeSummary,
    TenantBalanceResponse,
    TenantCreate,
    TenantResponse,
    TenantUpdate,
)
from app.services.balance import (
    compute_paid_cents,
    compute_balance_cents,
    compute_tenant_balance,
    derive_charge_status,
)

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/", response_model=list[TenantResponse])
def list_tenants(
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> list[Tenant]:
    return db.execute(select(Tenant).order_by(Tenant.name)).scalars().all()


@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
def create_tenant(
    body: TenantCreate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Tenant:
    tenant = Tenant(**body.model_dump())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Tenant:
    tenant = db.get(Tenant, tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
def update_tenant(
    tenant_id: int,
    body: TenantUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> Tenant:
    tenant = db.get(Tenant, tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> None:
    tenant = db.get(Tenant, tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    active_leases = db.execute(
        select(Lease).where(Lease.tenant_id == tenant_id, Lease.status == "active")
    ).first()
    if active_leases:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete tenant with active leases. End the leases first.",
        )
    db.delete(tenant)
    db.commit()


@router.get("/{tenant_id}/balance", response_model=TenantBalanceResponse)
def get_tenant_balance(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(current_user),
) -> TenantBalanceResponse:
    tenant = db.get(Tenant, tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    balance = compute_tenant_balance(db, tenant_id)

    charges_q = db.execute(
        select(Charge).where(Charge.tenant_id == tenant_id).order_by(Charge.charge_date)
    ).scalars().all()

    charge_summaries = []
    for c in charges_q:
        paid = compute_paid_cents(db, c.id)
        balance_c = compute_balance_cents(c.amount_cents, paid)
        st = derive_charge_status(balance_c, paid, c.due_date)
        charge_summaries.append(
            ChargeSummary(
                description=c.description,
                amount_cents=c.amount_cents,
                paid_cents=paid,
                balance_cents=balance_c,
                status=st,
                due_date=c.due_date,
            )
        )

    return TenantBalanceResponse(
        net_balance_cents=balance["net_balance_cents"],
        deposits_held_cents=balance["deposits_held_cents"],
        charges=charge_summaries,
    )
