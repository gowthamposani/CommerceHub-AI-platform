"""Seller SQLAlchemy model."""

from uuid import UUID

from sqlalchemy import Boolean, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Seller(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Seller profile and business information."""

    __tablename__ = "sellers"
    __table_args__ = (
        UniqueConstraint("gst_number", name="uq_sellers_gst_number"),
        UniqueConstraint("pan_number", name="uq_sellers_pan_number"),
        UniqueConstraint("business_email", name="uq_sellers_business_email"),
        Index("ix_sellers_business_name", "business_name"),
        Index("ix_sellers_gst_number", "gst_number"),
        Index("ix_sellers_pan_number", "pan_number"),
        Index("ix_sellers_business_email", "business_email"),
        Index("ix_sellers_status", "status"),
        Index("ix_sellers_user_id", "user_id"),
    )

    user_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), nullable=False)

    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_business_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    business_type: Mapped[str] = mapped_column(String(50), nullable=False)
    business_email: Mapped[str] = mapped_column(String(255), nullable=False)
    business_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    gst_number: Mapped[str] = mapped_column(String(15), nullable=False)
    pan_number: Mapped[str] = mapped_column(String(10), nullable=False)
    tax_identification_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    address_line_1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)

    account_holder_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_number: Mapped[str] = mapped_column(String(34), nullable=False)
    ifsc_code: Mapped[str] = mapped_column(String(11), nullable=False)
    branch_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    default_currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    order_auto_accept_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)

