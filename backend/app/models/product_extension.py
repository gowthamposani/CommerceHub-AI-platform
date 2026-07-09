"""Product extension models for variants, attributes, tags, specifications, and SEO."""

from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.product import Product


class ProductVariant(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Sellable product variant with independent SKU, barcode, price, and dimensions."""

    __tablename__ = "product_variants"
    __table_args__ = (
        UniqueConstraint("sku", name="uq_product_variants_sku"),
        UniqueConstraint("barcode", name="uq_product_variants_barcode"),
        UniqueConstraint("product_id", "variant_signature", name="uq_product_variants_signature"),
        CheckConstraint("price >= 0", name="ck_product_variants_price_non_negative"),
        CheckConstraint(
            "discount_price IS NULL OR discount_price >= 0",
            name="ck_product_variants_discount_non_negative",
        ),
        CheckConstraint("cost_price IS NULL OR cost_price >= 0", name="ck_product_variants_cost_non_negative"),
        CheckConstraint(
            "discount_price IS NULL OR discount_price <= price",
            name="ck_product_variants_discount_not_greater_than_price",
        ),
        CheckConstraint("weight IS NULL OR weight >= 0", name="ck_product_variants_weight_non_negative"),
        CheckConstraint("length IS NULL OR length >= 0", name="ck_product_variants_length_non_negative"),
        CheckConstraint("width IS NULL OR width >= 0", name="ck_product_variants_width_non_negative"),
        CheckConstraint("height IS NULL OR height >= 0", name="ck_product_variants_height_non_negative"),
        Index("ix_product_variants_product_id", "product_id"),
        Index("ix_product_variants_sku", "sku"),
        Index("ix_product_variants_barcode", "barcode"),
        Index("ix_product_variants_status", "status"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    sku: Mapped[str] = mapped_column(String(100), nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    cost_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    length: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    width: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    height: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="draft", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    variant_signature: Mapped[str] = mapped_column(String(500), nullable=False)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("variants", lazy="selectin", cascade="all, delete-orphan"),
    )


class ProductAttribute(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Configurable attribute for a product such as color, size, RAM, or material."""

    __tablename__ = "product_attributes"
    __table_args__ = (
        UniqueConstraint("product_id", "attribute_name", name="uq_product_attributes_product_name"),
        Index("ix_product_attributes_product_id", "product_id"),
        Index("ix_product_attributes_attribute_name", "attribute_name"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    attribute_name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_order: Mapped[int] = mapped_column(default=0, nullable=False)
    is_variant_defining: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("attributes", lazy="selectin", cascade="all, delete-orphan"),
    )


class ProductAttributeValue(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Allowed or selected value for a configurable product attribute."""

    __tablename__ = "product_attribute_values"
    __table_args__ = (
        UniqueConstraint("variant_id", "attribute_id", name="uq_product_attribute_values_variant_attribute"),
        Index("ix_product_attribute_values_product_id", "product_id"),
        Index("ix_product_attribute_values_attribute_id", "attribute_id"),
        Index("ix_product_attribute_values_variant_id", "variant_id"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    attribute_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("product_attributes.id", ondelete="CASCADE"),
        nullable=False,
    )
    variant_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="CASCADE"),
        nullable=True,
    )
    value: Mapped[str] = mapped_column(String(150), nullable=False)
    display_order: Mapped[int] = mapped_column(default=0, nullable=False)

    attribute: Mapped[ProductAttribute] = relationship(
        "ProductAttribute",
        lazy="selectin",
        backref=backref("values", lazy="selectin", cascade="all, delete-orphan"),
    )
    variant: Mapped[ProductVariant | None] = relationship(
        "ProductVariant",
        lazy="selectin",
        backref=backref("attribute_values", lazy="selectin", cascade="all, delete-orphan"),
    )


class ProductTag(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Product tag for merchandising and search."""

    __tablename__ = "product_tags"
    __table_args__ = (
        UniqueConstraint("product_id", "tag_name", name="uq_product_tags_product_name"),
        Index("ix_product_tags_product_id", "product_id"),
        Index("ix_product_tags_tag_name", "tag_name"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    tag_name: Mapped[str] = mapped_column(String(80), nullable=False)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("tags", lazy="selectin", cascade="all, delete-orphan"),
    )


class ProductSpecification(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Reusable key-value product specification."""

    __tablename__ = "product_specifications"
    __table_args__ = (
        UniqueConstraint("product_id", "specification_name", name="uq_product_specifications_product_name"),
        Index("ix_product_specifications_product_id", "product_id"),
        Index("ix_product_specifications_group_name", "group_name"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    group_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    specification_name: Mapped[str] = mapped_column(String(120), nullable=False)
    specification_value: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(default=0, nullable=False)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("specifications", lazy="selectin", cascade="all, delete-orphan"),
    )


class ProductSeoMetadata(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """SEO and social metadata for a product."""

    __tablename__ = "product_seo_metadata"
    __table_args__ = (
        UniqueConstraint("product_id", name="uq_product_seo_metadata_product_id"),
        UniqueConstraint("friendly_url", name="uq_product_seo_metadata_friendly_url"),
        Index("ix_product_seo_metadata_product_id", "product_id"),
        Index("ix_product_seo_metadata_friendly_url", "friendly_url"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    seo_title: Mapped[str | None] = mapped_column(String(70), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(170), nullable=True)
    seo_keywords: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_robots: Mapped[str] = mapped_column(String(50), default="index,follow", nullable=False)
    canonical_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    friendly_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    open_graph_title: Mapped[str | None] = mapped_column(String(95), nullable=True)
    open_graph_description: Mapped[str | None] = mapped_column(String(200), nullable=True)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("seo_metadata", lazy="selectin", uselist=False, cascade="all, delete-orphan"),
    )
