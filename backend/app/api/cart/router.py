"""Cart routes."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_cart_service, get_current_user
from app.models.user import User
from app.schemas.auth import ApiResponse
from app.schemas.cart import AddCartItemRequest, CartResponse, UpdateCartQuantityRequest
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get(
    "",
    response_model=ApiResponse[CartResponse],
    response_model_exclude_none=True,
)
def get_cart(
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
) -> ApiResponse[CartResponse]:
    """Return the authenticated customer's cart."""

    cart = cart_service.get_cart(current_user)
    return ApiResponse[CartResponse](
        success=True,
        message="Cart retrieved successfully",
        data=cart,
    )


@router.post(
    "",
    response_model=ApiResponse[CartResponse],
    response_model_exclude_none=True,
)
def add_cart_item(
    payload: AddCartItemRequest,
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
) -> ApiResponse[CartResponse]:
    """Add a product to the authenticated customer's cart."""

    cart = cart_service.add_item(current_user, payload)
    return ApiResponse[CartResponse](
        success=True,
        message="Cart item added successfully",
        data=cart,
    )


@router.put(
    "/items/{item_id}",
    response_model=ApiResponse[CartResponse],
    response_model_exclude_none=True,
)
def update_cart_quantity(
    item_id: UUID,
    payload: UpdateCartQuantityRequest,
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
) -> ApiResponse[CartResponse]:
    """Update the quantity for a cart item."""

    cart = cart_service.update_quantity(current_user, item_id, payload)
    return ApiResponse[CartResponse](
        success=True,
        message="Cart item updated successfully",
        data=cart,
    )


@router.delete(
    "/items/{item_id}",
    response_model=ApiResponse[CartResponse],
    response_model_exclude_none=True,
)
def delete_cart_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
) -> ApiResponse[CartResponse]:
    """Remove a cart item."""

    cart = cart_service.delete_item(current_user, item_id)
    return ApiResponse[CartResponse](
        success=True,
        message="Cart item deleted successfully",
        data=cart,
    )


@router.delete(
    "",
    response_model=ApiResponse[CartResponse],
    response_model_exclude_none=True,
)
def clear_cart(
    current_user: User = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
) -> ApiResponse[CartResponse]:
    """Remove all items from the authenticated customer's cart."""

    cart = cart_service.clear_cart(current_user)
    return ApiResponse[CartResponse](
        success=True,
        message="Cart cleared successfully",
        data=cart,
    )
