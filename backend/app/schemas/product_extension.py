"""Schemas for product variants, attributes, tags, specifications, and SEO."""

from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import Field, HttpUrl, field_validator, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema
from app.schemas.product import BARCODE_REGEX, SKU_REGEX


class ProductVariantStatus(StrEnum):
    """Variant lifecycle statuses."""

    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class AttributeSelection(BaseSchema):
    """Attribute value selected for a variant."""

    attribute_id: UUID
    value: str = Field(..., min_length=1, max_length=150)

    @field_validator("value")
    @classmethod
    def normalize_value(cls, value: str) -> str:
        """Normalize attribute values."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Attribute value cannot be blank")
        return normalized


class ProductVariantBase(BaseSchema):
    """Shared variant fields."""

    sku: str = Field(..., min_length=2, max_length=100)
    barcode: str | None = Field(default=None, min_length=3, max_length=100)
    price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    discount_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cost_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    weight: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    length: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    width: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    height: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    status: ProductVariantStatus = ProductVariantStatus.DRAFT
    is_active: bool = True
    attributes: list[AttributeSelection] = Field(default_factory=list)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, value: str) -> str:
        """Validate and normalize variant SKU."""
        normalized = value.strip().upper()
        if not SKU_REGEX.fullmatch(normalized):
            raise ValueError("SKU must contain uppercase letters, numbers, dots, underscores, or hyphens")
        return normalized

    @field_validator("barcode")
    @classmethod
    def validate_barcode(cls, value: str | None) -> str | None:
        """Validate optional variant barcode."""
        if value is None:
            return None
        normalized = value.strip()
        if not BARCODE_REGEX.fullmatch(normalized):
            raise ValueError("Barcode must contain letters, numbers, dots, underscores, or hyphens")
        return normalized

    @model_validator(mode="after")
    def validate_variant(self) -> Self:
        """Validate price relationships and duplicate attribute assignments."""
        if self.discount_price is not None and self.discount_price > self.price:
            raise ValueError("Discount price cannot be greater than price")
        attribute_ids = [selection.attribute_id for selection in self.attributes]
        if len(attribute_ids) != len(set(attribute_ids)):
            raise ValueError("A variant cannot contain the same attribute more than once")
        return self


class ProductVariantCreate(ProductVariantBase):
    """Variant creation request."""


class ProductVariantUpdate(BaseSchema):
    """Variant update request."""

    sku: str | None = Field(default=None, min_length=2, max_length=100)
    barcode: str | None = Field(default=None, min_length=3, max_length=100)
    price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    discount_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cost_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    weight: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    length: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    width: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    height: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    status: ProductVariantStatus | None = None
    is_active: bool | None = None
    attributes: list[AttributeSelection] | None = None

    @field_validator("sku")
    @classmethod
    def validate_optional_sku(cls, value: str | None) -> str | None:
        """Validate optional SKU."""
        return ProductVariantBase.validate_sku(value) if value is not None else None

    @field_validator("barcode")
    @classmethod
    def validate_optional_barcode(cls, value: str | None) -> str | None:
        """Validate optional barcode."""
        return ProductVariantBase.validate_barcode(value) if value is not None else None

    @model_validator(mode="after")
    def validate_update(self) -> Self:
        """Require a field and prevent duplicate attribute assignments."""
        data = self.model_dump(exclude_unset=True)
        if not data:
            raise ValueError("At least one field must be provided for update")
        if self.price is not None and self.discount_price is not None and self.discount_price > self.price:
            raise ValueError("Discount price cannot be greater than price")
        if self.attributes is not None:
            attribute_ids = [selection.attribute_id for selection in self.attributes]
            if len(attribute_ids) != len(set(attribute_ids)):
                raise ValueError("A variant cannot contain the same attribute more than once")
        return self


class ProductAttributeValueResponse(BaseSchema):
    """Product attribute value response."""

    id: UUID
    product_id: UUID
    attribute_id: UUID
    variant_id: UUID | None = None
    value: str
    display_order: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class ProductVariantResponse(BaseSchema):
    """Variant response."""

    id: UUID
    product_id: UUID
    sku: str
    barcode: str | None = None
    price: Decimal
    discount_price: Decimal | None = None
    cost_price: Decimal | None = None
    weight: Decimal | None = None
    length: Decimal | None = None
    width: Decimal | None = None
    height: Decimal | None = None
    status: ProductVariantStatus
    is_active: bool
    variant_signature: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool
    attribute_values: list[ProductAttributeValueResponse] = Field(default_factory=list)


class ProductVariantListResponse(BaseSchema):
    """Paginated variant list response."""

    items: list[ProductVariantResponse]
    meta: PageMeta


class ProductAttributeCreate(BaseSchema):
    """Attribute creation request."""

    attribute_name: str = Field(..., min_length=1, max_length=100)
    values: list[str] = Field(default_factory=list, max_length=100)
    display_order: int = Field(default=0, ge=0)
    is_variant_defining: bool = True

    @field_validator("attribute_name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        """Normalize attribute name."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Attribute name cannot be blank")
        return normalized

    @field_validator("values")
    @classmethod
    def normalize_values(cls, values: list[str]) -> list[str]:
        """Normalize and deduplicate attribute values."""
        normalized = [value.strip() for value in values if value.strip()]
        if len(normalized) != len(set(value.lower() for value in normalized)):
            raise ValueError("Duplicate attribute values are not allowed")
        return normalized


