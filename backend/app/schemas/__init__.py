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
from app.schemas.cart import AddCartItemRequest, CartItemResponse, CartResponse, UpdateCartQuantityRequest
from app.schemas.customer import (
    AddressCreateRequest,
    AddressResponse,
    AddressUpdateRequest,
    CustomerProfileRequest,
    CustomerProfileResponse,
    CustomerProfileUpdateRequest,
)
from app.schemas.order import CheckoutRequest, OrderItemResponse, OrderResponse
from app.schemas.wishlist import AddWishlistItemRequest, WishlistResponse

__all__ = [
    "AddCartItemRequest",
    "AddressCreateRequest",
    "AddressResponse",
    "AddressUpdateRequest",
    "ApiResponse",
    "AuthSessionData",
    "CartItemResponse",
    "CartResponse",
    "AddWishlistItemRequest",
    "EmptyData",
    "CustomerProfileRequest",
    "CustomerProfileResponse",
    "CustomerProfileUpdateRequest",
    "CheckoutRequest",
    "LoginRequest",
    "LogoutRequest",
    "RefreshTokenRequest",
    "OrderItemResponse",
    "OrderResponse",
    "RegisterRequest",
    "RegistrationRole",
    "RoleRead",
    "UpdateCartQuantityRequest",
    "TokenPairData",
    "UserRead",
    "WishlistResponse",
]
