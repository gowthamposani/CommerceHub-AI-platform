"""Create customer addresses table.

Revision ID: 0002_customer_addresses
Revises: 0001_auth_initial
Create Date: 2026-07-09 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID

# revision identifiers, used by Alembic.
revision = "0002_customer_addresses"
down_revision = "0001_auth_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "addresses",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("customer_id", PGUUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("address_line_1", sa.String(length=255), nullable=False),
        sa.Column("address_line_2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("postal_code", sa.String(length=20), nullable=False),
        sa.Column("country", sa.String(length=100), nullable=False),
        sa.Column("phone_number", sa.String(length=30), nullable=True),
        sa.Column(
            "is_default",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index("ix_addresses_customer_id", "addresses", ["customer_id"], unique=False)
    op.create_index("ix_addresses_is_default", "addresses", ["is_default"], unique=False)
    op.create_index(
        "uq_addresses_customer_default",
        "addresses",
        ["customer_id"],
        unique=True,
        postgresql_where=sa.text("is_default"),
    )


def downgrade() -> None:
    op.drop_index("uq_addresses_customer_default", table_name="addresses")
    op.drop_index("ix_addresses_is_default", table_name="addresses")
    op.drop_index("ix_addresses_customer_id", table_name="addresses")
    op.drop_table("addresses")
