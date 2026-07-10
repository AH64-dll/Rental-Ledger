"""make_lease_id_nullable_on_charges

Revision ID: 14aa0e4e624e
Revises: c7f6f3e3b9e7
Create Date: 2026-07-10 16:07:03.912943

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14aa0e4e624e'
down_revision: Union[str, None] = 'c7f6f3e3b9e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('charges', schema=None) as batch_op:
        batch_op.alter_column('lease_id', existing_type=sa.INTEGER(), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('charges', schema=None) as batch_op:
        batch_op.alter_column('lease_id', existing_type=sa.INTEGER(), nullable=False)
