"""Cart schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AddCartItemRequest(BaseModel):
    """Payload for adding a product to the cart."""

    product_id: UUID
    quantity: int = Field(default=1, ge=1)


class UpdateCartQuantityRequest(BaseModel):
    """Payload for updating a cart item quantity."""

    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    """Cart item response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    product_title: str | None = None
    quantity: int
    unit_price: float
    line_total: float
    created_at: datetime
    updated_at: datetime


class CartResponse(BaseModel):
    """Shopping cart response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    items: list[CartItemResponse] = Field(default_factory=list)
    item_count: int
    total_quantity: int
    subtotal: float
    grand_total: float
    created_at: datetime
    updated_at: datetime


__all__ = [
    "AddCartItemRequest",
    "CartItemResponse",
    "CartResponse",
    "UpdateCartQuantityRequest",
]
