"""Pydantic schemas for Product Image Management."""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import BaseSchema


class ProductImageUpdate(BaseSchema):
    """Product image metadata update request."""

    display_order: int | None = Field(default=None, ge=0)
    alt_text: str | None = Field(default=None, max_length=255)


class ProductImageResponse(BaseSchema):
    """Product image response schema."""

    id: UUID
    product_id: UUID
    image_url: str
    display_order: int
    alt_text: str | None = None
    is_primary: bool
    file_name: str
    mime_type: str
    file_size: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class ProductImageListResponse(BaseSchema):
    """Product image list response."""

    items: list[ProductImageResponse]
