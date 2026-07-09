"""create brands table

Revision ID: 20260709_0003
Revises: 20260709_0002
Create Date: 2026-07-09
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260709_0003"
down_revision: str | None = "20260709_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply the migration."""
    op.create_table(
        "brands",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("brand_name", sa.String(length=255), nullable=False),
        sa.Column("brand_slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("country_of_origin", sa.String(length=100), nullable=True),
        sa.Column("founded_year", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="active"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("founded_year IS NULL OR founded_year >= 1800", name="ck_brands_founded_year_min"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("brand_name", name="uq_brands_brand_name"),
        sa.UniqueConstraint("brand_slug", name="uq_brands_brand_slug"),
    )
    op.create_index("ix_brands_brand_name", "brands", ["brand_name"])
    op.create_index("ix_brands_brand_slug", "brands", ["brand_slug"])
    op.create_index("ix_brands_created_at", "brands", ["created_at"])
    op.create_index("ix_brands_is_active", "brands", ["is_active"])
    op.create_index("ix_brands_is_deleted", "brands", ["is_deleted"])
    op.create_index("ix_brands_status", "brands", ["status"])


def downgrade() -> None:
    """Rollback the migration."""
    op.drop_index("ix_brands_status", table_name="brands")
    op.drop_index("ix_brands_is_deleted", table_name="brands")
    op.drop_index("ix_brands_is_active", table_name="brands")
    op.drop_index("ix_brands_created_at", table_name="brands")
    op.drop_index("ix_brands_brand_slug", table_name="brands")
    op.drop_index("ix_brands_brand_name", table_name="brands")
    op.drop_table("brands")
