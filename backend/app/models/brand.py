"""Brand SQLAlchemy model."""

from sqlalchemy import Boolean, CheckConstraint, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Brand(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Brand information for future product association."""

    __tablename__ = "brands"
    __table_args__ = (
        UniqueConstraint("brand_name", name="uq_brands_brand_name"),
        UniqueConstraint("brand_slug", name="uq_brands_brand_slug"),
        CheckConstraint("founded_year IS NULL OR founded_year >= 1800", name="ck_brands_founded_year_min"),
        Index("ix_brands_brand_name", "brand_name"),
        Index("ix_brands_brand_slug", "brand_slug"),
        Index("ix_brands_status", "status"),
        Index("ix_brands_created_at", "created_at"),
    )

    brand_name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand_slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country_of_origin: Mapped[str | None] = mapped_column(String(100), nullable=True)
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
