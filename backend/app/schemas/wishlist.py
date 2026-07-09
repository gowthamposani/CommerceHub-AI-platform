"""Wishlist schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AddWishlistItemRequest(BaseModel):
    """Payload for adding a product to the wishlist."""

    product_id: UUID


class WishlistResponse(BaseModel):
    """Wishlist entry response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    product_id: UUID
    created_at: datetime
    updated_at: datetime


__all__ = ["AddWishlistItemRequest", "WishlistResponse"]
