"""Product SQLAlchemy model."""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as POSTGRES_UUID
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.brand import Brand
    from app.models.category import Category
    from app.models.seller import Seller


class Product(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Product listing owned by a seller and classified by category and brand."""

    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("sku", name="uq_products_sku"),
        UniqueConstraint("barcode", name="uq_products_barcode"),
        UniqueConstraint("product_slug", name="uq_products_product_slug"),
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        CheckConstraint("discount_price IS NULL OR discount_price >= 0", name="ck_products_discount_non_negative"),
        CheckConstraint("cost_price IS NULL OR cost_price >= 0", name="ck_products_cost_non_negative"),
        CheckConstraint(
            "discount_price IS NULL OR discount_price <= price",
            name="ck_products_discount_not_greater_than_price",
        ),
        CheckConstraint("tax_percentage >= 0 AND tax_percentage <= 100", name="ck_products_tax_percentage_range"),
        CheckConstraint("weight IS NULL OR weight >= 0", name="ck_products_weight_non_negative"),
        CheckConstraint("length IS NULL OR length >= 0", name="ck_products_length_non_negative"),
        CheckConstraint("width IS NULL OR width >= 0", name="ck_products_width_non_negative"),
        CheckConstraint("height IS NULL OR height >= 0", name="ck_products_height_non_negative"),
        Index("ix_products_product_name", "product_name"),
        Index("ix_products_seller_id", "seller_id"),
        Index("ix_products_category_id", "category_id"),
        Index("ix_products_brand_id", "brand_id"),
        Index("ix_products_status", "status"),
        Index("ix_products_created_at", "created_at"),
    )

    seller_id: Mapped[UUID] = mapped_column(
        POSTGRES_UUID(as_uuid=True),
        ForeignKey("sellers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    category_id: Mapped[UUID] = mapped_column(
        POSTGRES_UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    brand_id: Mapped[UUID] = mapped_column(
        POSTGRES_UUID(as_uuid=True),
        ForeignKey("brands.id", ondelete="RESTRICT"),
        nullable=False,
    )

    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_slug: Mapped[str] = mapped_column(String(255), nullable=False)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    long_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sku: Mapped[str] = mapped_column(String(100), nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)

    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    cost_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    tax_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)

    weight: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    length: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    width: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    height: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)

    status: Mapped[str] = mapped_column(String(30), default="draft", nullable=False)
    visibility: Mapped[str] = mapped_column(String(30), default="private", nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    seller: Mapped["Seller"] = relationship("Seller", lazy="selectin", backref=backref("products", lazy="selectin"))
    category: Mapped["Category"] = relationship(
        "Category",
        lazy="selectin",
        backref=backref("products", lazy="selectin"),
    )
    brand: Mapped["Brand"] = relationship("Brand", lazy="selectin", backref=backref("products", lazy="selectin"))
