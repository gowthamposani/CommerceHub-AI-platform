"""Create product extension tables.

Revision ID: 20260709_0006
Revises: 20260709_0005
Create Date: 2026-07-09 14:30:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260709_0006"
down_revision: str | None = "20260709_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _uuid_column(name: str = "id", *, primary_key: bool = False, nullable: bool = False) -> sa.Column:
    """Return a UUID column compatible with the project migration style."""
    return sa.Column(name, postgresql.UUID(as_uuid=True), primary_key=primary_key, nullable=nullable)


def _timestamps() -> list[sa.Column]:
    """Return standard timestamp columns."""
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    ]


def upgrade() -> None:
    """Create product extension tables."""
    op.create_table(
        "product_variants",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        sa.Column("sku", sa.String(length=100), nullable=False),
        sa.Column("barcode", sa.String(length=100), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("discount_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("cost_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("weight", sa.Numeric(10, 3), nullable=True),
        sa.Column("length", sa.Numeric(10, 3), nullable=True),
        sa.Column("width", sa.Numeric(10, 3), nullable=True),
        sa.Column("height", sa.Numeric(10, 3), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("variant_signature", sa.String(length=500), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("sku", name="uq_product_variants_sku"),
        sa.UniqueConstraint("barcode", name="uq_product_variants_barcode"),
        sa.UniqueConstraint("product_id", "variant_signature", name="uq_product_variants_signature"),
        sa.CheckConstraint("price >= 0", name="ck_product_variants_price_non_negative"),
        sa.CheckConstraint("discount_price IS NULL OR discount_price >= 0", name="ck_product_variants_discount_non_negative"),
        sa.CheckConstraint("cost_price IS NULL OR cost_price >= 0", name="ck_product_variants_cost_non_negative"),
        sa.CheckConstraint(
            "discount_price IS NULL OR discount_price <= price",
            name="ck_product_variants_discount_not_greater_than_price",
        ),
        sa.CheckConstraint("weight IS NULL OR weight >= 0", name="ck_product_variants_weight_non_negative"),
        sa.CheckConstraint("length IS NULL OR length >= 0", name="ck_product_variants_length_non_negative"),
        sa.CheckConstraint("width IS NULL OR width >= 0", name="ck_product_variants_width_non_negative"),
        sa.CheckConstraint("height IS NULL OR height >= 0", name="ck_product_variants_height_non_negative"),
    )
    op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"])
    op.create_index("ix_product_variants_sku", "product_variants", ["sku"])
    op.create_index("ix_product_variants_barcode", "product_variants", ["barcode"])
    op.create_index("ix_product_variants_status", "product_variants", ["status"])
    op.create_index("ix_product_variants_is_deleted", "product_variants", ["is_deleted"])

    op.create_table(
        "product_attributes",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        sa.Column("attribute_name", sa.String(length=100), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_variant_defining", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "attribute_name", name="uq_product_attributes_product_name"),
    )
    op.create_index("ix_product_attributes_product_id", "product_attributes", ["product_id"])
    op.create_index("ix_product_attributes_attribute_name", "product_attributes", ["attribute_name"])
    op.create_index("ix_product_attributes_is_deleted", "product_attributes", ["is_deleted"])

    op.create_table(
        "product_attribute_values",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        _uuid_column("attribute_id"),
        _uuid_column("variant_id", nullable=True),
        sa.Column("value", sa.String(length=150), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        *_timestamps(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["attribute_id"], ["product_attributes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("attribute_id", "value", name="uq_product_attribute_values_attribute_value"),
        sa.UniqueConstraint("variant_id", "attribute_id", name="uq_product_attribute_values_variant_attribute"),
    )
    op.create_index("ix_product_attribute_values_product_id", "product_attribute_values", ["product_id"])
    op.create_index("ix_product_attribute_values_attribute_id", "product_attribute_values", ["attribute_id"])
    op.create_index("ix_product_attribute_values_variant_id", "product_attribute_values", ["variant_id"])
    op.create_index("ix_product_attribute_values_is_deleted", "product_attribute_values", ["is_deleted"])

    op.create_table(
        "product_tags",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        sa.Column("tag_name", sa.String(length=80), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "tag_name", name="uq_product_tags_product_name"),
    )
    op.create_index("ix_product_tags_product_id", "product_tags", ["product_id"])
    op.create_index("ix_product_tags_tag_name", "product_tags", ["tag_name"])
    op.create_index("ix_product_tags_is_deleted", "product_tags", ["is_deleted"])

    op.create_table(
        "product_specifications",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        sa.Column("group_name", sa.String(length=100), nullable=True),
        sa.Column("specification_name", sa.String(length=120), nullable=False),
        sa.Column("specification_value", sa.String(length=500), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        *_timestamps(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "specification_name", name="uq_product_specifications_product_name"),
    )
    op.create_index("ix_product_specifications_product_id", "product_specifications", ["product_id"])
    op.create_index("ix_product_specifications_group_name", "product_specifications", ["group_name"])
    op.create_index("ix_product_specifications_is_deleted", "product_specifications", ["is_deleted"])

    op.create_table(
        "product_seo_metadata",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        sa.Column("seo_title", sa.String(length=70), nullable=True),
        sa.Column("seo_description", sa.String(length=170), nullable=True),
        sa.Column("seo_keywords", sa.String(length=255), nullable=True),
        sa.Column("meta_robots", sa.String(length=50), nullable=False, server_default="index,follow"),
        sa.Column("canonical_url", sa.String(length=500), nullable=True),
        sa.Column("friendly_url", sa.String(length=255), nullable=True),
        sa.Column("open_graph_title", sa.String(length=95), nullable=True),
        sa.Column("open_graph_description", sa.String(length=200), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", name="uq_product_seo_metadata_product_id"),
        sa.UniqueConstraint("friendly_url", name="uq_product_seo_metadata_friendly_url"),
    )
    op.create_index("ix_product_seo_metadata_product_id", "product_seo_metadata", ["product_id"])
    op.create_index("ix_product_seo_metadata_friendly_url", "product_seo_metadata", ["friendly_url"])
    op.create_index("ix_product_seo_metadata_is_deleted", "product_seo_metadata", ["is_deleted"])


def downgrade() -> None:
    """Drop product extension tables."""
    op.drop_index("ix_product_seo_metadata_is_deleted", table_name="product_seo_metadata")
    op.drop_index("ix_product_seo_metadata_friendly_url", table_name="product_seo_metadata")
    op.drop_index("ix_product_seo_metadata_product_id", table_name="product_seo_metadata")
    op.drop_table("product_seo_metadata")

    op.drop_index("ix_product_specifications_is_deleted", table_name="product_specifications")
    op.drop_index("ix_product_specifications_group_name", table_name="product_specifications")
    op.drop_index("ix_product_specifications_product_id", table_name="product_specifications")
    op.drop_table("product_specifications")

    op.drop_index("ix_product_tags_is_deleted", table_name="product_tags")
    op.drop_index("ix_product_tags_tag_name", table_name="product_tags")
    op.drop_index("ix_product_tags_product_id", table_name="product_tags")
    op.drop_table("product_tags")

    op.drop_index("ix_product_attribute_values_is_deleted", table_name="product_attribute_values")
    op.drop_index("ix_product_attribute_values_variant_id", table_name="product_attribute_values")
    op.drop_index("ix_product_attribute_values_attribute_id", table_name="product_attribute_values")
    op.drop_index("ix_product_attribute_values_product_id", table_name="product_attribute_values")
    op.drop_table("product_attribute_values")

    op.drop_index("ix_product_attributes_is_deleted", table_name="product_attributes")
    op.drop_index("ix_product_attributes_attribute_name", table_name="product_attributes")
    op.drop_index("ix_product_attributes_product_id", table_name="product_attributes")
    op.drop_table("product_attributes")

    op.drop_index("ix_product_variants_is_deleted", table_name="product_variants")
    op.drop_index("ix_product_variants_status", table_name="product_variants")
    op.drop_index("ix_product_variants_barcode", table_name="product_variants")
    op.drop_index("ix_product_variants_sku", table_name="product_variants")
    op.drop_index("ix_product_variants_product_id", table_name="product_variants")
    op.drop_table("product_variants")
