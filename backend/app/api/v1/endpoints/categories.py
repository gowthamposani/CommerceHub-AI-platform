"""Category Management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import get_pagination, get_search
from app.schemas.category import (
    CategoryCreate,
    CategoryFilter,
    CategoryListResponse,
    CategoryResponse,
    CategoryStatus,
    CategoryTreeResponse,
    CategoryUpdate,
)
from app.services.category import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


def get_category_service(session: AsyncSession = Depends(get_db_session)) -> CategoryService:
    """Provide category service dependency."""
    return CategoryService(session)


@router.post(
    "",
    response_model=StandardResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
    description="Create a category with optional parent category for hierarchical product classification.",
)
async def create_category(
    payload: CategoryCreate,
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryResponse]:
    """Create a category."""
    category = await service.create_category(payload)
    return StandardResponse.success_response(
        message="Category created successfully",
        data=CategoryResponse.model_validate(category),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "",
    response_model=StandardResponse[CategoryListResponse],
    summary="List categories",
    description="List categories with pagination, search, filtering, and sorting.",
)
async def list_categories(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    parent_category_id: UUID | None = Query(default=None),
    status_filter: CategoryStatus | None = Query(default=None, alias="status"),
    is_active: bool | None = Query(default=None),
    sort_by: str | None = Query(default="display_order"),
    sort_direction: SortDirection = Query(default=SortDirection.ASC),
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryListResponse]:
    """List categories."""
    filters = CategoryFilter(
        parent_category_id=parent_category_id,
        status=status_filter,
        is_active=is_active,
    )
    page = await service.list_categories(pagination, filters, search, sort_by, sort_direction.value)
    payload = CategoryListResponse(
        items=[CategoryResponse.model_validate(category) for category in page.items],
        meta=page.meta,
    )
    return StandardResponse.success_response(
        message="Categories retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/tree",
    response_model=StandardResponse[list[CategoryTreeResponse]],
    summary="Get category tree",
    description="Retrieve the hierarchical parent-child category tree for product classification.",
)
async def get_category_tree(
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[list[CategoryTreeResponse]]:
    """Get category tree."""
    tree = await service.get_category_tree()
    return StandardResponse.success_response(
        message="Category tree retrieved successfully",
        data=tree,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{category_id}",
    response_model=StandardResponse[CategoryResponse],
    summary="Get category",
    description="Retrieve a category by category ID.",
)
async def get_category(
    category_id: UUID,
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryResponse]:
    """Get a category."""
    category = await service.get_category(category_id)
    return StandardResponse.success_response(
        message="Category retrieved successfully",
        data=CategoryResponse.model_validate(category),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{category_id}",
    response_model=StandardResponse[CategoryResponse],
    summary="Update category",
    description="Update category name, slug, media, display order, or parent category.",
)
async def update_category(
    category_id: UUID,
    payload: CategoryUpdate,
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryResponse]:
    """Update a category."""
    category = await service.update_category(category_id, payload)
    return StandardResponse.success_response(
        message="Category updated successfully",
        data=CategoryResponse.model_validate(category),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{category_id}/activate",
    response_model=StandardResponse[CategoryResponse],
    summary="Activate category",
    description="Activate a category and set status to active.",
)
async def activate_category(
    category_id: UUID,
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryResponse]:
    """Activate a category."""
    category = await service.activate_category(category_id)
    return StandardResponse.success_response(
        message="Category activated successfully",
        data=CategoryResponse.model_validate(category),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{category_id}/deactivate",
    response_model=StandardResponse[CategoryResponse],
    summary="Deactivate category",
    description="Deactivate a category and set status to inactive.",
)
async def deactivate_category(
    category_id: UUID,
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryResponse]:
    """Deactivate a category."""
    category = await service.deactivate_category(category_id)
    return StandardResponse.success_response(
        message="Category deactivated successfully",
        data=CategoryResponse.model_validate(category),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/{category_id}",
    response_model=StandardResponse[CategoryResponse],
    summary="Soft delete category",
    description="Soft delete a category without physically removing it from the database.",
)
async def delete_category(
    category_id: UUID,
    request: Request,
    service: CategoryService = Depends(get_category_service),
) -> StandardResponse[CategoryResponse]:
    """Soft delete a category."""
    category = await service.soft_delete_category(category_id)
    return StandardResponse.success_response(
        message="Category deleted successfully",
        data=CategoryResponse.model_validate(category),
        request_id=getattr(request.state, "request_id", None),
    )
