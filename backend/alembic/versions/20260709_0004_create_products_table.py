"""create products table

Revision ID: 20260709_0004
Revises: 20260709_0003
Create Date: 2026-07-09
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260709_0004"
down_revision: str | None = "20260709_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply the migration."""
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("seller_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("brand_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("product_slug", sa.String(length=255), nullable=False),
        sa.Column("short_description", sa.String(length=500), nullable=True),
        sa.Column("long_description", sa.Text(), nullable=True),
        sa.Column("sku", sa.String(length=100), nullable=False),
        sa.Column("barcode", sa.String(length=100), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("discount_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("cost_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("tax_percentage", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("weight", sa.Numeric(10, 3), nullable=True),
        sa.Column("length", sa.Numeric(10, 3), nullable=True),
        sa.Column("width", sa.Numeric(10, 3), nullable=True),
        sa.Column("height", sa.Numeric(10, 3), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("visibility", sa.String(length=30), nullable=False, server_default="private"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        sa.CheckConstraint("discount_price IS NULL OR discount_price >= 0", name="ck_products_discount_non_negative"),
        sa.CheckConstraint("cost_price IS NULL OR cost_price >= 0", name="ck_products_cost_non_negative"),
        sa.CheckConstraint(
            "discount_price IS NULL OR discount_price <= price",
            name="ck_products_discount_not_greater_than_price",
        ),
        sa.CheckConstraint("tax_percentage >= 0 AND tax_percentage <= 100", name="ck_products_tax_percentage_range"),
        sa.CheckConstraint("weight IS NULL OR weight >= 0", name="ck_products_weight_non_negative"),
        sa.CheckConstraint("length IS NULL OR length >= 0", name="ck_products_length_non_negative"),
        sa.CheckConstraint("width IS NULL OR width >= 0", name="ck_products_width_non_negative"),
        sa.CheckConstraint("height IS NULL OR height >= 0", name="ck_products_height_non_negative"),
        sa.ForeignKeyConstraint(["seller_id"], ["sellers.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["brand_id"], ["brands.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku", name="uq_products_sku"),
        sa.UniqueConstraint("barcode", name="uq_products_barcode"),
        sa.UniqueConstraint("product_slug", name="uq_products_product_slug"),
    )
    op.create_index("ix_products_brand_id", "products", ["brand_id"])
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_created_at", "products", ["created_at"])
    op.create_index("ix_products_is_active", "products", ["is_active"])
    op.create_index("ix_products_is_deleted", "products", ["is_deleted"])
    op.create_index("ix_products_product_name", "products", ["product_name"])
    op.create_index("ix_products_seller_id", "products", ["seller_id"])
    op.create_index("ix_products_status", "products", ["status"])


def downgrade() -> None:
    """Rollback the migration."""
    op.drop_index("ix_products_status", table_name="products")
    op.drop_index("ix_products_seller_id", table_name="products")
    op.drop_index("ix_products_product_name", table_name="products")
    op.drop_index("ix_products_is_deleted", table_name="products")
    op.drop_index("ix_products_is_active", table_name="products")
    op.drop_index("ix_products_created_at", table_name="products")
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_index("ix_products_brand_id", table_name="products")
    op.drop_table("products")
