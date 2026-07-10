from datetime import date

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models import Lease, LeaseStatus


def lazy_expire_leases(db: Session) -> int:
    result = db.execute(
        update(Lease)
        .where(
            Lease.status == LeaseStatus.ACTIVE,
            Lease.end_date < date.today(),
        )
        .values(status=LeaseStatus.EXPIRED)
    )
    if result.rowcount:
        db.commit()
    return result.rowcount
