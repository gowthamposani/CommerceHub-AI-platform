"""Pydantic schemas for Warehouse Management."""

import re
from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import EmailStr, Field, field_validator, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema

WAREHOUSE_CODE_REGEX = re.compile(r"^[A-Z0-9][A-Z0-9_-]{2,49}$")
PHONE_REGEX = re.compile(r"^[+0-9][0-9\s().-]{7,19}$")
POSTAL_CODE_REGEX = re.compile(r"^[A-Za-z0-9][A-Za-z0-9\s-]{2,19}$")


class WarehouseStatus(StrEnum):
    """Warehouse lifecycle statuses."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class WarehouseType(StrEnum):
    """Warehouse type values."""

    FULFILLMENT = "fulfillment"
    STORAGE = "storage"
    RETURNS = "returns"
    CROSS_DOCK = "cross_dock"
    DARK_STORE = "dark_store"


class WarehouseBase(BaseSchema):
    """Shared warehouse request fields."""

    seller_id: UUID
    warehouse_code: str = Field(..., min_length=3, max_length=50)
    warehouse_name: str = Field(..., min_length=2, max_length=255)
    contact_person: str = Field(..., min_length=2, max_length=255)
    phone_number: str = Field(..., min_length=8, max_length=20)
    email: EmailStr
    address_line_1: str = Field(..., min_length=3, max_length=255)
    address_line_2: str | None = Field(default=None, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    latitude: Decimal | None = Field(default=None, ge=Decimal("-90"), le=Decimal("90"), decimal_places=6)
    longitude: Decimal | None = Field(default=None, ge=Decimal("-180"), le=Decimal("180"), decimal_places=6)
    warehouse_type: WarehouseType = WarehouseType.FULFILLMENT
    status: WarehouseStatus = WarehouseStatus.ACTIVE
    is_default: bool = False

    @field_validator("warehouse_code")
    @classmethod
    def validate_warehouse_code(cls, value: str) -> str:
        """Validate and normalize warehouse code."""
        normalized = value.strip().upper()
        if not WAREHOUSE_CODE_REGEX.fullmatch(normalized):
            raise ValueError("Warehouse code must use uppercase letters, numbers, underscores, or hyphens")
        return normalized

    @field_validator(
        "warehouse_name",
        "contact_person",
        "address_line_1",
        "city",
        "state",
        "country",
        "postal_code",
    )
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        """Normalize required text fields."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Field cannot be blank")
        return normalized

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        """Validate phone number."""
        normalized = value.strip()
        if not PHONE_REGEX.fullmatch(normalized):
            raise ValueError("Phone number format is invalid")
        return normalized

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, value: str) -> str:
        """Validate postal code."""
        normalized = value.strip()
        if not POSTAL_CODE_REGEX.fullmatch(normalized):
            raise ValueError("Postal code format is invalid")
        return normalized


class WarehouseCreate(WarehouseBase):
    """Warehouse creation request."""


class WarehouseUpdate(BaseSchema):
    """Warehouse update request."""

    warehouse_name: str | None = Field(default=None, min_length=2, max_length=255)
    contact_person: str | None = Field(default=None, min_length=2, max_length=255)
    phone_number: str | None = Field(default=None, min_length=8, max_length=20)
    email: EmailStr | None = None
    address_line_1: str | None = Field(default=None, min_length=3, max_length=255)
    address_line_2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    state: str | None = Field(default=None, min_length=2, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=100)
    postal_code: str | None = Field(default=None, min_length=3, max_length=20)
    latitude: Decimal | None = Field(default=None, ge=Decimal("-90"), le=Decimal("90"), decimal_places=6)
    longitude: Decimal | None = Field(default=None, ge=Decimal("-180"), le=Decimal("180"), decimal_places=6)
    warehouse_type: WarehouseType | None = None
    status: WarehouseStatus | None = None
    is_default: bool | None = None

    @field_validator("phone_number")
    @classmethod
    def validate_optional_phone(cls, value: str | None) -> str | None:
        """Validate optional phone number."""
        return WarehouseBase.validate_phone(value) if value is not None else None

    @field_validator("postal_code")
    @classmethod
    def validate_optional_postal_code(cls, value: str | None) -> str | None:
        """Validate optional postal code."""
        return WarehouseBase.validate_postal_code(value) if value is not None else None

    @model_validator(mode="after")
    def validate_update_payload(self) -> Self:
        """Require at least one field for update."""
        if not self.model_dump(exclude_unset=True):
            raise ValueError("At least one field must be provided for update")
        return self