class ProductAttributeUpdate(BaseSchema):
    """Attribute update request."""

    attribute_name: str | None = Field(default=None, min_length=1, max_length=100)
    values: list[str] | None = Field(default=None, max_length=100)
    display_order: int | None = Field(default=None, ge=0)
    is_variant_defining: bool | None = None

    @field_validator("attribute_name")
    @classmethod
    def normalize_optional_name(cls, value: str | None) -> str | None:
        """Normalize optional attribute name."""
        return ProductAttributeCreate.normalize_name(value) if value is not None else None

    @field_validator("values")
    @classmethod
    def normalize_optional_values(cls, values: list[str] | None) -> list[str] | None:
        """Normalize optional values."""
        return ProductAttributeCreate.normalize_values(values) if values is not None else None


class ProductAttributeResponse(BaseSchema):
    """Attribute response."""

    id: UUID
    product_id: UUID
    attribute_name: str
    display_order: int
    is_variant_defining: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool
    values: list[ProductAttributeValueResponse] = Field(default_factory=list)


class ProductAttributeListResponse(BaseSchema):
    """Attribute list response."""

    items: list[ProductAttributeResponse]


class ProductTagCreate(BaseSchema):
    """Product tag creation request."""

    tag_name: str = Field(..., min_length=1, max_length=80)

    @field_validator("tag_name")
    @classmethod
    def normalize_tag(cls, value: str) -> str:
        """Normalize tag name."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Tag cannot be blank")
        return normalized


class ProductTagResponse(BaseSchema):
    """Product tag response."""

    id: UUID
    product_id: UUID
    tag_name: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class ProductTagListResponse(BaseSchema):
    """Product tag list response."""

    items: list[ProductTagResponse]


class ProductSpecificationCreate(BaseSchema):
    """Product specification creation request."""

    group_name: str | None = Field(default=None, max_length=100)
    specification_name: str = Field(..., min_length=1, max_length=120)
    specification_value: str = Field(..., min_length=1, max_length=500)
    display_order: int = Field(default=0, ge=0)

    @field_validator("group_name", "specification_name", "specification_value")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        """Normalize specification text."""
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Specification text cannot be blank")
        return normalized


class ProductSpecificationUpdate(BaseSchema):
    """Product specification update request."""

    group_name: str | None = Field(default=None, max_length=100)
    specification_name: str | None = Field(default=None, min_length=1, max_length=120)
    specification_value: str | None = Field(default=None, min_length=1, max_length=500)
    display_order: int | None = Field(default=None, ge=0)

    @field_validator("group_name", "specification_name", "specification_value")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        """Normalize optional specification text."""
        return ProductSpecificationCreate.normalize_text(value)


class ProductSpecificationResponse(BaseSchema):
    """Product specification response."""

    id: UUID
    product_id: UUID
    group_name: str | None = None
    specification_name: str
    specification_value: str
    display_order: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class ProductSpecificationListResponse(BaseSchema):
    """Product specification list response."""

    items: list[ProductSpecificationResponse]


class ProductSeoMetadataUpsert(BaseSchema):
    """SEO metadata upsert request."""

    seo_title: str | None = Field(default=None, max_length=70)
    seo_description: str | None = Field(default=None, max_length=170)
    seo_keywords: str | None = Field(default=None, max_length=255)
    meta_robots: str = Field(default="index,follow", min_length=1, max_length=50)
    canonical_url: HttpUrl | None = None
    friendly_url: str | None = Field(default=None, max_length=255)
    open_graph_title: str | None = Field(default=None, max_length=95)
    open_graph_description: str | None = Field(default=None, max_length=200)

    @field_validator(
        "seo_title",
        "seo_description",
        "seo_keywords",
        "meta_robots",
        "friendly_url",
        "open_graph_title",
        "open_graph_description",
    )
    @classmethod
    def normalize_optional(cls, value: str | None) -> str | None:
        """Normalize optional SEO text."""
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class ProductSeoMetadataResponse(BaseSchema):
    """SEO metadata response."""

    id: UUID
    product_id: UUID
    seo_title: str | None = None
    seo_description: str | None = None
    seo_keywords: str | None = None
    meta_robots: str
    canonical_url: str | None = None
    friendly_url: str | None = None
    open_graph_title: str | None = None
    open_graph_description: str | None = None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class ProductPreviewExtendedResponse(BaseSchema):
    """Product extension preview response."""

    variants: list[ProductVariantResponse]
    attributes: list[ProductAttributeResponse]
    tags: list[ProductTagResponse]
    specifications: list[ProductSpecificationResponse]
    seo: ProductSeoMetadataResponse | None = None
