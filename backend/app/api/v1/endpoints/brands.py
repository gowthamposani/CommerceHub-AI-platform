"""Brand Management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import get_pagination, get_search
from app.schemas.brand import BrandCreate, BrandFilter, BrandListResponse, BrandResponse, BrandStatus, BrandUpdate
from app.services.brand import BrandService

router = APIRouter(prefix="/brands", tags=["brands"])


def get_brand_service(session: AsyncSession = Depends(get_db_session)) -> BrandService:
    """Provide brand service dependency."""
    return BrandService(session)


@router.post(
    "",
    response_model=StandardResponse[BrandResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create brand",
    description="Create a brand that can later be associated with products.",
)
async def create_brand(
    payload: BrandCreate,
    request: Request,
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandResponse]:
    """Create a brand."""
    brand = await service.create_brand(payload)
    return StandardResponse.success_response(
        message="Brand created successfully",
        data=BrandResponse.model_validate(brand),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "",
    response_model=StandardResponse[BrandListResponse],
    summary="List brands",
    description="List brands with pagination, search, filtering, and sorting.",
)
async def list_brands(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    status_filter: BrandStatus | None = Query(default=None, alias="status"),
    is_active: bool | None = Query(default=None),
    country_of_origin: str | None = Query(default=None),
    sort_by: str | None = Query(default="created_at"),
    sort_direction: SortDirection = Query(default=SortDirection.DESC),
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandListResponse]:
    """List brands."""
    filters = BrandFilter(
        status=status_filter,
        is_active=is_active,
        country_of_origin=country_of_origin,
    )
    page = await service.list_brands(pagination, filters, search, sort_by, sort_direction.value)
    payload = BrandListResponse(
        items=[BrandResponse.model_validate(brand) for brand in page.items],
        meta=page.meta,
    )
    return StandardResponse.success_response(
        message="Brands retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{brand_id}",
    response_model=StandardResponse[BrandResponse],
    summary="Get brand",
    description="Retrieve a brand by brand ID.",
)
async def get_brand(
    brand_id: UUID,
    request: Request,
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandResponse]:
    """Get a brand."""
    brand = await service.get_brand(brand_id)
    return StandardResponse.success_response(
        message="Brand retrieved successfully",
        data=BrandResponse.model_validate(brand),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{brand_id}",
    response_model=StandardResponse[BrandResponse],
    summary="Update brand",
    description="Update brand name, slug, description, logo, website, country, or founded year.",
)
async def update_brand(
    brand_id: UUID,
    payload: BrandUpdate,
    request: Request,
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandResponse]:
    """Update a brand."""
    brand = await service.update_brand(brand_id, payload)
    return StandardResponse.success_response(
        message="Brand updated successfully",
        data=BrandResponse.model_validate(brand),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{brand_id}/activate",
    response_model=StandardResponse[BrandResponse],
    summary="Activate brand",
    description="Activate a brand and set status to active.",
)
async def activate_brand(
    brand_id: UUID,
    request: Request,
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandResponse]:
    """Activate a brand."""
    brand = await service.activate_brand(brand_id)
    return StandardResponse.success_response(
        message="Brand activated successfully",
        data=BrandResponse.model_validate(brand),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{brand_id}/deactivate",
    response_model=StandardResponse[BrandResponse],
    summary="Deactivate brand",
    description="Deactivate a brand and set status to inactive.",
)
async def deactivate_brand(
    brand_id: UUID,
    request: Request,
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandResponse]:
    """Deactivate a brand."""
    brand = await service.deactivate_brand(brand_id)
    return StandardResponse.success_response(
        message="Brand deactivated successfully",
        data=BrandResponse.model_validate(brand),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/{brand_id}",
    response_model=StandardResponse[BrandResponse],
    summary="Soft delete brand",
    description="Soft delete a brand without physically removing it from the database.",
)
async def delete_brand(
    brand_id: UUID,
    request: Request,
    service: BrandService = Depends(get_brand_service),
) -> StandardResponse[BrandResponse]:
    """Soft delete a brand."""
    brand = await service.soft_delete_brand(brand_id)
    return StandardResponse.success_response(
        message="Brand deleted successfully",
        data=BrandResponse.model_validate(brand),
        request_id=getattr(request.state, "request_id", None),
    )
