"""create categories table

Revision ID: 20260709_0002
Revises: 20260709_0001
Create Date: 2026-07-09
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260709_0002"
down_revision: str | None = "20260709_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply the migration."""
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_category_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("category_name", sa.String(length=255), nullable=False),
        sa.Column("category_slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="active"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("display_order >= 0", name="ck_categories_display_order_non_negative"),
        sa.ForeignKeyConstraint(["parent_category_id"], ["categories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("category_name", name="uq_categories_category_name"),
        sa.UniqueConstraint("category_slug", name="uq_categories_category_slug"),
    )
    op.create_index("ix_categories_category_name", "categories", ["category_name"])
    op.create_index("ix_categories_category_slug", "categories", ["category_slug"])
    op.create_index("ix_categories_display_order", "categories", ["display_order"])
    op.create_index("ix_categories_is_active", "categories", ["is_active"])
    op.create_index("ix_categories_is_deleted", "categories", ["is_deleted"])
    op.create_index("ix_categories_parent_category_id", "categories", ["parent_category_id"])
    op.create_index("ix_categories_status", "categories", ["status"])


def downgrade() -> None:
    """Rollback the migration."""
    op.drop_index("ix_categories_status", table_name="categories")
    op.drop_index("ix_categories_parent_category_id", table_name="categories")
    op.drop_index("ix_categories_is_deleted", table_name="categories")
    op.drop_index("ix_categories_is_active", table_name="categories")
    op.drop_index("ix_categories_display_order", table_name="categories")
    op.drop_index("ix_categories_category_slug", table_name="categories")
    op.drop_index("ix_categories_category_name", table_name="categories")
    op.drop_table("categories")
