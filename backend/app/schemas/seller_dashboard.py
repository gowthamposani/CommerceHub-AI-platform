"""Schemas for Seller Dashboard aggregation APIs."""

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import Field, model_validator

from app.common.pagination import PageMeta
from app.schemas.base import BaseSchema


class DashboardDatePreset(StrEnum):
    """Supported dashboard date presets."""

    TODAY = "today"
    YESTERDAY = "yesterday"
    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    THIS_MONTH = "this_month"
    PREVIOUS_MONTH = "previous_month"
    QUARTER = "quarter"
    YEAR = "year"
    CUSTOM = "custom"


class DashboardDateFilter(BaseSchema):
    """Date range inputs for dashboard aggregation."""

    preset: DashboardDatePreset = DashboardDatePreset.LAST_30_DAYS
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def validate_custom_range(self) -> "DashboardDateFilter":
        """Require and validate custom date ranges."""
        if self.preset == DashboardDatePreset.CUSTOM and (self.start_date is None or self.end_date is None):
            raise ValueError("Custom dashboard ranges require start_date and end_date")
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("start_date cannot be greater than end_date")
        return self


class DashboardDateWindow(BaseSchema):
    """Resolved dashboard date window."""

    preset: DashboardDatePreset
    start_at: datetime
    end_at: datetime


class SellerSummary(BaseSchema):
    """Seller profile summary for the dashboard."""

    seller_id: UUID
    user_id: UUID
    store_name: str
    seller_status: str
    store_rating: Decimal = Decimal("0.00")
    store_health_score: int = Field(default=0, ge=0, le=100)
    account_verification_status: bool
    business_email: str
    business_phone: str
    logo_url: str | None = None


class ProductMetrics(BaseSchema):
    """Product dashboard metrics."""

    total_products: int = 0
    active_products: int = 0
    draft_products: int = 0
    disabled_products: int = 0
    out_of_stock_products: int = 0
    low_stock_products: int = 0
    best_selling_products: list["DashboardRankedItem"] = Field(default_factory=list)
    newly_added_products: list["DashboardRankedItem"] = Field(default_factory=list)


class InventoryMetrics(BaseSchema):
    """Inventory dashboard metrics."""

    total_inventory: int = 0
    reserved_inventory: int = 0
    available_inventory: int = 0
    damaged_inventory: int = 0
    inventory_value: Decimal = Decimal("0.00")
    stock_alerts: list["DashboardAlert"] = Field(default_factory=list)


class WarehouseMetrics(BaseSchema):
    """Warehouse dashboard metrics."""

    total_warehouses: int = 0
    active_warehouses: int = 0
    disabled_warehouses: int = 0
    capacity_utilization: Decimal = Decimal("0.00")
    inventory_distribution: list["DashboardChartPoint"] = Field(default_factory=list)
    warehouse_performance: list["DashboardRankedItem"] = Field(default_factory=list)


class OrderMetrics(BaseSchema):
    """Order dashboard metrics.

    Order ownership belongs to another module. Values remain zero until that module
    exposes persistence/contracts for aggregation.
    """

    total_orders: int = 0
    pending_orders: int = 0
    confirmed_orders: int = 0
    packed_orders: int = 0
    shipped_orders: int = 0
    delivered_orders: int = 0
    cancelled_orders: int = 0
    returned_orders: int = 0


class RevenueMetrics(BaseSchema):
    """Revenue dashboard metrics.

    Revenue depends on the Order/Payment modules and is intentionally empty until
    those module contracts are available.
    """

    today_revenue: Decimal = Decimal("0.00")
    weekly_revenue: Decimal = Decimal("0.00")
    monthly_revenue: Decimal = Decimal("0.00")
    yearly_revenue: Decimal = Decimal("0.00")
    total_revenue: Decimal = Decimal("0.00")
    average_order_value: Decimal = Decimal("0.00")
    revenue_growth_percentage: Decimal = Decimal("0.00")


class CustomerMetrics(BaseSchema):
    """Customer dashboard metrics.

    Customer analytics depends on the Customer/Order modules and is intentionally
    empty until those contracts are available.
    """

    total_customers: int = 0
    returning_customers: int = 0
    new_customers: int = 0
    customer_retention_rate: Decimal = Decimal("0.00")
    customer_satisfaction_score: Decimal = Decimal("0.00")


class DashboardAlert(BaseSchema):
    """Operational dashboard alert."""

    id: str
    type: str
    severity: str
    title: str
    message: str
    entity_id: UUID | None = None
    entity_type: str | None = None
    created_at: datetime


class DashboardChartPoint(BaseSchema):
    """Generic chart point."""

    label: str
    value: Decimal | int
    metadata: dict[str, str | int | Decimal] = Field(default_factory=dict)


class DashboardTrendPoint(BaseSchema):
    """Time-series chart point."""

    period: str
    value: Decimal | int


class DashboardRankedItem(BaseSchema):
    """Ranked dashboard item for top/new lists."""

    id: UUID
    label: str
    value: Decimal | int | str
    metadata: dict[str, str | int | Decimal] = Field(default_factory=dict)


class DashboardCharts(BaseSchema):
    """Dashboard chart collection."""

    sales_trend: list[DashboardTrendPoint] = Field(default_factory=list)
    revenue_trend: list[DashboardTrendPoint] = Field(default_factory=list)
    inventory_trend: list[DashboardTrendPoint] = Field(default_factory=list)
    order_trend: list[DashboardTrendPoint] = Field(default_factory=list)
    top_products: list[DashboardRankedItem] = Field(default_factory=list)
    category_sales: list[DashboardChartPoint] = Field(default_factory=list)
    warehouse_capacity: list[DashboardChartPoint] = Field(default_factory=list)
    customer_growth: list[DashboardTrendPoint] = Field(default_factory=list)
    revenue_by_month: list[DashboardTrendPoint] = Field(default_factory=list)
    orders_by_status: list[DashboardChartPoint] = Field(default_factory=list)
    top_selling_categories: list[DashboardRankedItem] = Field(default_factory=list)
    top_selling_products: list[DashboardRankedItem] = Field(default_factory=list)


class DashboardActivity(BaseSchema):
    """Recent dashboard activity."""

    id: str
    type: str
    label: str
    description: str
    entity_id: UUID | None = None
    entity_type: str | None = None
    created_at: datetime


class DashboardSearchResult(BaseSchema):
    """Dashboard search result item."""

    id: UUID
    type: str
    label: str
    description: str | None = None
    status: str | None = None
    created_at: datetime


class DashboardSearchResponse(BaseSchema):
    """Dashboard search response."""

    items: list[DashboardSearchResult]
    meta: PageMeta


class SellerDashboardOverview(BaseSchema):
    """Complete seller dashboard overview."""

    date_window: DashboardDateWindow
    seller: SellerSummary
    products: ProductMetrics
    inventory: InventoryMetrics
    warehouses: WarehouseMetrics
    orders: OrderMetrics
    revenue: RevenueMetrics
    customers: CustomerMetrics
    alerts: list[DashboardAlert]
    charts: DashboardCharts
    recent_activities: list[DashboardActivity]


ProductMetrics.model_rebuild()
InventoryMetrics.model_rebuild()
WarehouseMetrics.model_rebuild()
