"""Order routes."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, get_order_service
from app.models.user import User
from app.schemas.auth import ApiResponse
from app.schemas.order import CheckoutRequest, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "/checkout",
    response_model=ApiResponse[OrderResponse],
    status_code=status.HTTP_201_CREATED,
    response_model_exclude_none=True,
)
def checkout(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderResponse]:
    """Create an order from the authenticated customer's cart."""

    order = order_service.checkout(current_user, payload)
    return ApiResponse[OrderResponse](
        success=True,
        message="Order placed successfully",
        data=order,
    )


@router.get(
    "",
    response_model=ApiResponse[list[OrderResponse]],
    response_model_exclude_none=True,
)
def list_orders(
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
) -> ApiResponse[list[OrderResponse]]:
    """Return the authenticated customer's orders."""

    orders = order_service.list_orders(current_user)
    return ApiResponse[list[OrderResponse]](
        success=True,
        message="Orders retrieved successfully",
        data=orders,
    )


@router.get(
    "/{order_id}",
    response_model=ApiResponse[OrderResponse],
    response_model_exclude_none=True,
)
def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderResponse]:
    """Return a single customer order."""

    order = order_service.get_order(current_user, order_id)
    return ApiResponse[OrderResponse](
        success=True,
        message="Order retrieved successfully",
        data=order,
    )


@router.patch(
    "/{order_id}/cancel",
    response_model=ApiResponse[OrderResponse],
    response_model_exclude_none=True,
)
def cancel_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
) -> ApiResponse[OrderResponse]:
    """Cancel a customer order before shipment."""

    order = order_service.cancel_order(current_user, order_id)
    return ApiResponse[OrderResponse](
        success=True,
        message="Order cancelled successfully",
        data=order,
    )
