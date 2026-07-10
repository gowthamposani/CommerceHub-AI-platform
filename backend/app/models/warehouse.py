"""Warehouse SQLAlchemy model."""

from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID  # noqa: N811
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.seller import Seller


class Warehouse(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Seller-owned warehouse location for inventory storage."""

    __tablename__ = "warehouses"
    __table_args__ = (
        UniqueConstraint("warehouse_code", name="uq_warehouses_warehouse_code"),
        CheckConstraint("latitude IS NULL OR latitude BETWEEN -90 AND 90", name="ck_warehouses_latitude_range"),
        CheckConstraint("longitude IS NULL OR longitude BETWEEN -180 AND 180", name="ck_warehouses_longitude_range"),
        Index("ix_warehouses_seller_id", "seller_id"),
        Index("ix_warehouses_warehouse_code", "warehouse_code"),
        Index("ix_warehouses_warehouse_name", "warehouse_name"),
        Index("ix_warehouses_city", "city"),
        Index("ix_warehouses_state", "state"),
        Index("ix_warehouses_status", "status"),
        Index("ix_warehouses_is_default", "is_default"),
    )

    seller_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("sellers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    warehouse_code: Mapped[str] = mapped_column(String(50), nullable=False)
    warehouse_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line_1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    warehouse_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_by: Mapped[UUID | None] = mapped_column(PostgresUUID(as_uuid=True), nullable=True)
    updated_by: Mapped[UUID | None] = mapped_column(PostgresUUID(as_uuid=True), nullable=True)

    seller: Mapped["Seller"] = relationship(
        "Seller",
        lazy="selectin",
        backref=backref("warehouses", lazy="selectin"),
    )
