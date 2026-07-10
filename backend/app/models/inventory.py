"""Inventory SQLAlchemy models."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID  # noqa: N811
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.product_extension import ProductVariant
    from app.models.warehouse import Warehouse


class Inventory(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Inventory balance for a product variant."""

    __tablename__ = "inventory"
    __table_args__ = (
        UniqueConstraint("variant_id", "warehouse_id", name="uq_inventory_variant_warehouse"),
        CheckConstraint("available_quantity >= 0", name="ck_inventory_available_quantity_non_negative"),
        CheckConstraint("reserved_quantity >= 0", name="ck_inventory_reserved_quantity_non_negative"),
        CheckConstraint("damaged_quantity >= 0", name="ck_inventory_damaged_quantity_non_negative"),
        CheckConstraint("minimum_stock >= 0", name="ck_inventory_minimum_stock_non_negative"),
        CheckConstraint("maximum_stock IS NULL OR maximum_stock >= 0", name="ck_inventory_maximum_stock_non_negative"),
        CheckConstraint("reorder_level >= 0", name="ck_inventory_reorder_level_non_negative"),
        CheckConstraint(
            "maximum_stock IS NULL OR maximum_stock >= minimum_stock",
            name="ck_inventory_maximum_greater_than_minimum",
        ),
        CheckConstraint(
            "maximum_stock IS NULL OR maximum_stock >= reorder_level",
            name="ck_inventory_maximum_greater_than_reorder",
        ),
        Index("ix_inventory_product_id", "product_id"),
        Index("ix_inventory_variant_id", "variant_id"),
        Index("ix_inventory_warehouse_id", "warehouse_id"),
        Index("ix_inventory_sku", "sku"),
        Index("ix_inventory_status", "status"),
        Index("ix_inventory_created_at", "created_at"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    variant_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="RESTRICT"),
        nullable=False,
    )
    warehouse_id: Mapped[UUID | None] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("warehouses.id", ondelete="RESTRICT"),
        nullable=True,
    )
    sku: Mapped[str] = mapped_column(String(100), nullable=False)
    available_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    damaged_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    minimum_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    maximum_stock: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reorder_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="out_of_stock", nullable=False)
    transfer_ready: Mapped[bool] = mapped_column(default=False, nullable=False)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("inventory_records", lazy="selectin"),
    )
    variant: Mapped["ProductVariant"] = relationship(
        "ProductVariant",
        lazy="selectin",
        backref=backref("inventory_records", lazy="selectin"),
    )
    warehouse: Mapped["Warehouse | None"] = relationship(
        "Warehouse",
        lazy="selectin",
        backref=backref("inventory_records", lazy="selectin"),
    )


class InventoryTransaction(Base, UUIDMixin, TimestampMixin):
    """Immutable inventory transaction history row."""

    __tablename__ = "inventory_transactions"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_inventory_transactions_quantity_positive"),
        CheckConstraint("previous_quantity >= 0", name="ck_inventory_transactions_previous_non_negative"),
        CheckConstraint("current_quantity >= 0", name="ck_inventory_transactions_current_non_negative"),
        Index("ix_inventory_transactions_inventory_id", "inventory_id"),
        Index("ix_inventory_transactions_type", "transaction_type"),
        Index("ix_inventory_transactions_created_at", "created_at"),
    )

    inventory_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("inventory.id", ondelete="CASCADE"),
        nullable=False,
    )
    transaction_type: Mapped[str] = mapped_column(String(40), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    previous_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(120), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    performed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)

    inventory: Mapped[Inventory] = relationship(
        "Inventory",
        lazy="selectin",
        backref=backref("transactions", lazy="selectin", cascade="all, delete-orphan"),
    )


class InventoryReservation(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Inventory reservation record for future order and warehouse integration."""

    __tablename__ = "inventory_reservations"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_inventory_reservations_quantity_positive"),
        Index("ix_inventory_reservations_inventory_id", "inventory_id"),
        Index("ix_inventory_reservations_status", "status"),
        Index("ix_inventory_reservations_reference_number", "reference_number"),
    )

    inventory_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("inventory.id", ondelete="CASCADE"),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="reserved", nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(120), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    performed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)

    inventory: Mapped[Inventory] = relationship(
        "Inventory",
        lazy="selectin",
        backref=backref("reservations", lazy="selectin", cascade="all, delete-orphan"),
    )
