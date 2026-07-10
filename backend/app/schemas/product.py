"""Pydantic schemas for Product Management."""

import re
from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import Field, field_validator, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema

SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SKU_REGEX = re.compile(r"^[A-Z0-9][A-Z0-9._-]{1,99}$")
BARCODE_REGEX = re.compile(r"^[A-Za-z0-9._-]{3,100}$")
CURRENCY_REGEX = re.compile(r"^[A-Z]{3}$")


class ProductStatus(StrEnum):
    """Product lifecycle statuses."""

    DRAFT = "draft"
    PUBLISHED = "published"
    UNPUBLISHED = "unpublished"
    ARCHIVED = "archived"
    DELETED = "deleted"


class ProductVisibility(StrEnum):
    """Product catalog visibility modes."""

    PUBLIC = "public"
    PRIVATE = "private"
    HIDDEN = "hidden"


class ProductBase(BaseSchema):
    """Shared product request fields."""

    seller_id: UUID
    category_id: UUID
    brand_id: UUID
    product_name: str = Field(..., min_length=2, max_length=255, examples=["Wireless Headphones"])
    product_slug: str | None = Field(default=None, min_length=2, max_length=255, examples=["wireless-headphones"])
    short_description: str | None = Field(default=None, max_length=500)
    long_description: str | None = Field(default=None, max_length=5000)
    sku: str = Field(..., min_length=2, max_length=100, examples=["WH-1000XM"])
    barcode: str | None = Field(default=None, min_length=3, max_length=100)
    price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    discount_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cost_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    tax_percentage: Decimal = Field(default=Decimal("0.00"), ge=0, le=100, max_digits=5, decimal_places=2)
    weight: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    length: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    width: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    height: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    visibility: ProductVisibility = ProductVisibility.PRIVATE
    is_featured: bool = False

    @field_validator("product_name")
    @classmethod
    def validate_product_name(cls, value: str) -> str:
        """Normalize and validate product name."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Product name cannot be blank")
        return normalized

    @field_validator("product_slug")
    @classmethod
    def validate_slug(cls, value: str | None) -> str | None:
        """Validate optional product slug."""
        if value is None:
            return None
        normalized = value.strip().lower()
        if not SLUG_REGEX.fullmatch(normalized):
            raise ValueError("Product slug must contain lowercase letters, numbers, and single hyphens")
        return normalized

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, value: str) -> str:
        """Validate SKU."""
        normalized = value.strip().upper()
        if not SKU_REGEX.fullmatch(normalized):
            raise ValueError("SKU must contain uppercase letters, numbers, dots, underscores, or hyphens")
        return normalized

    @field_validator("barcode")
    @classmethod
    def validate_barcode(cls, value: str | None) -> str | None:
        """Validate optional barcode."""
        if value is None:
            return None
        normalized = value.strip()
        if not BARCODE_REGEX.fullmatch(normalized):
            raise ValueError("Barcode must contain letters, numbers, dots, underscores, or hyphens")
        return normalized

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        """Validate ISO-style currency code."""
        normalized = value.strip().upper()
        if not CURRENCY_REGEX.fullmatch(normalized):
            raise ValueError("Currency must be a three-letter uppercase code")
        return normalized

    @model_validator(mode="after")
    def validate_discount_price(self) -> Self:
        """Ensure discount does not exceed base price."""
        if self.discount_price is not None and self.discount_price > self.price:
            raise ValueError("Discount price cannot be greater than price")
        return self


class ProductCreate(ProductBase):
    """Product creation request."""


class ProductUpdate(BaseSchema):
    """Product update request."""

    seller_id: UUID | None = None
    category_id: UUID | None = None
    brand_id: UUID | None = None
    product_name: str | None = Field(default=None, min_length=2, max_length=255)
    product_slug: str | None = Field(default=None, min_length=2, max_length=255)
    short_description: str | None = Field(default=None, max_length=500)
    long_description: str | None = Field(default=None, max_length=5000)
    sku: str | None = Field(default=None, min_length=2, max_length=100)
    barcode: str | None = Field(default=None, min_length=3, max_length=100)
    price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    discount_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cost_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    tax_percentage: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
    weight: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    length: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    width: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    height: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=3)
    visibility: ProductVisibility | None = None
    is_featured: bool | None = None

    @field_validator("product_name")
    @classmethod
    def validate_optional_product_name(cls, value: str | None) -> str | None:
        """Validate optional product name."""
        return ProductBase.validate_product_name(value) if value is not None else None

    @field_validator("product_slug")
    @classmethod
    def validate_optional_slug(cls, value: str | None) -> str | None:
        """Validate optional slug."""
        return ProductBase.validate_slug(value) if value is not None else None

    @field_validator("sku")
    @classmethod
    def validate_optional_sku(cls, value: str | None) -> str | None:
        """Validate optional SKU."""
        return ProductBase.validate_sku(value) if value is not None else None

    @field_validator("barcode")
    @classmethod
    def validate_optional_barcode(cls, value: str | None) -> str | None:
        """Validate optional barcode."""
        return ProductBase.validate_barcode(value) if value is not None else None

    @field_validator("currency")
    @classmethod
    def validate_optional_currency(cls, value: str | None) -> str | None:
        """Validate optional currency."""
        return ProductBase.validate_currency(value) if value is not None else None

    @model_validator(mode="after")
    def validate_update(self) -> Self:
        """Require a field and validate price relationships when both values are present."""
        data = self.model_dump(exclude_unset=True)
        if not data:
            raise ValueError("At least one field must be provided for update")
        if self.price is not None and self.discount_price is not None and self.discount_price > self.price:
            raise ValueError("Discount price cannot be greater than price")
        return self


class ProductFilter(BaseSchema):
    """Product filter request parameters."""

    seller_id: UUID | None = None
    category_id: UUID | None = None
    brand_id: UUID | None = None
    status: ProductStatus | None = None
    min_price: Decimal | None = Field(default=None, ge=0)
    max_price: Decimal | None = Field(default=None, ge=0)
    is_featured: bool | None = None
    is_published: bool | None = None

    @model_validator(mode="after")
    def validate_price_range(self) -> Self:
        """Validate min and max price relationship."""
        if self.min_price is not None and self.max_price is not None and self.min_price > self.max_price:
            raise ValueError("Minimum price cannot be greater than maximum price")
        return self


class ProductSearch(BaseSchema):
    """Product search request parameters."""

    query: str | None = Field(default=None, min_length=1, max_length=255)


class PublishProductRequest(BaseSchema):
    """Publish product request."""

    visibility: ProductVisibility = ProductVisibility.PUBLIC


class ProductResponse(BaseSchema):
    """Product response schema."""

    id: UUID
    seller_id: UUID
    category_id: UUID
    brand_id: UUID
    product_name: str
    product_slug: str
    short_description: str | None = None
    long_description: str | None = None
    sku: str
    barcode: str | None = None
    price: Decimal
    discount_price: Decimal | None = None
    cost_price: Decimal | None = None
    currency: str
    tax_percentage: Decimal
    weight: Decimal | None = None
    length: Decimal | None = None
    width: Decimal | None = None
    height: Decimal | None = None
    status: ProductStatus
    visibility: ProductVisibility
    is_featured: bool
    is_active: bool
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class ProductDetails(ProductResponse):
    """Detailed product response including related display labels."""

    seller_name: str | None = None
    category_name: str | None = None
    brand_name: str | None = None


class ProductListResponse(BaseSchema):
    """Paginated product list response."""

    items: list[ProductDetails]
    meta: PageMeta
