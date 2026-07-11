"""Pydantic schemas for Inventory Management."""

from datetime import datetime
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import Field, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema


class InventoryStatus(StrEnum):
    """Inventory status values."""

    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    INACTIVE = "inactive"
    DELETED = "deleted"


class InventoryTransactionType(StrEnum):
    """Supported inventory transaction types."""

    STOCK_IN = "stock_in"
    STOCK_OUT = "stock_out"
    ADJUSTMENT = "adjustment"
    RESERVATION = "reservation"
    RESERVATION_RELEASE = "reservation_release"
    MANUAL_CORRECTION = "manual_correction"


class InventoryBase(BaseSchema):
    """Shared inventory fields."""

    product_id: UUID
    variant_id: UUID
    warehouse_id: UUID | None = None
    minimum_stock: int = Field(default=0, ge=0)
    maximum_stock: int | None = Field(default=None, ge=0)
    reorder_level: int = Field(default=0, ge=0)
    transfer_ready: bool = False

    @model_validator(mode="after")
    def validate_thresholds(self) -> Self:
        """Validate stock thresholds."""
        if self.maximum_stock is not None and self.maximum_stock < self.minimum_stock:
            raise ValueError("Maximum stock cannot be lower than minimum stock")
        if self.maximum_stock is not None and self.maximum_stock < self.reorder_level:
            raise ValueError("Maximum stock cannot be lower than reorder level")
        return self


class InventoryCreate(InventoryBase):
    """Inventory creation request."""

    available_quantity: int = Field(default=0, ge=0)
    reserved_quantity: int = Field(default=0, ge=0)
    damaged_quantity: int = Field(default=0, ge=0)


class InventoryUpdate(BaseSchema):
    """Inventory update request."""

    minimum_stock: int | None = Field(default=None, ge=0)
    maximum_stock: int | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    transfer_ready: bool | None = None


class InventoryOperationRequest(BaseSchema):
    """Inventory stock operation request."""

    quantity: int = Field(..., gt=0)
    reference_number: str | None = Field(default=None, max_length=120)
    remarks: str | None = Field(default=None, max_length=1000)
    performed_by: str | None = Field(default=None, max_length=120)


class InventoryAdjustmentRequest(BaseSchema):
    """Inventory adjustment request."""

    available_quantity: int = Field(..., ge=0)
    damaged_quantity: int | None = Field(default=None, ge=0)
    reference_number: str | None = Field(default=None, max_length=120)
    remarks: str | None = Field(default=None, max_length=1000)
    performed_by: str | None = Field(default=None, max_length=120)


class InventoryFilter(BaseSchema):
    """Inventory list filters."""

    status: InventoryStatus | None = None
    low_stock: bool | None = None
    out_of_stock: bool | None = None
    category_id: UUID | None = None
    brand_id: UUID | None = None
    seller_id: UUID | None = None
    warehouse_id: UUID | None = None


class InventoryResponse(BaseSchema):
    """Inventory response."""

    id: UUID
    product_id: UUID
    variant_id: UUID
    warehouse_id: UUID | None = None
    sku: str
    available_quantity: int
    reserved_quantity: int
    damaged_quantity: int
    minimum_stock: int
    maximum_stock: int | None = None
    reorder_level: int
    status: InventoryStatus
    transfer_ready: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool
    product_name: str | None = None
    category_name: str | None = None
    brand_name: str | None = None
    seller_name: str | None = None
    variant_signature: str | None = None


class InventoryListResponse(BaseSchema):
    """Paginated inventory list response."""

    items: list[InventoryResponse]
    meta: PageMeta


class InventoryTransactionResponse(BaseSchema):
    """Inventory transaction response."""

    id: UUID
    inventory_id: UUID
    transaction_type: InventoryTransactionType
    quantity: int
    previous_quantity: int
    current_quantity: int
    reference_number: str | None = None
    remarks: str | None = None
    performed_by: str | None = None
    created_at: datetime
    updated_at: datetime


class InventoryHistoryResponse(BaseSchema):
    """Inventory history response."""

    items: list[InventoryTransactionResponse]
    meta: PageMeta


class InventoryReservationResponse(BaseSchema):
    """Inventory reservation response."""

    id: UUID
    inventory_id: UUID
    quantity: int
    status: str
    reference_number: str | None = None
    remarks: str | None = None
    performed_by: str | None = None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool
