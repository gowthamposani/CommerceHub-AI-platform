"""Inventory Management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import get_pagination, get_search
from app.models.inventory import Inventory
from app.schemas.inventory import (
    InventoryAdjustmentRequest,
    InventoryCreate,
    InventoryFilter,
    InventoryHistoryResponse,
    InventoryListResponse,
    InventoryOperationRequest,
    InventoryReservationResponse,
    InventoryResponse,
    InventoryStatus,
    InventoryTransactionResponse,
    InventoryUpdate,
)
from app.services.inventory import InventoryService

router = APIRouter(prefix="/inventory", tags=["inventory"])


def get_inventory_service(session: AsyncSession = Depends(get_db_session)) -> InventoryService:
    """Provide inventory service dependency."""
    return InventoryService(session)


def inventory_details(inventory: Inventory) -> InventoryResponse:
    """Build inventory response with related display labels."""
    payload = InventoryResponse.model_validate(inventory).model_dump()
    product = getattr(inventory, "product", None)
    variant = getattr(inventory, "variant", None)
    payload.update(
        {
            "product_name": getattr(product, "product_name", None),
            "category_name": getattr(getattr(product, "category", None), "category_name", None),
            "brand_name": getattr(getattr(product, "brand", None), "brand_name", None),
            "seller_name": getattr(getattr(product, "seller", None), "business_name", None),
            "variant_signature": getattr(variant, "variant_signature", None),
        }
    )
    return InventoryResponse(**payload)


@router.post(
    "",
    response_model=StandardResponse[InventoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create inventory",
    description="Create an inventory record for an existing product variant.",
)
async def create_inventory(
    payload: InventoryCreate,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Create inventory."""
    inventory = await service.create_inventory(payload)
    return StandardResponse.success_response(
        message="Inventory created successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "",
    response_model=StandardResponse[InventoryListResponse],
    summary="List inventory",
    description="List inventory with pagination, search, filtering, and sorting.",
)
async def list_inventory(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    status_filter: InventoryStatus | None = Query(default=None, alias="status"),
    low_stock: bool | None = Query(default=None),
    out_of_stock: bool | None = Query(default=None),
    category_id: UUID | None = Query(default=None),
    brand_id: UUID | None = Query(default=None),
    seller_id: UUID | None = Query(default=None),
    warehouse_id: UUID | None = Query(default=None),
    sort_by: str | None = Query(default="newest"),
    sort_direction: SortDirection = Query(default=SortDirection.DESC),
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryListResponse]:
    """List inventory records."""
    filters = InventoryFilter(
        status=status_filter,
        low_stock=low_stock,
        out_of_stock=out_of_stock,
        category_id=category_id,
        brand_id=brand_id,
        seller_id=seller_id,
        warehouse_id=warehouse_id,
    )
    page = await service.list_inventory(pagination, filters, search, sort_by, sort_direction.value)
    return StandardResponse.success_response(
        message="Inventory retrieved successfully",
        data=InventoryListResponse(items=[inventory_details(item) for item in page.items], meta=page.meta),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{inventory_id}",
    response_model=StandardResponse[InventoryResponse],
    summary="Get inventory",
    description="Retrieve an inventory record by ID.",
)
async def get_inventory(
    inventory_id: UUID,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Get inventory."""
    inventory = await service.get_inventory(inventory_id)
    return StandardResponse.success_response(
        message="Inventory retrieved successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{inventory_id}",
    response_model=StandardResponse[InventoryResponse],
    summary="Update inventory",
    description="Update inventory thresholds and transfer readiness.",
)
async def update_inventory(
    inventory_id: UUID,
    payload: InventoryUpdate,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Update inventory."""
    inventory = await service.update_inventory(inventory_id, payload)
    return StandardResponse.success_response(
        message="Inventory updated successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/{inventory_id}",
    response_model=StandardResponse[InventoryResponse],
    summary="Soft delete inventory",
    description="Soft delete inventory without removing transaction history.",
)
async def delete_inventory(
    inventory_id: UUID,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Delete inventory."""
    inventory = await service.delete_inventory(inventory_id)
    return StandardResponse.success_response(
        message="Inventory deleted successfully",
        data=InventoryResponse.model_validate(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{inventory_id}/stock-in",
    response_model=StandardResponse[InventoryResponse],
    summary="Stock in",
    description="Increase available inventory and create transaction history.",
)
async def stock_in(
    inventory_id: UUID,
    payload: InventoryOperationRequest,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Stock in."""
    inventory = await service.stock_in(inventory_id, payload)
    return StandardResponse.success_response(
        message="Stock added successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{inventory_id}/stock-out",
    response_model=StandardResponse[InventoryResponse],
    summary="Stock out",
    description="Decrease available inventory and create transaction history.",
)
async def stock_out(
    inventory_id: UUID,
    payload: InventoryOperationRequest,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Stock out."""
    inventory = await service.stock_out(inventory_id, payload)
    return StandardResponse.success_response(
        message="Stock removed successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{inventory_id}/reserve",
    response_model=StandardResponse[InventoryReservationResponse],
    summary="Reserve stock",
    description="Reserve available stock for future order or warehouse flows.",
)
async def reserve_stock(
    inventory_id: UUID,
    payload: InventoryOperationRequest,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryReservationResponse]:
    """Reserve stock."""
    reservation = await service.reserve_stock(inventory_id, payload)
    return StandardResponse.success_response(
        message="Stock reserved successfully",
        data=InventoryReservationResponse.model_validate(reservation),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{inventory_id}/release",
    response_model=StandardResponse[InventoryResponse],
    summary="Release reserved stock",
    description="Release reserved stock back to available inventory.",
)
async def release_stock(
    inventory_id: UUID,
    payload: InventoryOperationRequest,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Release reserved stock."""
    inventory = await service.release_reserved_stock(inventory_id, payload)
    return StandardResponse.success_response(
        message="Reserved stock released successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{inventory_id}/adjust",
    response_model=StandardResponse[InventoryResponse],
    summary="Adjust inventory",
    description="Adjust available or damaged inventory and create transaction history.",
)
async def adjust_inventory(
    inventory_id: UUID,
    payload: InventoryAdjustmentRequest,
    request: Request,
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryResponse]:
    """Adjust inventory."""
    inventory = await service.adjust_inventory(inventory_id, payload)
    return StandardResponse.success_response(
        message="Inventory adjusted successfully",
        data=inventory_details(inventory),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{inventory_id}/history",
    response_model=StandardResponse[InventoryHistoryResponse],
    summary="Inventory history",
    description="Retrieve inventory transaction history.",
)
async def inventory_history(
    inventory_id: UUID,
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    service: InventoryService = Depends(get_inventory_service),
) -> StandardResponse[InventoryHistoryResponse]:
    """Get inventory history."""
    page = await service.inventory_history(inventory_id, pagination)
    return StandardResponse.success_response(
        message="Inventory history retrieved successfully",
        data=InventoryHistoryResponse(
            items=[InventoryTransactionResponse.model_validate(item) for item in page.items],
            meta=page.meta,
        ),
        request_id=getattr(request.state, "request_id", None),
    )
