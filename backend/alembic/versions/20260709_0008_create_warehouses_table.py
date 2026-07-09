"""Create warehouses table.

Revision ID: 20260709_0008
Revises: 20260709_0007
Create Date: 2026-07-09 16:30:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260709_0008"
down_revision: str | None = "20260709_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _uuid_column(name: str = "id", *, primary_key: bool = False, nullable: bool = False) -> sa.Column:
    """Return a UUID column."""
    return sa.Column(name, postgresql.UUID(as_uuid=True), primary_key=primary_key, nullable=nullable)


def upgrade() -> None:
    """Create warehouse table and inventory relationship."""
    op.create_table(
        "warehouses",
        _uuid_column(primary_key=True),
        _uuid_column("seller_id"),
        sa.Column("warehouse_code", sa.String(length=50), nullable=False),
        sa.Column("warehouse_name", sa.String(length=255), nullable=False),
        sa.Column("contact_person", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("address_line_1", sa.String(length=255), nullable=False),
        sa.Column("address_line_2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("country", sa.String(length=100), nullable=False),
        sa.Column("postal_code", sa.String(length=20), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("warehouse_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="active"),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(["seller_id"], ["sellers.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("warehouse_code", name="uq_warehouses_warehouse_code"),
        sa.CheckConstraint("latitude IS NULL OR latitude BETWEEN -90 AND 90", name="ck_warehouses_latitude_range"),
        sa.CheckConstraint(
            "longitude IS NULL OR longitude BETWEEN -180 AND 180",
            name="ck_warehouses_longitude_range",
        ),
    )
    op.create_index("ix_warehouses_seller_id", "warehouses", ["seller_id"])
    op.create_index("ix_warehouses_warehouse_code", "warehouses", ["warehouse_code"])
    op.create_index("ix_warehouses_warehouse_name", "warehouses", ["warehouse_name"])
    op.create_index("ix_warehouses_city", "warehouses", ["city"])
    op.create_index("ix_warehouses_state", "warehouses", ["state"])
    op.create_index("ix_warehouses_status", "warehouses", ["status"])
    op.create_index("ix_warehouses_is_default", "warehouses", ["is_default"])
    op.create_index("ix_warehouses_is_deleted", "warehouses", ["is_deleted"])

    op.add_column("inventory", sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_inventory_warehouse_id_warehouses",
        "inventory",
        "warehouses",
        ["warehouse_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_inventory_warehouse_id", "inventory", ["warehouse_id"])


def downgrade() -> None:
    """Drop warehouse table and inventory relationship."""
    op.drop_index("ix_inventory_warehouse_id", table_name="inventory")
    op.drop_constraint("fk_inventory_warehouse_id_warehouses", "inventory", type_="foreignkey")
    op.drop_column("inventory", "warehouse_id")

    op.drop_index("ix_warehouses_is_deleted", table_name="warehouses")
    op.drop_index("ix_warehouses_is_default", table_name="warehouses")
    op.drop_index("ix_warehouses_status", table_name="warehouses")
    op.drop_index("ix_warehouses_state", table_name="warehouses")
    op.drop_index("ix_warehouses_city", table_name="warehouses")
    op.drop_index("ix_warehouses_warehouse_name", table_name="warehouses")
    op.drop_index("ix_warehouses_warehouse_code", table_name="warehouses")
    op.drop_index("ix_warehouses_seller_id", table_name="warehouses")
    op.drop_table("warehouses")
