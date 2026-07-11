"""Pydantic schemas for Brand Management."""

import re
from datetime import UTC, datetime
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import Field, HttpUrl, field_validator, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema

SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
COUNTRY_REGEX = re.compile(r"^[A-Za-z][A-Za-z\s.'-]{1,99}$")


class BrandStatus(StrEnum):
    """Brand lifecycle statuses."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    DELETED = "deleted"


class BrandBase(BaseSchema):
    """Shared brand request fields."""

    brand_name: str = Field(..., min_length=2, max_length=255, examples=["Acme"])
    brand_slug: str | None = Field(default=None, min_length=2, max_length=255, examples=["acme"])
    description: str | None = Field(default=None, max_length=2000)
    logo_url: HttpUrl | None = None
    website: HttpUrl | None = None
    country_of_origin: str | None = Field(default=None, min_length=2, max_length=100, examples=["India"])
    founded_year: int | None = Field(default=None, ge=1800, le=datetime.now(UTC).year)

    @field_validator("brand_name")
    @classmethod
    def validate_brand_name(cls, value: str) -> str:
        """Validate brand name after trimming whitespace."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Brand name cannot be blank")
        return normalized

    @field_validator("brand_slug")
    @classmethod
    def validate_brand_slug(cls, value: str | None) -> str | None:
        """Validate optional brand slug."""
        if value is None:
            return None
        normalized = value.strip().lower()
        if not SLUG_REGEX.fullmatch(normalized):
            raise ValueError("Brand slug must contain lowercase letters, numbers, and single hyphens")
        return normalized

    @field_validator("country_of_origin")
    @classmethod
    def validate_country(cls, value: str | None) -> str | None:
        """Validate optional country name."""
        if value is None:
            return None
        normalized = value.strip()
        if not COUNTRY_REGEX.fullmatch(normalized):
            raise ValueError("Country of origin must be a valid country name")
        return normalized


class BrandCreate(BrandBase):
    """Brand creation request."""


class BrandUpdate(BaseSchema):
    """Brand update request."""

    brand_name: str | None = Field(default=None, min_length=2, max_length=255)
    brand_slug: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    logo_url: HttpUrl | None = None
    website: HttpUrl | None = None
    country_of_origin: str | None = Field(default=None, min_length=2, max_length=100)
    founded_year: int | None = Field(default=None, ge=1800, le=datetime.now(UTC).year)

    @field_validator("brand_name")
    @classmethod
    def validate_optional_brand_name(cls, value: str | None) -> str | None:
        """Validate optional brand name."""
        return BrandBase.validate_brand_name(value) if value is not None else None

    @field_validator("brand_slug")
    @classmethod
    def validate_optional_brand_slug(cls, value: str | None) -> str | None:
        """Validate optional brand slug."""
        return BrandBase.validate_brand_slug(value) if value is not None else None

    @field_validator("country_of_origin")
    @classmethod
    def validate_optional_country(cls, value: str | None) -> str | None:
        """Validate optional country."""
        return BrandBase.validate_country(value) if value is not None else None

    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> Self:
        """Require at least one update field."""
        if not self.model_dump(exclude_unset=True):
            raise ValueError("At least one field must be provided for update")
        return self


class BrandFilter(BaseSchema):
    """Brand filter request parameters."""

    status: BrandStatus | None = None
    is_active: bool | None = None
    country_of_origin: str | None = None


class BrandSearch(BaseSchema):
    """Brand search request parameters."""

    query: str | None = Field(default=None, min_length=1, max_length=255)


class BrandResponse(BaseSchema):
    """Brand response schema."""

    id: UUID
    brand_name: str
    brand_slug: str
    description: str | None = None
    logo_url: str | None = None
    website: str | None = None
    country_of_origin: str | None = None
    founded_year: int | None = None
    status: BrandStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class BrandListResponse(BaseSchema):
    """Paginated brand list response."""

    items: list[BrandResponse]
    meta: PageMeta
