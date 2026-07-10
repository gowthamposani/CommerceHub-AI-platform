"""Enable warehouse inventory transfers.

Revision ID: 20260709_0009
Revises: 20260709_0008
Create Date: 2026-07-09 16:30:00.000000
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260709_0009"
down_revision: str | None = "20260709_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Allow one inventory record per variant per warehouse."""
    op.drop_constraint("uq_inventory_variant_id", "inventory", type_="unique")
    op.create_unique_constraint(
        "uq_inventory_variant_warehouse",
        "inventory",
        ["variant_id", "warehouse_id"],
    )


def downgrade() -> None:
    """Restore single inventory record per variant."""
    op.drop_constraint("uq_inventory_variant_warehouse", "inventory", type_="unique")
    op.create_unique_constraint("uq_inventory_variant_id", "inventory", ["variant_id"])
