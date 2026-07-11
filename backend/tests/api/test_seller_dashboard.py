"""Seller Dashboard API tests."""

from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.common.pagination import PaginationParams
from app.dependencies.request import CurrentUserPlaceholder
from app.exceptions.base import ApplicationError
from app.schemas.seller_dashboard import DashboardDateFilter
from app.services.seller_dashboard import SellerDashboardService
from tests.api.test_inventory import create_variant
from tests.api.test_products import create_active_seller, create_product
from tests.api.test_warehouses import create_warehouse


async def create_dashboard_fixture(api_client: AsyncClient) -> dict[str, object]:
    """Create seller-owned product, warehouse, and inventory records for dashboard tests."""
    product = await create_product(
        api_client,
        product_name="Dashboard Phone",
        product_slug=f"dashboard-{uuid4().hex[:8]}",
    )
    publish_response = await api_client.patch(
        f"/api/v1/products/{product['id']}/publish",
        json={"visibility": "public"},
    )
    assert publish_response.status_code == 200
    product = publish_response.json()["data"]
    warehouse = await create_warehouse(api_client, str(product["seller_id"]), warehouse_name="Dashboard Warehouse")
    variant = await create_variant(api_client, product["id"])
    inventory_response = await api_client.post(
        "/api/v1/inventory",
        json={
            "product_id": product["id"],
            "variant_id": variant["id"],
            "warehouse_id": warehouse["id"],
            "available_quantity": 2,
            "reserved_quantity": 1,
            "damaged_quantity": 0,
            "minimum_stock": 1,
            "maximum_stock": 10,
            "reorder_level": 3,
            "transfer_ready": True,
        },
    )
    assert inventory_response.status_code == 201
    inventory = inventory_response.json()["data"]
    stock_in_response = await api_client.post(
        f"/api/v1/inventory/{inventory['id']}/stock-in",
        json={"quantity": 5, "reference_number": "DASH-STOCK-IN"},
    )
    assert stock_in_response.status_code == 200
    return {"product": product, "warehouse": warehouse, "inventory": stock_in_response.json()["data"]}


