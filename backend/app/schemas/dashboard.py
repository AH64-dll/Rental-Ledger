from pydantic import BaseModel


class DashboardResponse(BaseModel):
    active_leases: int
    overdue_charges: int
    total_owed_to_you_cents: int
    deposits_held_cents: int
    expiring_leases: int
