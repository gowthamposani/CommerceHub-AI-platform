"""Order schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class CheckoutRequest(BaseModel):
    """Payload for placing an order from the current cart."""

    model_config = ConfigDict(extra="forbid")

    payment_id: Optional[UUID] = None


class OrderItemResponse(BaseModel):
    """Order item response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_id: UUID
    product_id: UUID
    product_title: Optional[str] = None
    quantity: int
    unit_price: float
    line_total: float
    created_at: datetime
    updated_at: datetime


class OrderResponse(BaseModel):
    """Order response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    payment_id: Optional[UUID] = None
    status: OrderStatus
    items: list[OrderItemResponse] = Field(default_factory=list)
    item_count: int
    total_quantity: int
    total_amount: float
    created_at: datetime
    updated_at: datetime


__all__ = ["CheckoutRequest", "OrderItemResponse", "OrderResponse"]
