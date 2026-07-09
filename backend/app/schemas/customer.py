"""Customer module schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.schemas.auth import UserRead

NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
AddressLineStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
CityStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
StateStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
PostalCodeStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=20)]
CountryStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
PhoneNumberStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=30)]


class CustomerProfileRequest(BaseModel):
    """Payload for updating customer profile details."""

    first_name: Optional[NameStr] = None
    last_name: Optional[NameStr] = None

    @model_validator(mode="after")
    def validate_payload(self) -> "CustomerProfileRequest":
        if "first_name" in self.model_fields_set and self.first_name is None:
            raise ValueError("first_name cannot be null")
        if "last_name" in self.model_fields_set and self.last_name is None:
            raise ValueError("last_name cannot be null")
        if not self.model_fields_set:
            raise ValueError("At least one profile field must be provided")
        return self


class CustomerProfileUpdateRequest(CustomerProfileRequest):
    """Alias for profile updates."""


class AddressCreateRequest(BaseModel):
    """Payload for creating a customer address."""

    address_line_1: AddressLineStr
    address_line_2: Optional[AddressLineStr] = None
    city: CityStr
    state: StateStr
    postal_code: PostalCodeStr
    country: CountryStr
    phone_number: Optional[PhoneNumberStr] = None
    is_default: bool = Field(default=False)


class AddressUpdateRequest(BaseModel):
    """Payload for updating a customer address."""

    address_line_1: Optional[AddressLineStr] = None
    address_line_2: Optional[AddressLineStr] = None
    city: Optional[CityStr] = None
    state: Optional[StateStr] = None
    postal_code: Optional[PostalCodeStr] = None
    country: Optional[CountryStr] = None
    phone_number: Optional[PhoneNumberStr] = None

    @model_validator(mode="after")
    def validate_payload(self) -> "AddressUpdateRequest":
        if "address_line_1" in self.model_fields_set and self.address_line_1 is None:
            raise ValueError("address_line_1 cannot be null")
        if "city" in self.model_fields_set and self.city is None:
            raise ValueError("city cannot be null")
        if "state" in self.model_fields_set and self.state is None:
            raise ValueError("state cannot be null")
        if "postal_code" in self.model_fields_set and self.postal_code is None:
            raise ValueError("postal_code cannot be null")
        if "country" in self.model_fields_set and self.country is None:
            raise ValueError("country cannot be null")
        if not self.model_fields_set:
            raise ValueError("At least one address field must be provided")
        return self


class AddressResponse(BaseModel):
    """Address response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone_number: Optional[str] = None
    is_default: bool
    created_at: datetime
    updated_at: datetime


class CustomerProfileResponse(UserRead):
    """Customer profile response schema including saved addresses."""

    model_config = ConfigDict(from_attributes=True)

    addresses: list[AddressResponse] = Field(default_factory=list)


__all__ = [
    "AddressCreateRequest",
    "AddressResponse",
    "AddressUpdateRequest",
    "CustomerProfileRequest",
    "CustomerProfileResponse",
    "CustomerProfileUpdateRequest",
]
