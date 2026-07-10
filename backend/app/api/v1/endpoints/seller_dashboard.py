"""Seller Dashboard API endpoints."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import CurrentUserPlaceholder, get_current_user_placeholder, get_pagination
from app.schemas.seller_dashboard import (
    CustomerMetrics,
    DashboardActivity,
    DashboardAlert,
    DashboardCharts,
    DashboardDateFilter,
    DashboardDatePreset,
    DashboardSearchResponse,
    InventoryMetrics,
    OrderMetrics,
    ProductMetrics,
    RevenueMetrics,
    SellerDashboardOverview,
    SellerSummary,
    WarehouseMetrics,
)
from app.services.seller_dashboard import SellerDashboardService

router = APIRouter(prefix="/seller-dashboard", tags=["seller-dashboard"])


def get_seller_dashboard_service(session: AsyncSession = Depends(get_db_session)) -> SellerDashboardService:
    """Provide seller dashboard service dependency."""
    return SellerDashboardService(session)


def dashboard_date_filter(
    preset: DashboardDatePreset = Query(default=DashboardDatePreset.LAST_30_DAYS),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
) -> DashboardDateFilter:
    """Provide validated dashboard date filtering."""
    return DashboardDateFilter(preset=preset, start_date=start_date, end_date=end_date)


@router.get(
    "/overview",
    response_model=StandardResponse[SellerDashboardOverview],
    summary="Seller dashboard overview",
    description="Return seller profile, product, inventory, warehouse, alert, chart, and activity aggregates.",
)
async def dashboard_overview(
    seller_id: UUID,
    request: Request,
    date_filter: DashboardDateFilter = Depends(dashboard_date_filter),
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[SellerDashboardOverview]:
    """Return complete dashboard overview."""
    data = await service.overview(seller_id, date_filter, current_user)
    return StandardResponse.success_response(
        message="Seller dashboard overview retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/summary",
    response_model=StandardResponse[SellerSummary],
    summary="Seller dashboard summary",
    description="Return seller store status, verification, rating placeholder, and health score.",
)
async def seller_summary(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[SellerSummary]:
    """Return seller summary."""
    data = await service.seller_summary(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller dashboard summary retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/products",
    response_model=StandardResponse[ProductMetrics],
    summary="Seller product metrics",
    description="Return seller-owned product counts, stock state counts, top products, and new products.",
)
async def product_metrics(
    seller_id: UUID,
    request: Request,
    date_filter: DashboardDateFilter = Depends(dashboard_date_filter),
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[ProductMetrics]:
    """Return product dashboard metrics."""
    data = await service.product_metrics(seller_id, date_filter, current_user)
    return StandardResponse.success_response(
        message="Seller product metrics retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/inventory",
    response_model=StandardResponse[InventoryMetrics],
    summary="Seller inventory metrics",
    description="Return seller inventory balances, valuation, and stock alerts.",
)
async def inventory_metrics(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[InventoryMetrics]:
    """Return inventory dashboard metrics."""
    data = await service.inventory_metrics(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller inventory metrics retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/warehouses",
    response_model=StandardResponse[WarehouseMetrics],
    summary="Seller warehouse metrics",
    description="Return warehouse counts, capacity utilization, distribution, and performance ranking.",
)
async def warehouse_metrics(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[WarehouseMetrics]:
    """Return warehouse dashboard metrics."""
    data = await service.warehouse_metrics(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller warehouse metrics retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/orders",
    response_model=StandardResponse[OrderMetrics],
    summary="Seller order metrics",
    description="Return order metrics when the Order module persistence contract is available.",
)
async def order_metrics(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[OrderMetrics]:
    """Return order dashboard metrics."""
    data = await service.order_metrics(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller order metrics retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/revenue",
    response_model=StandardResponse[RevenueMetrics],
    summary="Seller revenue metrics",
    description="Return revenue metrics when Order and Payment module persistence contracts are available.",
)
async def revenue_metrics(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[RevenueMetrics]:
    """Return revenue dashboard metrics."""
    data = await service.revenue_metrics(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller revenue metrics retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/customers",
    response_model=StandardResponse[CustomerMetrics],
    summary="Seller customer metrics",
    description="Return customer metrics when Customer and Order module persistence contracts are available.",
)
async def customer_metrics(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[CustomerMetrics]:
    """Return customer dashboard metrics."""
    data = await service.customer_metrics(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller customer metrics retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/alerts",
    response_model=StandardResponse[list[DashboardAlert]],
    summary="Seller dashboard alerts",
    description="Return operational alerts for stock and warehouse capacity.",
)
async def dashboard_alerts(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[list[DashboardAlert]]:
    """Return dashboard alerts."""
    data = await service.alerts(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller dashboard alerts retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/charts",
    response_model=StandardResponse[DashboardCharts],
    summary="Seller dashboard charts",
    description="Return chart-ready seller dashboard analytics.",
)
async def dashboard_charts(
    seller_id: UUID,
    request: Request,
    date_filter: DashboardDateFilter = Depends(dashboard_date_filter),
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[DashboardCharts]:
    """Return dashboard charts."""
    data = await service.charts(seller_id, date_filter, current_user)
    return StandardResponse.success_response(
        message="Seller dashboard charts retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/recent-activities",
    response_model=StandardResponse[list[DashboardActivity]],
    summary="Seller dashboard recent activities",
    description="Return recent seller activity derived from products, inventory, and warehouses.",
)
async def recent_activities(
    seller_id: UUID,
    request: Request,
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[list[DashboardActivity]]:
    """Return recent dashboard activities."""
    data = await service.recent_activities(seller_id, current_user)
    return StandardResponse.success_response(
        message="Seller dashboard activities retrieved successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/search",
    response_model=StandardResponse[DashboardSearchResponse],
    summary="Seller dashboard search",
    description="Search seller-owned products, inventory records, and warehouses.",
)
async def dashboard_search(
    seller_id: UUID,
    request: Request,
    q: str = Query(..., min_length=1, max_length=255),
    pagination: PaginationParams = Depends(get_pagination),
    service: SellerDashboardService = Depends(get_seller_dashboard_service),
    current_user: CurrentUserPlaceholder = Depends(get_current_user_placeholder),
) -> StandardResponse[DashboardSearchResponse]:
    """Return dashboard search results."""
    data = await service.search(seller_id, q, pagination, current_user)
    return StandardResponse.success_response(
        message="Seller dashboard search completed successfully",
        data=data,
        request_id=getattr(request.state, "request_id", None),
    )
