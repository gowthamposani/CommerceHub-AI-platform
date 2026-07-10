"""Seller Management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import get_pagination, get_search
from app.schemas.seller import (
    SellerCreate,
    SellerFilter,
    SellerListResponse,
    SellerResponse,
    SellerStatus,
    SellerBusinessType,
    SellerUpdate,
)
from app.services.seller import SellerService

router = APIRouter(prefix="/sellers", tags=["sellers"])


def get_seller_service(session: AsyncSession = Depends(get_db_session)) -> SellerService:
    """Provide seller service dependency."""
    return SellerService(session)


@router.post(
    "",
    response_model=StandardResponse[SellerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create seller profile",
    description="Create a seller profile with business, tax, banking, address, and preference information.",
)
async def create_seller(
    payload: SellerCreate,
    request: Request,
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerResponse]:
    """Create a seller profile."""
    seller = await service.create_seller(payload)
    return StandardResponse.success_response(
        message="Seller created successfully",
        data=SellerResponse.model_validate(seller),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "",
    response_model=StandardResponse[SellerListResponse],
    summary="List sellers",
    description="List sellers with pagination, search, filtering, and sorting.",
)
async def list_sellers(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    status_filter: SellerStatus | None = Query(default=None, alias="status"),
    business_type: SellerBusinessType | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    is_verified: bool | None = Query(default=None),
    city: str | None = Query(default=None),
    state: str | None = Query(default=None),
    country: str | None = Query(default=None),
    sort_by: str | None = Query(default="created_at"),
    sort_direction: SortDirection = Query(default=SortDirection.DESC),
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerListResponse]:
    """List sellers."""
    filters = SellerFilter(
        status=status_filter,
        business_type=business_type,
        is_active=is_active,
        is_verified=is_verified,
        city=city,
        state=state,
        country=country,
    )
    page = await service.list_sellers(pagination, filters, search, sort_by, sort_direction.value)
    payload = SellerListResponse(
        items=[SellerResponse.model_validate(seller) for seller in page.items],
        meta=page.meta,
    )
    return StandardResponse.success_response(
        message="Sellers retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{seller_id}",
    response_model=StandardResponse[SellerResponse],
    summary="Get seller profile",
    description="Retrieve a seller profile by seller ID.",
)
async def get_seller(
    seller_id: UUID,
    request: Request,
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerResponse]:
    """Get a seller profile."""
    seller = await service.get_seller(seller_id)
    return StandardResponse.success_response(
        message="Seller retrieved successfully",
        data=SellerResponse.model_validate(seller),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{seller_id}",
    response_model=StandardResponse[SellerResponse],
    summary="Update seller profile",
    description="Update seller business, contact, tax, banking, address, or preference fields.",
)
async def update_seller(
    seller_id: UUID,
    payload: SellerUpdate,
    request: Request,
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerResponse]:
    """Update a seller profile."""
    seller = await service.update_seller(seller_id, payload)
    return StandardResponse.success_response(
        message="Seller updated successfully",
        data=SellerResponse.model_validate(seller),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{seller_id}/activate",
    response_model=StandardResponse[SellerResponse],
    summary="Activate seller",
    description="Activate a seller profile and set status to active.",
)
async def activate_seller(
    seller_id: UUID,
    request: Request,
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerResponse]:
    """Activate a seller."""
    seller = await service.activate_seller(seller_id)
    return StandardResponse.success_response(
        message="Seller activated successfully",
        data=SellerResponse.model_validate(seller),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{seller_id}/deactivate",
    response_model=StandardResponse[SellerResponse],
    summary="Deactivate seller",
    description="Deactivate a seller profile and set status to inactive.",
)
async def deactivate_seller(
    seller_id: UUID,
    request: Request,
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerResponse]:
    """Deactivate a seller."""
    seller = await service.deactivate_seller(seller_id)
    return StandardResponse.success_response(
        message="Seller deactivated successfully",
        data=SellerResponse.model_validate(seller),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/{seller_id}",
    response_model=StandardResponse[SellerResponse],
    summary="Soft delete seller",
    description="Soft delete a seller profile without physically removing it from the database.",
)
async def delete_seller(
    seller_id: UUID,
    request: Request,
    service: SellerService = Depends(get_seller_service),
) -> StandardResponse[SellerResponse]:
    """Soft delete a seller."""
    seller = await service.soft_delete_seller(seller_id)
    return StandardResponse.success_response(
        message="Seller deleted successfully",
        data=SellerResponse.model_validate(seller),
        request_id=getattr(request.state, "request_id", None),
    )
