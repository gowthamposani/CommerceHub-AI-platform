"""Service layer for Seller Dashboard aggregation."""

import logging
from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.common.pagination import PaginationParams
from app.dependencies.request import CurrentUserPlaceholder
from app.exceptions.base import ApplicationError
from app.models.seller import Seller
from app.repositories.seller_dashboard import SellerDashboardRepository
from app.schemas.seller_dashboard import (
    CustomerMetrics,
    DashboardCharts,
    DashboardDateFilter,
    DashboardDatePreset,
    DashboardDateWindow,
    DashboardSearchResponse,
    OrderMetrics,
    RevenueMetrics,
    SellerDashboardOverview,
    SellerSummary,
)

logger = logging.getLogger(__name__)


class SellerDashboardService:
    """Business rules and orchestration for seller dashboard APIs."""

    def __init__(
        self,
        session: AsyncSession,
        repository: SellerDashboardRepository | None = None,
    ) -> None:
        self.session = session
        self.repository = repository or SellerDashboardRepository(session)

    async def overview(
        self,
        seller_id: UUID,
        date_filter: DashboardDateFilter,
        current_user: CurrentUserPlaceholder,
    ) -> SellerDashboardOverview:
        """Return the complete seller dashboard overview."""
        start_time = datetime.now(UTC)
        seller = await self._require_accessible_seller(seller_id, current_user)
        window = self._resolve_date_window(date_filter)
        products = await self.repository.product_metrics(seller.id, window.start_at, window.end_at)
        inventory = await self.repository.inventory_metrics(seller.id)
        warehouses = await self.repository.warehouse_metrics(seller.id)
        alerts = [*inventory.stock_alerts, *(await self.repository.warehouse_capacity_alerts(seller.id, limit=5))]
        charts = await self.charts(seller.id, date_filter, current_user)
        activities = await self.repository.recent_activities(seller.id, limit=20)
        elapsed_ms = int((datetime.now(UTC) - start_time).total_seconds() * 1000)
        logger.info(
            "Seller dashboard overview generated",
            extra={"seller_id": str(seller.id), "elapsed_ms": elapsed_ms},
        )
        return SellerDashboardOverview(
            date_window=window,
            seller=self._seller_summary(seller, products.total_products, alerts_count=len(alerts)),
            products=products,
            inventory=inventory,
            warehouses=warehouses,
            orders=OrderMetrics(),
            revenue=RevenueMetrics(),
            customers=CustomerMetrics(),
            alerts=alerts,
            charts=charts,
            recent_activities=activities,
        )

    async def seller_summary(
        self,
        seller_id: UUID,
        current_user: CurrentUserPlaceholder,
    ) -> SellerSummary:
        """Return seller summary."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        product_metrics = await self.repository.product_metrics(
            seller.id,
            datetime.min.replace(tzinfo=UTC),
            datetime.now(UTC),
        )
        alerts = await self.repository.stock_alerts(seller.id, limit=50)
        return self._seller_summary(seller, product_metrics.total_products, len(alerts))

    async def product_metrics(
        self,
        seller_id: UUID,
        date_filter: DashboardDateFilter,
        current_user: CurrentUserPlaceholder,
    ):
        """Return product metrics."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        window = self._resolve_date_window(date_filter)
        return await self.repository.product_metrics(seller.id, window.start_at, window.end_at)

    async def inventory_metrics(self, seller_id: UUID, current_user: CurrentUserPlaceholder):
        """Return inventory metrics."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        return await self.repository.inventory_metrics(seller.id)

    async def warehouse_metrics(self, seller_id: UUID, current_user: CurrentUserPlaceholder):
        """Return warehouse metrics."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        return await self.repository.warehouse_metrics(seller.id)

    async def charts(
        self,
        seller_id: UUID,
        date_filter: DashboardDateFilter,
        current_user: CurrentUserPlaceholder,
    ) -> DashboardCharts:
        """Return dashboard chart data."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        window = self._resolve_date_window(date_filter)
        product_trend = await self.repository.product_creation_trend(seller.id, window.start_at, window.end_at)
        inventory_trend = await self.repository.inventory_movement_trend(seller.id, window.start_at, window.end_at)
        top_products = await self.repository.top_products(seller.id, limit=10)
        category_points = await self.repository.category_product_points(seller.id)
        warehouse_capacity = await self.repository.warehouse_capacity_points(seller.id)
        return DashboardCharts(
            sales_trend=product_trend,
            revenue_trend=[],
            inventory_trend=inventory_trend,
            order_trend=[],
            top_products=top_products,
            category_sales=category_points,
            warehouse_capacity=warehouse_capacity,
            customer_growth=[],
            revenue_by_month=[],
            orders_by_status=[],
            top_selling_categories=[],
            top_selling_products=top_products,
        )

    async def alerts(self, seller_id: UUID, current_user: CurrentUserPlaceholder):
        """Return operational dashboard alerts."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        return [
            *(await self.repository.stock_alerts(seller.id, limit=25)),
            *(await self.repository.warehouse_capacity_alerts(seller.id, limit=10)),
        ]

    async def recent_activities(self, seller_id: UUID, current_user: CurrentUserPlaceholder):
        """Return recent dashboard activities."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        return await self.repository.recent_activities(seller.id, limit=30)

    async def search(
        self,
        seller_id: UUID,
        query: str,
        params: PaginationParams,
        current_user: CurrentUserPlaceholder,
    ) -> DashboardSearchResponse:
        """Search dashboard resources scoped to seller."""
        seller = await self._require_accessible_seller(seller_id, current_user)
        normalized = query.strip()
        if not normalized:
            raise ApplicationError("Search query cannot be blank", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
        return await self.repository.search(seller.id, normalized, params)

    async def order_metrics(self, seller_id: UUID, current_user: CurrentUserPlaceholder) -> OrderMetrics:
        """Return order metrics placeholder until order contracts exist."""
        await self._require_accessible_seller(seller_id, current_user)
        return OrderMetrics()

    async def revenue_metrics(self, seller_id: UUID, current_user: CurrentUserPlaceholder) -> RevenueMetrics:
        """Return revenue metrics placeholder until order/payment contracts exist."""
        await self._require_accessible_seller(seller_id, current_user)
        return RevenueMetrics()

    async def customer_metrics(self, seller_id: UUID, current_user: CurrentUserPlaceholder) -> CustomerMetrics:
        """Return customer metrics placeholder until customer/order contracts exist."""
        await self._require_accessible_seller(seller_id, current_user)
        return CustomerMetrics()

    async def _require_accessible_seller(
        self,
        seller_id: UUID,
        current_user: CurrentUserPlaceholder,
    ) -> Seller:
        """Require seller and enforce role-based seller scoping when available."""
        effective_seller_id = seller_id
        if current_user.role == UserRole.SELLER and current_user.id is not None:
            effective_seller_id = current_user.id
            if seller_id != current_user.id:
                raise ApplicationError("Forbidden", status_code=status.HTTP_403_FORBIDDEN)
        elif current_user.role not in {UserRole.ANONYMOUS, UserRole.ADMIN}:
            raise ApplicationError("Forbidden", status_code=status.HTTP_403_FORBIDDEN)

        seller = await self.repository.get_seller(effective_seller_id)
        if seller is None:
            raise ApplicationError("Seller not found", status_code=status.HTTP_404_NOT_FOUND)
        return seller

    def _seller_summary(self, seller: Seller, total_products: int, alerts_count: int) -> SellerSummary:
        """Build seller summary with a deterministic health score."""
        score = 100
        if not seller.is_verified:
            score -= 20
        if seller.status != "active":
            score -= 25
        if not seller.logo_url:
            score -= 5
        if not seller.website:
            score -= 5
        if total_products == 0:
            score -= 10
        score -= min(alerts_count * 2, 20)
        return SellerSummary(
            seller_id=seller.id,
            user_id=seller.user_id,
            store_name=seller.business_name,
            seller_status=seller.status,
            store_rating=Decimal("0.00"),
            store_health_score=max(score, 0),
            account_verification_status=seller.is_verified,
            business_email=seller.business_email,
            business_phone=seller.business_phone,
            logo_url=seller.logo_url,
        )

    def _resolve_date_window(self, date_filter: DashboardDateFilter) -> DashboardDateWindow:
        """Resolve a dashboard date preset into a UTC datetime window."""
        today = datetime.now(UTC).date()
        start_date, end_date = self._resolve_dates(date_filter, today)
        return DashboardDateWindow(
            preset=date_filter.preset,
            start_at=datetime.combine(start_date, time.min, tzinfo=UTC),
            end_at=datetime.combine(end_date, time.max, tzinfo=UTC),
        )

    def _resolve_dates(self, date_filter: DashboardDateFilter, today: date) -> tuple[date, date]:
        """Resolve date objects from a preset."""
        if date_filter.preset == DashboardDatePreset.TODAY:
            return today, today
        if date_filter.preset == DashboardDatePreset.YESTERDAY:
            yesterday = today - timedelta(days=1)
            return yesterday, yesterday
        if date_filter.preset == DashboardDatePreset.LAST_7_DAYS:
            return today - timedelta(days=6), today
        if date_filter.preset == DashboardDatePreset.LAST_30_DAYS:
            return today - timedelta(days=29), today
        if date_filter.preset == DashboardDatePreset.THIS_MONTH:
            return today.replace(day=1), today
        if date_filter.preset == DashboardDatePreset.PREVIOUS_MONTH:
            first_this_month = today.replace(day=1)
            last_previous_month = first_this_month - timedelta(days=1)
            return last_previous_month.replace(day=1), last_previous_month
        if date_filter.preset == DashboardDatePreset.QUARTER:
            quarter_start_month = ((today.month - 1) // 3) * 3 + 1
            return today.replace(month=quarter_start_month, day=1), today
        if date_filter.preset == DashboardDatePreset.YEAR:
            return today.replace(month=1, day=1), today
        if date_filter.start_date and date_filter.end_date:
            return date_filter.start_date, date_filter.end_date
        return today - timedelta(days=29), today
