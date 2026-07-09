"""Pydantic schemas."""

from app.schemas.auth import (
    ApiResponse,
    AuthSessionData,
    EmptyData,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RegistrationRole,
    RoleRead,
    TokenPairData,
    UserRead,
)
from app.schemas.customer import (
    AddressCreateRequest,
    AddressResponse,
    AddressUpdateRequest,
    CustomerProfileRequest,
    CustomerProfileResponse,
    CustomerProfileUpdateRequest,
)
from app.schemas.wishlist import AddWishlistItemRequest, WishlistResponse

__all__ = [
    "AddressCreateRequest",
    "AddressResponse",
    "AddressUpdateRequest",
    "ApiResponse",
    "AuthSessionData",
    "AddWishlistItemRequest",
    "EmptyData",
    "CustomerProfileRequest",
    "CustomerProfileResponse",
    "CustomerProfileUpdateRequest",
    "LoginRequest",
    "LogoutRequest",
    "RefreshTokenRequest",
    "RegisterRequest",
    "RegistrationRole",
    "RoleRead",
    "TokenPairData",
    "UserRead",
    "WishlistResponse",
]
