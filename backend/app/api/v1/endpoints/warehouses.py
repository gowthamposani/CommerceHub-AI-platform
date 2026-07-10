"""Warehouse Management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import CurrentUserPlaceholder, get_current_user_placeholder, get_pagination, get_search
from app.models.warehouse import Warehouse
from app.schemas.warehouse import (
    WarehouseActivityListResponse,
    WarehouseCapacityResponse,
    WarehouseCreate,
    WarehouseFilter,
    WarehouseInventorySummaryResponse,
    WarehouseListResponse,
    WarehouseResponse,
    WarehouseStatisticsResponse,
    WarehouseStatus,
    WarehouseStatusUpdate,
    WarehouseTransferRequest,
    WarehouseTransferResponse,
    WarehouseType,
    WarehouseUpdate,
)
from app.services.warehouse import WarehouseService

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


def get_warehouse_service(session: AsyncSession = Depends(get_db_session)) -> WarehouseService:
    """Provide warehouse service dependency."""
    return WarehouseService(session)


def warehouse_details(warehouse: Warehouse) -> WarehouseResponse:
    """Build warehouse response with seller display label."""
    payload = WarehouseResponse.model_validate(warehouse).model_dump()
    payload["seller_name"] = getattr(getattr(warehouse, "seller", None), "business_name", None)
    return WarehouseResponse(**payload)


@router.post(
    "",
    response_model=StandardResponse[WarehouseResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create warehouse",
    description="Create a seller-owned warehouse location.",
)
async def create_warehouse(
    payload: WarehouseCreate,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseResponse]:
    """Create warehouse."""
    warehouse = await service.create_warehouse(payload, current_user)
    return StandardResponse.success_response(
        message="Warehouse created successfully",
        data=warehouse_details(warehouse),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "",
    response_model=StandardResponse[WarehouseListResponse],
    summary="List warehouses",
    description="List warehouses with pagination, searching, filtering, and sorting.",
)
async def list_warehouses(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    seller_id: UUID | None = Query(default=None),
    status_filter: WarehouseStatus | None = Query(default=None, alias="status"),
    warehouse_type: WarehouseType | None = Query(default=None),
    city: str | None = Query(default=None),
    state: str | None = Query(default=None),
    country: str | None = Query(default=None),
    is_default: bool | None = Query(default=None),
    sort_by: str | None = Query(default="newest"),
    sort_direction: SortDirection = Query(default=SortDirection.DESC),
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseListResponse]:
    """List warehouses."""
    filters = WarehouseFilter(
        seller_id=seller_id,
        status=status_filter,
        warehouse_type=warehouse_type,
        city=city,
        state=state,
        country=country,
        is_default=is_default,
    )
    page = await service.list_warehouses(pagination, filters, search, sort_by, sort_direction.value, current_user)
    return StandardResponse.success_response(
        message="Warehouses retrieved successfully",
        data=WarehouseListResponse(items=[warehouse_details(item) for item in page.items], meta=page.meta),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/statistics",
    response_model=StandardResponse[WarehouseStatisticsResponse],
    summary="Warehouse statistics",
    description="Return warehouse and inventory statistics.",
)
async def warehouse_statistics(
    request: Request,
    seller_id: UUID | None = Query(default=None),
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseStatisticsResponse]:
    """Get warehouse statistics."""
    payload = await service.statistics(seller_id, current_user)
    return StandardResponse.success_response(
        message="Warehouse statistics retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{warehouse_id}",
    response_model=StandardResponse[WarehouseResponse],
    summary="Get warehouse",
    description="Retrieve a warehouse by ID.",
)
async def get_warehouse(
    warehouse_id: UUID,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseResponse]:
    """Get warehouse."""
    warehouse = await service.get_warehouse(warehouse_id, current_user)
    return StandardResponse.success_response(
        message="Warehouse retrieved successfully",
        data=warehouse_details(warehouse),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/transfers",
    response_model=StandardResponse[WarehouseTransferResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Transfer warehouse inventory",
    description="Transfer available inventory from one warehouse to another warehouse for the same seller.",
)
async def transfer_warehouse_inventory(
    payload: WarehouseTransferRequest,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseTransferResponse]:
    """Transfer inventory between warehouses."""
    transfer = await service.transfer_inventory(payload, current_user)
    return StandardResponse.success_response(
        message="Warehouse inventory transferred successfully",
        data=transfer,
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{warehouse_id}",
    response_model=StandardResponse[WarehouseResponse],
    summary="Update warehouse",
    description="Update warehouse contact, address, type, status, or default flag.",
)
async def update_warehouse(
    warehouse_id: UUID,
    payload: WarehouseUpdate,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseResponse]:
    """Update warehouse."""
    warehouse = await service.update_warehouse(warehouse_id, payload, current_user)
    return StandardResponse.success_response(
        message="Warehouse updated successfully",
        data=warehouse_details(warehouse),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{warehouse_id}/activity",
    response_model=StandardResponse[WarehouseActivityListResponse],
    summary="Warehouse activity",
    description="Return warehouse activity timeline derived from warehouse and inventory events.",
)
async def warehouse_activity(
    warehouse_id: UUID,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseActivityListResponse]:
    """Get warehouse activity."""
    payload = await service.activity(warehouse_id, current_user)
    return StandardResponse.success_response(
        message="Warehouse activity retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/{warehouse_id}",
    response_model=StandardResponse[WarehouseResponse],
    summary="Delete warehouse",
    description="Soft delete a warehouse when inventory has been transferred or no inventory exists.",
)
async def delete_warehouse(
    warehouse_id: UUID,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseResponse]:
    """Delete warehouse."""
    warehouse = await service.delete_warehouse(warehouse_id, current_user)
    return StandardResponse.success_response(
        message="Warehouse deleted successfully",
        data=WarehouseResponse.model_validate(warehouse),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{warehouse_id}/default",
    response_model=StandardResponse[WarehouseResponse],
    summary="Set default warehouse",
    description="Set a warehouse as the only default warehouse for its seller.",
)
async def set_default_warehouse(
    warehouse_id: UUID,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseResponse]:
    """Set default warehouse."""
    warehouse = await service.set_default_warehouse(warehouse_id, current_user)
    return StandardResponse.success_response(
        message="Default warehouse updated successfully",
        data=warehouse_details(warehouse),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{warehouse_id}/status",
    response_model=StandardResponse[WarehouseResponse],
    summary="Update warehouse status",
    description="Update warehouse status.",
)
async def update_warehouse_status(
    warehouse_id: UUID,
    payload: WarehouseStatusUpdate,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseResponse]:
    """Update warehouse status."""
    warehouse = await service.update_status(warehouse_id, payload, current_user)
    return StandardResponse.success_response(
        message="Warehouse status updated successfully",
        data=warehouse_details(warehouse),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{warehouse_id}/capacity",
    response_model=StandardResponse[WarehouseCapacityResponse],
    summary="Warehouse capacity",
    description="Return warehouse capacity utilization based on inventory maximum stock settings.",
)
async def warehouse_capacity(
    warehouse_id: UUID,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseCapacityResponse]:
    """Get warehouse capacity."""
    payload = await service.capacity(warehouse_id, current_user)
    return StandardResponse.success_response(
        message="Warehouse capacity retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{warehouse_id}/inventory-summary",
    response_model=StandardResponse[WarehouseInventorySummaryResponse],
    summary="Warehouse inventory summary",
    description="Return inventory summary for a warehouse.",
)
async def warehouse_inventory_summary(
    warehouse_id: UUID,
    request: Request,
    service: WarehouseService = Depends(get_warehouse_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseInventorySummaryResponse]:
    """Get warehouse inventory summary."""
    payload = await service.inventory_summary(warehouse_id, current_user)
    return StandardResponse.success_response(
        message="Warehouse inventory summary retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )
