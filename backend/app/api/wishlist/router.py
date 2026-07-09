"""Wishlist routes."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, get_wishlist_service
from app.models.user import User
from app.schemas.auth import ApiResponse, EmptyData
from app.schemas.wishlist import AddWishlistItemRequest, WishlistResponse
from app.services.wishlist_service import WishlistService

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get(
    "",
    response_model=ApiResponse[list[WishlistResponse]],
    response_model_exclude_none=True,
)
def list_wishlist(
    current_user: User = Depends(get_current_user),
    wishlist_service: WishlistService = Depends(get_wishlist_service),
) -> ApiResponse[list[WishlistResponse]]:
    """Return the authenticated customer's wishlist items."""

    items = wishlist_service.list_wishlist(current_user)
    return ApiResponse[list[WishlistResponse]](
        success=True,
        message="Wishlist retrieved successfully",
        data=[WishlistResponse.model_validate(item) for item in items],
    )


@router.post(
    "",
    response_model=ApiResponse[WishlistResponse],
    status_code=status.HTTP_201_CREATED,
    response_model_exclude_none=True,
)
def add_wishlist_item(
    payload: AddWishlistItemRequest,
    current_user: User = Depends(get_current_user),
    wishlist_service: WishlistService = Depends(get_wishlist_service),
) -> ApiResponse[WishlistResponse]:
    """Add a product to the authenticated customer's wishlist."""

    item = wishlist_service.add_item(current_user, payload)
    return ApiResponse[WishlistResponse](
        success=True,
        message="Wishlist item added successfully",
        data=WishlistResponse.model_validate(item),
    )


@router.delete(
    "/{product_id}",
    response_model=ApiResponse[EmptyData],
    response_model_exclude_none=True,
)
def delete_wishlist_item(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    wishlist_service: WishlistService = Depends(get_wishlist_service),
) -> ApiResponse[EmptyData]:
    """Remove a product from the authenticated customer's wishlist."""

    wishlist_service.remove_item(current_user, product_id)
    return ApiResponse[EmptyData](
        success=True,
        message="Wishlist item deleted successfully",
        data=EmptyData(),
    )


@router.post(
    "/{product_id}/move-to-cart",
    response_model=ApiResponse[EmptyData],
    response_model_exclude_none=True,
)
def move_to_cart(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    wishlist_service: WishlistService = Depends(get_wishlist_service),
) -> ApiResponse[EmptyData]:
    """Remove a wishlist item in preparation for cart handoff."""

    wishlist_service.move_to_cart(current_user, product_id)
    return ApiResponse[EmptyData](
        success=True,
        message="Wishlist item moved to cart successfully",
        data=EmptyData(),
    )
