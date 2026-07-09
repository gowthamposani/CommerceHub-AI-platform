"""Create inventory tables.

Revision ID: 20260709_0007
Revises: 20260709_0006
Create Date: 2026-07-09 15:30:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260709_0007"
down_revision: str | None = "20260709_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _uuid_column(name: str = "id", *, primary_key: bool = False) -> sa.Column:
    """Return a UUID column."""
    return sa.Column(name, postgresql.UUID(as_uuid=True), primary_key=primary_key, nullable=False)


def _timestamps(*, soft_delete: bool = False) -> list[sa.Column]:
    """Return standard timestamp columns."""
    columns = [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    ]
    if soft_delete:
        columns.extend(
            [
                sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
                sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
            ]
        )
    return columns


def upgrade() -> None:
    """Create inventory tables."""
    op.create_table(
        "inventory",
        _uuid_column(primary_key=True),
        _uuid_column("product_id"),
        _uuid_column("variant_id"),
        sa.Column("sku", sa.String(length=100), nullable=False),
        sa.Column("available_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reserved_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("damaged_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("minimum_stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("maximum_stock", sa.Integer(), nullable=True),
        sa.Column("reorder_level", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="out_of_stock"),
        sa.Column("transfer_ready", sa.Boolean(), nullable=False, server_default=sa.false()),
        *_timestamps(soft_delete=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("variant_id", name="uq_inventory_variant_id"),
        sa.CheckConstraint("available_quantity >= 0", name="ck_inventory_available_quantity_non_negative"),
        sa.CheckConstraint("reserved_quantity >= 0", name="ck_inventory_reserved_quantity_non_negative"),
        sa.CheckConstraint("damaged_quantity >= 0", name="ck_inventory_damaged_quantity_non_negative"),
        sa.CheckConstraint("minimum_stock >= 0", name="ck_inventory_minimum_stock_non_negative"),
        sa.CheckConstraint(
            "maximum_stock IS NULL OR maximum_stock >= 0",
            name="ck_inventory_maximum_stock_non_negative",
        ),
        sa.CheckConstraint("reorder_level >= 0", name="ck_inventory_reorder_level_non_negative"),
        sa.CheckConstraint(
            "maximum_stock IS NULL OR maximum_stock >= minimum_stock",
            name="ck_inventory_maximum_greater_than_minimum",
        ),
        sa.CheckConstraint(
            "maximum_stock IS NULL OR maximum_stock >= reorder_level",
            name="ck_inventory_maximum_greater_than_reorder",
        ),
    )
    op.create_index("ix_inventory_product_id", "inventory", ["product_id"])
    op.create_index("ix_inventory_variant_id", "inventory", ["variant_id"])
    op.create_index("ix_inventory_sku", "inventory", ["sku"])
    op.create_index("ix_inventory_status", "inventory", ["status"])
    op.create_index("ix_inventory_created_at", "inventory", ["created_at"])
    op.create_index("ix_inventory_is_deleted", "inventory", ["is_deleted"])

    op.create_table(
        "inventory_transactions",
        _uuid_column(primary_key=True),
        _uuid_column("inventory_id"),
        sa.Column("transaction_type", sa.String(length=40), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("previous_quantity", sa.Integer(), nullable=False),
        sa.Column("current_quantity", sa.Integer(), nullable=False),
        sa.Column("reference_number", sa.String(length=120), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("performed_by", sa.String(length=120), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(["inventory_id"], ["inventory.id"], ondelete="CASCADE"),
        sa.CheckConstraint("quantity > 0", name="ck_inventory_transactions_quantity_positive"),
        sa.CheckConstraint("previous_quantity >= 0", name="ck_inventory_transactions_previous_non_negative"),
        sa.CheckConstraint("current_quantity >= 0", name="ck_inventory_transactions_current_non_negative"),
    )
    op.create_index("ix_inventory_transactions_inventory_id", "inventory_transactions", ["inventory_id"])
    op.create_index("ix_inventory_transactions_type", "inventory_transactions", ["transaction_type"])
    op.create_index("ix_inventory_transactions_created_at", "inventory_transactions", ["created_at"])

    op.create_table(
        "inventory_reservations",
        _uuid_column(primary_key=True),
        _uuid_column("inventory_id"),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="reserved"),
        sa.Column("reference_number", sa.String(length=120), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("performed_by", sa.String(length=120), nullable=True),
        *_timestamps(soft_delete=True),
        sa.ForeignKeyConstraint(["inventory_id"], ["inventory.id"], ondelete="CASCADE"),
        sa.CheckConstraint("quantity > 0", name="ck_inventory_reservations_quantity_positive"),
    )
    op.create_index("ix_inventory_reservations_inventory_id", "inventory_reservations", ["inventory_id"])
    op.create_index("ix_inventory_reservations_status", "inventory_reservations", ["status"])
    op.create_index("ix_inventory_reservations_reference_number", "inventory_reservations", ["reference_number"])
    op.create_index("ix_inventory_reservations_is_deleted", "inventory_reservations", ["is_deleted"])


def downgrade() -> None:
    """Drop inventory tables."""
    op.drop_index("ix_inventory_reservations_is_deleted", table_name="inventory_reservations")
    op.drop_index("ix_inventory_reservations_reference_number", table_name="inventory_reservations")
    op.drop_index("ix_inventory_reservations_status", table_name="inventory_reservations")
    op.drop_index("ix_inventory_reservations_inventory_id", table_name="inventory_reservations")
    op.drop_table("inventory_reservations")

    op.drop_index("ix_inventory_transactions_created_at", table_name="inventory_transactions")
    op.drop_index("ix_inventory_transactions_type", table_name="inventory_transactions")
    op.drop_index("ix_inventory_transactions_inventory_id", table_name="inventory_transactions")
    op.drop_table("inventory_transactions")

    op.drop_index("ix_inventory_is_deleted", table_name="inventory")
    op.drop_index("ix_inventory_created_at", table_name="inventory")
    op.drop_index("ix_inventory_status", table_name="inventory")
    op.drop_index("ix_inventory_sku", table_name="inventory")
    op.drop_index("ix_inventory_variant_id", table_name="inventory")
    op.drop_index("ix_inventory_product_id", table_name="inventory")
    op.drop_table("inventory")
