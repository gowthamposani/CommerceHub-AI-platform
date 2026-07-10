"""Pydantic schemas for Seller Management."""

import re
from datetime import datetime
from enum import StrEnum
from typing import Self
from uuid import UUID

from pydantic import EmailStr, Field, HttpUrl, field_validator, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema

GST_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$")
PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")
PHONE_REGEX = re.compile(r"^[+]?[0-9][0-9\s()-]{7,19}$")
POSTAL_CODE_REGEX = re.compile(r"^[A-Za-z0-9][A-Za-z0-9\s-]{2,19}$")
IFSC_REGEX = re.compile(r"^[A-Z]{4}0[A-Z0-9]{6}$")
ACCOUNT_NUMBER_REGEX = re.compile(r"^[0-9]{6,34}$")


class SellerStatus(StrEnum):
    """Seller lifecycle statuses."""

    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class SellerBusinessType(StrEnum):
    """Supported business types."""

    INDIVIDUAL = "individual"
    PROPRIETORSHIP = "proprietorship"
    PARTNERSHIP = "partnership"
    PRIVATE_LIMITED = "private_limited"
    LLP = "llp"
    OTHER = "other"


class SellerBase(BaseSchema):
    """Shared seller request fields."""

    business_name: str = Field(..., min_length=2, max_length=255, examples=["Acme Retail"])
    legal_business_name: str | None = Field(default=None, max_length=255)
    business_type: SellerBusinessType = Field(..., examples=[SellerBusinessType.PRIVATE_LIMITED])
    business_email: EmailStr = Field(..., examples=["seller@example.com"])
    business_phone: str = Field(..., min_length=8, max_length=20, examples=["+91 9876543210"])
    gst_number: str = Field(..., min_length=15, max_length=15, examples=["27ABCDE1234F1Z5"])
    pan_number: str = Field(..., min_length=10, max_length=10, examples=["ABCDE1234F"])
    tax_identification_number: str | None = Field(default=None, max_length=50)
    website: HttpUrl | None = None
    logo_url: HttpUrl | None = None
    description: str | None = Field(default=None, max_length=2000)

    address_line_1: str = Field(..., min_length=3, max_length=255)
    address_line_2: str | None = Field(default=None, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)

    account_holder_name: str = Field(..., min_length=2, max_length=255)
    bank_name: str = Field(..., min_length=2, max_length=255)
    account_number: str = Field(..., min_length=6, max_length=34)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    branch_name: str | None = Field(default=None, max_length=255)

    default_currency: str = Field(default="INR", min_length=3, max_length=3)
    notifications_enabled: bool = True
    order_auto_accept_enabled: bool = False

    @field_validator("business_name", "address_line_1", "city", "state", "country", "account_holder_name", "bank_name")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        """Validate required text fields after trimming whitespace."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value cannot be blank")
        return normalized

    @field_validator("business_phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        """Validate business phone number."""
        normalized = value.strip()
        if not PHONE_REGEX.fullmatch(normalized):
            raise ValueError("Business phone must be a valid phone number")
        return normalized

    @field_validator("gst_number")
    @classmethod
    def validate_gst(cls, value: str) -> str:
        """Validate GST number format."""
        normalized = value.strip().upper()
        if not GST_REGEX.fullmatch(normalized):
            raise ValueError("GST number must be a valid 15-character GSTIN")
        return normalized

    @field_validator("pan_number")
    @classmethod
    def validate_pan(cls, value: str) -> str:
        """Validate PAN number format."""
        normalized = value.strip().upper()
        if not PAN_REGEX.fullmatch(normalized):
            raise ValueError("PAN number must be a valid 10-character PAN")
        return normalized

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, value: str) -> str:
        """Validate postal code format."""
        normalized = value.strip().upper()
        if not POSTAL_CODE_REGEX.fullmatch(normalized):
            raise ValueError("Postal code must be valid")
        return normalized

    @field_validator("account_number")
    @classmethod
    def validate_account_number(cls, value: str) -> str:
        """Validate bank account number."""
        normalized = value.strip()
        if not ACCOUNT_NUMBER_REGEX.fullmatch(normalized):
            raise ValueError("Account number must contain 6 to 34 digits")
        return normalized

    @field_validator("ifsc_code")
    @classmethod
    def validate_ifsc(cls, value: str) -> str:
        """Validate IFSC code."""
        normalized = value.strip().upper()
        if not IFSC_REGEX.fullmatch(normalized):
            raise ValueError("IFSC code must be valid")
        return normalized

    @field_validator("default_currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        """Normalize ISO currency code."""
        return value.strip().upper()


class SellerCreate(SellerBase):
    """Seller creation request."""

    user_id: UUID = Field(..., description="Authentication user reference managed by the Auth module")


class SellerUpdate(BaseSchema):
    """Seller update request."""

    business_name: str | None = Field(default=None, min_length=2, max_length=255)
    legal_business_name: str | None = Field(default=None, max_length=255)
    business_type: SellerBusinessType | None = None
    business_email: EmailStr | None = None
    business_phone: str | None = Field(default=None, min_length=8, max_length=20)
    gst_number: str | None = Field(default=None, min_length=15, max_length=15)
    pan_number: str | None = Field(default=None, min_length=10, max_length=10)
    tax_identification_number: str | None = Field(default=None, max_length=50)
    website: HttpUrl | None = None
    logo_url: HttpUrl | None = None
    description: str | None = Field(default=None, max_length=2000)
    address_line_1: str | None = Field(default=None, min_length=3, max_length=255)
    address_line_2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    state: str | None = Field(default=None, min_length=2, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=100)
    postal_code: str | None = Field(default=None, min_length=3, max_length=20)
    account_holder_name: str | None = Field(default=None, min_length=2, max_length=255)
    bank_name: str | None = Field(default=None, min_length=2, max_length=255)
    account_number: str | None = Field(default=None, min_length=6, max_length=34)
    ifsc_code: str | None = Field(default=None, min_length=11, max_length=11)
    branch_name: str | None = Field(default=None, max_length=255)
    default_currency: str | None = Field(default=None, min_length=3, max_length=3)
    notifications_enabled: bool | None = None
    order_auto_accept_enabled: bool | None = None

    @field_validator("business_phone")
    @classmethod
    def validate_optional_phone(cls, value: str | None) -> str | None:
        """Validate optional phone number."""
        return SellerBase.validate_phone(value) if value is not None else None

    @field_validator("gst_number")
    @classmethod
    def validate_optional_gst(cls, value: str | None) -> str | None:
        """Validate optional GST number."""
        return SellerBase.validate_gst(value) if value is not None else None

    @field_validator("pan_number")
    @classmethod
    def validate_optional_pan(cls, value: str | None) -> str | None:
        """Validate optional PAN number."""
        return SellerBase.validate_pan(value) if value is not None else None

    @field_validator("postal_code")
    @classmethod
    def validate_optional_postal_code(cls, value: str | None) -> str | None:
        """Validate optional postal code."""
        return SellerBase.validate_postal_code(value) if value is not None else None

    @field_validator("account_number")
    @classmethod
    def validate_optional_account_number(cls, value: str | None) -> str | None:
        """Validate optional account number."""
        return SellerBase.validate_account_number(value) if value is not None else None

    @field_validator("ifsc_code")
    @classmethod
    def validate_optional_ifsc(cls, value: str | None) -> str | None:
        """Validate optional IFSC code."""
        return SellerBase.validate_ifsc(value) if value is not None else None

    @field_validator("default_currency")
    @classmethod
    def normalize_optional_currency(cls, value: str | None) -> str | None:
        """Normalize optional currency code."""
        return SellerBase.normalize_currency(value) if value is not None else None

    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> Self:
        """Require at least one update field."""
        if not self.model_dump(exclude_unset=True):
            raise ValueError("At least one field must be provided for update")
        return self


class SellerStatusUpdate(BaseSchema):
    """Seller status update request."""

    status: SellerStatus


class SellerFilter(BaseSchema):
    """Seller filter request parameters."""

    status: SellerStatus | None = None
    is_active: bool | None = None
    is_verified: bool | None = None
    business_type: SellerBusinessType | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None


class SellerSearch(BaseSchema):
    """Seller search request parameters."""

    query: str | None = Field(default=None, min_length=1, max_length=255)


class SellerResponse(SellerBase):
    """Seller response schema."""

    id: UUID
    user_id: UUID
    is_active: bool
    is_verified: bool
    status: SellerStatus
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    is_deleted: bool


class SellerListResponse(BaseSchema):
    """Paginated seller list response."""

    items: list[SellerResponse]
    meta: PageMeta
