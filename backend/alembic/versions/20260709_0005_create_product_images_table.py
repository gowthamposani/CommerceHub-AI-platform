"""create product images table

Revision ID: 20260709_0005
Revises: 20260709_0004
Create Date: 2026-07-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260709_0005"
down_revision: str | None = "20260709_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply the migration."""
    op.create_table(
        "product_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("image_hash", sa.String(length=64), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=50), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("display_order >= 0", name="ck_product_images_display_order_non_negative"),
        sa.CheckConstraint("file_size <= 10485760", name="ck_product_images_max_file_size"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "image_hash", name="uq_product_images_product_hash"),
    )
    op.create_index("ix_product_images_display_order", "product_images", ["display_order"])
    op.create_index("ix_product_images_is_deleted", "product_images", ["is_deleted"])
    op.create_index("ix_product_images_is_primary", "product_images", ["is_primary"])
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])


def downgrade() -> None:
    """Rollback the migration."""
    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_index("ix_product_images_is_primary", table_name="product_images")
    op.drop_index("ix_product_images_is_deleted", table_name="product_images")
    op.drop_index("ix_product_images_display_order", table_name="product_images")
    op.drop_table("product_images")
