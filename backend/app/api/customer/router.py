"""Customer routes."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, get_customer_service
from app.models.user import User
from app.schemas.auth import ApiResponse, EmptyData
from app.schemas.customer import (
    AddressCreateRequest,
    AddressResponse,
    AddressUpdateRequest,
    CustomerProfileResponse,
    CustomerProfileUpdateRequest,
)
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customer", tags=["Customer"])


@router.get(
    "/profile",
    response_model=ApiResponse[CustomerProfileResponse],
    response_model_exclude_none=True,
)
def get_profile(
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[CustomerProfileResponse]:
    """Return the authenticated customer's profile."""

    profile = customer_service.get_profile(current_user)
    return ApiResponse[CustomerProfileResponse](
        success=True,
        message="Customer profile retrieved successfully",
        data=CustomerProfileResponse.model_validate(profile),
    )


@router.put(
    "/profile",
    response_model=ApiResponse[CustomerProfileResponse],
    response_model_exclude_none=True,
)
def update_profile(
    payload: CustomerProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[CustomerProfileResponse]:
    """Update the authenticated customer's profile."""

    profile = customer_service.update_profile(current_user, payload)
    return ApiResponse[CustomerProfileResponse](
        success=True,
        message="Customer profile updated successfully",
        data=CustomerProfileResponse.model_validate(profile),
    )


@router.get(
    "/addresses",
    response_model=ApiResponse[list[AddressResponse]],
    response_model_exclude_none=True,
)
def list_addresses(
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[list[AddressResponse]]:
    """List the authenticated customer's addresses."""

    addresses = customer_service.list_addresses(current_user)
    return ApiResponse[list[AddressResponse]](
        success=True,
        message="Customer addresses retrieved successfully",
        data=[AddressResponse.model_validate(address) for address in addresses],
    )


@router.post(
    "/addresses",
    response_model=ApiResponse[AddressResponse],
    status_code=status.HTTP_201_CREATED,
    response_model_exclude_none=True,
)
def create_address(
    payload: AddressCreateRequest,
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[AddressResponse]:
    """Create a new address for the authenticated customer."""

    address = customer_service.create_address(current_user, payload)
    return ApiResponse[AddressResponse](
        success=True,
        message="Address created successfully",
        data=AddressResponse.model_validate(address),
    )


@router.put(
    "/addresses/{address_id}",
    response_model=ApiResponse[AddressResponse],
    response_model_exclude_none=True,
)
def update_address(
    address_id: UUID,
    payload: AddressUpdateRequest,
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[AddressResponse]:
    """Update an existing customer address."""

    address = customer_service.update_address(current_user, address_id, payload)
    return ApiResponse[AddressResponse](
        success=True,
        message="Address updated successfully",
        data=AddressResponse.model_validate(address),
    )


@router.delete(
    "/addresses/{address_id}",
    response_model=ApiResponse[EmptyData],
    response_model_exclude_none=True,
)
def delete_address(
    address_id: UUID,
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[EmptyData]:
    """Delete an existing customer address."""

    customer_service.delete_address(current_user, address_id)
    return ApiResponse[EmptyData](
        success=True,
        message="Address deleted successfully",
        data=EmptyData(),
    )


@router.patch(
    "/addresses/{address_id}/default",
    response_model=ApiResponse[AddressResponse],
    response_model_exclude_none=True,
)
def set_default_address(
    address_id: UUID,
    current_user: User = Depends(get_current_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> ApiResponse[AddressResponse]:
    """Mark one address as the default address."""

    address = customer_service.set_default_address(current_user, address_id)
    return ApiResponse[AddressResponse](
        success=True,
        message="Default address updated successfully",
        data=AddressResponse.model_validate(address),
    )