class WarehouseStatusUpdate(BaseSchema):
    """Warehouse status update request."""

    status: WarehouseStatus


class WarehouseFilter(BaseSchema):
    """Warehouse filters."""

    seller_id: UUID | None = None
    status: WarehouseStatus | None = None
    warehouse_type: WarehouseType | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    is_default: bool | None = None


class WarehouseResponse(BaseSchema):
    """Warehouse response."""

    id: UUID
    seller_id: UUID
    warehouse_code: str
    warehouse_name: str
    contact_person: str
    phone_number: str
    email: str
    address_line_1: str
    address_line_2: str | None = None
    city: str
    state: str
    country: str
    postal_code: str
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    warehouse_type: WarehouseType
    status: WarehouseStatus
    is_default: bool
    created_by: UUID | None = None
    updated_by: UUID | None = None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool
    seller_name: str | None = None


class WarehouseListResponse(BaseSchema):
    """Paginated warehouse list response."""

    items: list[WarehouseResponse]
    meta: PageMeta


class WarehouseStatisticsResponse(BaseSchema):
    """Warehouse statistics response."""

    total_warehouses: int
    active_warehouses: int
    inactive_warehouses: int
    default_warehouses: int
    inventory_records: int
    total_available_quantity: int
    total_reserved_quantity: int
    total_damaged_quantity: int


class WarehouseCapacityResponse(BaseSchema):
    """Warehouse capacity response."""

    warehouse_id: UUID
    capacity_units: int | None
    utilized_units: int
    available_capacity_units: int | None
    utilization_percentage: Decimal | None


class WarehouseInventorySummaryResponse(BaseSchema):
    """Warehouse inventory summary response."""

    warehouse_id: UUID
    inventory_records: int
    unique_products: int
    unique_variants: int
    total_available_quantity: int
    total_reserved_quantity: int
    total_damaged_quantity: int
    low_stock_records: int
    out_of_stock_records: int


class WarehouseTransferRequest(BaseSchema):
    """Warehouse inventory transfer request."""

    source_warehouse_id: UUID
    destination_warehouse_id: UUID
    inventory_id: UUID
    quantity: int = Field(..., gt=0)
    reference_number: str | None = Field(default=None, max_length=120)
    remarks: str | None = Field(default=None, max_length=1000)
    performed_by: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def validate_distinct_warehouses(self) -> Self:
        """Prevent transferring inventory to the same warehouse."""
        if self.source_warehouse_id == self.destination_warehouse_id:
            raise ValueError("Source and destination warehouses must be different")
        return self


class WarehouseTransferResponse(BaseSchema):
    """Warehouse inventory transfer response."""

    source_inventory_id: UUID
    destination_inventory_id: UUID
    source_warehouse_id: UUID
    destination_warehouse_id: UUID
    product_id: UUID
    variant_id: UUID
    sku: str
    quantity: int
    source_available_quantity: int
    destination_available_quantity: int


class WarehouseActivityResponse(BaseSchema):
    """Warehouse activity timeline row."""

    id: str
    label: str
    description: str
    timestamp: datetime
    type: str


class WarehouseActivityListResponse(BaseSchema):
    """Warehouse activity timeline response."""

    items: list[WarehouseActivityResponse]
