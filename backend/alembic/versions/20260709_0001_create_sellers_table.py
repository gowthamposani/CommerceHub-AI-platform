"""create sellers table

Revision ID: 20260709_0001
Revises:
Create Date: 2026-07-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260709_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply the migration."""
    op.create_table(
        "sellers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("business_name", sa.String(length=255), nullable=False),
        sa.Column("legal_business_name", sa.String(length=255), nullable=True),
        sa.Column("business_type", sa.String(length=50), nullable=False),
        sa.Column("business_email", sa.String(length=255), nullable=False),
        sa.Column("business_phone", sa.String(length=20), nullable=False),
        sa.Column("gst_number", sa.String(length=15), nullable=False),
        sa.Column("pan_number", sa.String(length=10), nullable=False),
        sa.Column("tax_identification_number", sa.String(length=50), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("address_line_1", sa.String(length=255), nullable=False),
        sa.Column("address_line_2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("country", sa.String(length=100), nullable=False),
        sa.Column("postal_code", sa.String(length=20), nullable=False),
        sa.Column("account_holder_name", sa.String(length=255), nullable=False),
        sa.Column("bank_name", sa.String(length=255), nullable=False),
        sa.Column("account_number", sa.String(length=34), nullable=False),
        sa.Column("ifsc_code", sa.String(length=11), nullable=False),
        sa.Column("branch_name", sa.String(length=255), nullable=True),
        sa.Column("default_currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("order_auto_accept_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("business_email", name="uq_sellers_business_email"),
        sa.UniqueConstraint("gst_number", name="uq_sellers_gst_number"),
        sa.UniqueConstraint("pan_number", name="uq_sellers_pan_number"),
    )
    op.create_index("ix_sellers_business_email", "sellers", ["business_email"])
    op.create_index("ix_sellers_business_name", "sellers", ["business_name"])
    op.create_index("ix_sellers_gst_number", "sellers", ["gst_number"])
    op.create_index("ix_sellers_is_active", "sellers", ["is_active"])
    op.create_index("ix_sellers_is_deleted", "sellers", ["is_deleted"])
    op.create_index("ix_sellers_pan_number", "sellers", ["pan_number"])
    op.create_index("ix_sellers_status", "sellers", ["status"])
    op.create_index("ix_sellers_user_id", "sellers", ["user_id"])


def downgrade() -> None:
    """Rollback the migration."""
    op.drop_index("ix_sellers_user_id", table_name="sellers")
    op.drop_index("ix_sellers_status", table_name="sellers")
    op.drop_index("ix_sellers_pan_number", table_name="sellers")
    op.drop_index("ix_sellers_is_deleted", table_name="sellers")
    op.drop_index("ix_sellers_is_active", table_name="sellers")
    op.drop_index("ix_sellers_gst_number", table_name="sellers")
    op.drop_index("ix_sellers_business_name", table_name="sellers")
    op.drop_index("ix_sellers_business_email", table_name="sellers")
    op.drop_table("sellers")