@pytest.mark.anyio
async def test_seller_dashboard_overview_aggregates_existing_modules(api_client: AsyncClient) -> None:
    """Dashboard overview returns real seller/product/inventory/warehouse aggregates."""
    fixture = await create_dashboard_fixture(api_client)
    product = fixture["product"]

    response = await api_client.get(
        "/api/v1/seller-dashboard/overview",
        params={"seller_id": product["seller_id"], "preset": "last_30_days"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["seller"]["seller_id"] == product["seller_id"]
    assert data["products"]["total_products"] == 1
    assert data["products"]["active_products"] == 1
    assert data["inventory"]["available_inventory"] == 7
    assert data["inventory"]["reserved_inventory"] == 1
    assert data["warehouses"]["total_warehouses"] == 1
    assert data["orders"]["total_orders"] == 0
    assert data["revenue"]["total_revenue"] == "0.00"
    assert data["customers"]["total_customers"] == 0
    assert data["charts"]["warehouse_capacity"][0]["value"] == 8
    assert data["recent_activities"]


@pytest.mark.anyio
async def test_seller_dashboard_empty_dataset_returns_zero_metrics(api_client: AsyncClient) -> None:
    """Dashboard returns a valid zero-state for a seller without products, inventory, or warehouses."""
    seller = await create_active_seller(api_client)

    response = await api_client.get("/api/v1/seller-dashboard/overview", params={"seller_id": seller["id"]})

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["seller"]["seller_id"] == seller["id"]
    assert data["products"]["total_products"] == 0
    assert data["inventory"]["total_inventory"] == 0
    assert data["warehouses"]["total_warehouses"] == 0
    assert data["alerts"] == []


@pytest.mark.anyio
async def test_seller_dashboard_missing_required_seller_id_is_rejected(api_client: AsyncClient) -> None:
    """Dashboard endpoints reject requests without seller scope."""
    response = await api_client.get("/api/v1/seller-dashboard/overview")

    assert response.status_code == 422


@pytest.mark.anyio
async def test_seller_dashboard_metrics_update_after_inventory_change(api_client: AsyncClient) -> None:
    """Dashboard metrics and alerts reflect inventory business events."""
    fixture = await create_dashboard_fixture(api_client)
    product = fixture["product"]
    inventory = fixture["inventory"]

    stock_out_response = await api_client.post(f"/api/v1/inventory/{inventory['id']}/stock-out", json={"quantity": 5})
    assert stock_out_response.status_code == 200

    response = await api_client.get("/api/v1/seller-dashboard/overview", params={"seller_id": product["seller_id"]})

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["inventory"]["available_inventory"] == 2
    assert data["products"]["low_stock_products"] == 1
    assert any(alert["type"] == "low_stock" for alert in data["alerts"])


@pytest.mark.anyio
async def test_seller_dashboard_resource_endpoints(api_client: AsyncClient) -> None:
    """Dashboard resource endpoints expose focused aggregate slices."""
    fixture = await create_dashboard_fixture(api_client)
    product = fixture["product"]
    seller_id = product["seller_id"]

    products = await api_client.get("/api/v1/seller-dashboard/products", params={"seller_id": seller_id})
    inventory = await api_client.get("/api/v1/seller-dashboard/inventory", params={"seller_id": seller_id})
    warehouses = await api_client.get("/api/v1/seller-dashboard/warehouses", params={"seller_id": seller_id})
    charts = await api_client.get("/api/v1/seller-dashboard/charts", params={"seller_id": seller_id})
    activities = await api_client.get("/api/v1/seller-dashboard/recent-activities", params={"seller_id": seller_id})

    assert products.status_code == 200
    assert products.json()["data"]["total_products"] == 1
    assert inventory.status_code == 200
    assert inventory.json()["data"]["total_inventory"] == 8
    assert warehouses.status_code == 200
    assert warehouses.json()["data"]["active_warehouses"] == 1
    assert charts.status_code == 200
    assert charts.json()["data"]["top_products"][0]["label"] == "Dashboard Phone"
    assert activities.status_code == 200
    assert activities.json()["data"]


@pytest.mark.anyio
async def test_seller_dashboard_search(api_client: AsyncClient) -> None:
    """Dashboard search returns seller-owned products, inventory, and warehouses."""
    fixture = await create_dashboard_fixture(api_client)
    product = fixture["product"]

    response = await api_client.get(
        "/api/v1/seller-dashboard/search",
        params={"seller_id": product["seller_id"], "q": "Dashboard", "page": 1, "page_size": 10},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    result_types = {item["type"] for item in payload["items"]}
    assert {"product", "warehouse"}.issubset(result_types)
    assert payload["meta"]["total_items"] >= 2


@pytest.mark.anyio
async def test_seller_dashboard_missing_seller_returns_not_found(api_client: AsyncClient) -> None:
    """Missing seller dashboard requests return 404."""
    response = await api_client.get("/api/v1/seller-dashboard/overview", params={"seller_id": str(uuid4())})

    assert response.status_code == 404


@pytest.mark.anyio
async def test_seller_dashboard_invalid_custom_range_returns_validation_error(api_client: AsyncClient) -> None:
    """Custom date range requires both start and end date."""
    fixture = await create_dashboard_fixture(api_client)
    product = fixture["product"]

    response = await api_client.get(
        "/api/v1/seller-dashboard/overview",
        params={"seller_id": product["seller_id"], "preset": "custom", "start_date": "2026-01-01"},
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_seller_dashboard_cross_seller_access_is_forbidden(
    api_client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """Seller-scoped service access rejects cross-seller dashboard reads."""
    first_seller = await create_active_seller(api_client)
    second_seller = await create_active_seller(api_client)
    service = SellerDashboardService(db_session)

    with pytest.raises(ApplicationError) as error:
        await service.search(
            seller_id=UUID(str(second_seller["id"])),
            query="anything",
            params=PaginationParams(page=1, page_size=10),
            current_user=CurrentUserPlaceholder(id=UUID(str(first_seller["id"])), role=UserRole.SELLER),
        )

    assert error.value.status_code == 403


@pytest.mark.anyio
async def test_seller_dashboard_admin_can_access_seller_dashboard(
    api_client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """Admin-scoped service access can read a seller dashboard."""
    seller = await create_active_seller(api_client)
    service = SellerDashboardService(db_session)

    overview = await service.overview(
        seller_id=UUID(str(seller["id"])),
        date_filter=DashboardDateFilter(),
        current_user=CurrentUserPlaceholder(role=UserRole.ADMIN),
    )

    assert str(overview.seller.seller_id) == seller["id"]
