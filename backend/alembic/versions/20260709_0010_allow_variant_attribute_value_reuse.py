"""Allow variant attribute value reuse.

Revision ID: 20260709_0010
Revises: 20260709_0009
Create Date: 2026-07-09
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260709_0010"
down_revision: str | None = "20260709_0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Allow allowed values and variant selections to share the same value."""
    op.drop_constraint(
        "uq_product_attribute_values_attribute_value",
        "product_attribute_values",
        type_="unique",
    )


def downgrade() -> None:
    """Restore unique allowed value constraint."""
    op.create_unique_constraint(
        "uq_product_attribute_values_attribute_value",
        "product_attribute_values",
        ["attribute_id", "value"],
    )
