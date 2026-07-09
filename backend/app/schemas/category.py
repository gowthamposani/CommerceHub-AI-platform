"""Pydantic schemas for Category Management."""

from __future__ import annotations

import re
from datetime import datetime
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import Field, HttpUrl, field_validator, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema

SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class CategoryStatus(StrEnum):
    """Category lifecycle statuses."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    DELETED = "deleted"


class CategoryBase(BaseSchema):
    """Shared category request fields."""

    parent_category_id: UUID | None = Field(default=None)
    category_name: str = Field(..., min_length=2, max_length=255, examples=["Electronics"])
    category_slug: str | None = Field(default=None, min_length=2, max_length=255, examples=["electronics"])
    description: str | None = Field(default=None, max_length=2000)
    image_url: HttpUrl | None = None
    display_order: int = Field(default=0, ge=0)

    @field_validator("category_name")
    @classmethod
    def validate_category_name(cls, value: str) -> str:
        """Validate category name after trimming whitespace."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Category name cannot be blank")
        return normalized

    @field_validator("category_slug")
    @classmethod
    def validate_category_slug(cls, value: str | None) -> str | None:
        """Validate optional category slug."""
        if value is None:
            return None
        normalized = value.strip().lower()
        if not SLUG_REGEX.fullmatch(normalized):
            raise ValueError("Category slug must contain lowercase letters, numbers, and single hyphens")
        return normalized


class CategoryCreate(CategoryBase):
    """Category creation request."""


class CategoryUpdate(BaseSchema):
    """Category update request."""

    parent_category_id: UUID | None = Field(default=None)
    category_name: str | None = Field(default=None, min_length=2, max_length=255)
    category_slug: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    image_url: HttpUrl | None = None
    display_order: int | None = Field(default=None, ge=0)

    @field_validator("category_name")
    @classmethod
    def validate_optional_category_name(cls, value: str | None) -> str | None:
        """Validate optional category name."""
        return CategoryBase.validate_category_name(value) if value is not None else None

    @field_validator("category_slug")
    @classmethod
    def validate_optional_category_slug(cls, value: str | None) -> str | None:
        """Validate optional category slug."""
        return CategoryBase.validate_category_slug(value) if value is not None else None

    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> Self:
        """Require at least one update field."""
        if not self.model_dump(exclude_unset=True):
            raise ValueError("At least one field must be provided for update")
        return self


class CategoryFilter(BaseSchema):
    """Category filter request parameters."""

    parent_category_id: UUID | None = None
    status: CategoryStatus | None = None
    is_active: bool | None = None


class CategorySearch(BaseSchema):
    """Category search request parameters."""

    query: str | None = Field(default=None, min_length=1, max_length=255)


class CategoryResponse(BaseSchema):
    """Category response schema."""

    id: UUID
    parent_category_id: UUID | None = None
    category_name: str
    category_slug: str
    description: str | None = None
    image_url: str | None = None
    display_order: int
    is_active: bool
    status: CategoryStatus
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class CategoryTreeResponse(CategoryResponse):
    """Recursive category tree response."""

    children: list[CategoryTreeResponse] = Field(default_factory=list)


class CategoryListResponse(BaseSchema):
    """Paginated category list response."""

    items: list[CategoryResponse]
    meta: PageMeta


CategoryTreeResponse.model_rebuild()
