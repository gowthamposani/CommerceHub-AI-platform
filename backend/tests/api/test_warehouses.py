"""Warehouse API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

from tests.api.test_inventory import create_variant
from tests.api.test_products import create_active_seller, create_product


def warehouse_payload(seller_id: str, **overrides: object) -> dict[str, object]:
    """Build valid warehouse payload."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "seller_id": seller_id,
        "warehouse_code": f"WH-{suffix}".upper(),
        "warehouse_name": f"Primary Warehouse {suffix}",
        "contact_person": "Warehouse Manager",
        "phone_number": "+91 9876543210",
        "email": f"warehouse-{suffix}@example.com",
        "address_line_1": "123 Logistics Park",
        "address_line_2": "Dock 4",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "400001",
        "latitude": "19.076000",
        "longitude": "72.877700",
        "warehouse_type": "fulfillment",
        "status": "active",
        "is_default": False,
    }
    payload.update(overrides)
    return payload


async def create_warehouse(
    api_client: AsyncClient,
    seller_id: str | None = None,
    **overrides: object,
) -> dict[str, object]:
    """Create a warehouse for tests."""
    seller = await create_active_seller(api_client) if seller_id is None else {"id": seller_id}
    response = await api_client.post(
        "/api/v1/warehouses",
        json=warehouse_payload(str(seller["id"]), **overrides),
    )
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_get_update_and_delete_warehouse(api_client: AsyncClient) -> None:
    """Warehouse CRUD works."""
    warehouse = await create_warehouse(api_client, warehouse_name="North Fulfillment Center")

    get_response = await api_client.get(f"/api/v1/warehouses/{warehouse['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["data"]["warehouse_name"] == "North Fulfillment Center"

    update_response = await api_client.put(
        f"/api/v1/warehouses/{warehouse['id']}",
        json={"warehouse_name": "Updated Fulfillment Center", "city": "Pune"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["city"] == "Pune"

    delete_response = await api_client.delete(f"/api/v1/warehouses/{warehouse['id']}")
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["status"] == "deleted"

    missing_response = await api_client.get(f"/api/v1/warehouses/{warehouse['id']}")
    assert missing_response.status_code == 404


@pytest.mark.anyio
async def test_duplicate_warehouse_code_rejected(api_client: AsyncClient) -> None:
    """Warehouse code must be unique."""
    seller = await create_active_seller(api_client)
    code = f"WH-{uuid4().hex[:8]}".upper()
    await create_warehouse(api_client, str(seller["id"]), warehouse_code=code)

    duplicate_response = await api_client.post(
        "/api/v1/warehouses",
        json=warehouse_payload(str(seller["id"]), warehouse_code=code),
    )

    assert duplicate_response.status_code == 409


@pytest.mark.anyio
async def test_only_one_default_warehouse_per_seller(api_client: AsyncClient) -> None:
    """Setting default warehouse clears previous default for same seller."""
    seller = await create_active_seller(api_client)
    first = await create_warehouse(api_client, str(seller["id"]), is_default=True)
    second = await create_warehouse(api_client, str(seller["id"]))

    default_response = await api_client.patch(f"/api/v1/warehouses/{second['id']}/default")
    assert default_response.status_code == 200
    assert default_response.json()["data"]["is_default"] is True

    first_response = await api_client.get(f"/api/v1/warehouses/{first['id']}")
    assert first_response.status_code == 200
    assert first_response.json()["data"]["is_default"] is False


@pytest.mark.anyio
async def test_list_search_filter_status_and_statistics(api_client: AsyncClient) -> None:
    """Warehouse list supports search/filter and statistics endpoint works."""
    seller = await create_active_seller(api_client)
    warehouse = await create_warehouse(api_client, str(seller["id"]), warehouse_name="Searchable Warehouse")

    list_response = await api_client.get(
        "/api/v1/warehouses",
        params={"seller_id": seller["id"], "search": "Searchable", "status": "active", "sort_by": "warehouse_name"},
    )
    assert list_response.status_code == 200
    assert list_response.json()["data"]["items"][0]["id"] == warehouse["id"]

    stats_response = await api_client.get("/api/v1/warehouses/statistics", params={"seller_id": seller["id"]})
    assert stats_response.status_code == 200
    assert stats_response.json()["data"]["total_warehouses"] >= 1


@pytest.mark.anyio
async def test_capacity_summary_and_delete_blocked_by_inventory(api_client: AsyncClient) -> None:
    """Warehouse capacity/summary work and deletion is blocked by non-transferred inventory."""
    product = await create_product(api_client)
    warehouse = await create_warehouse(api_client, str(product["seller_id"]))
    variant = await create_variant(api_client, product["id"])
    inventory_response = await api_client.post(
        "/api/v1/inventory",
        json={
            "product_id": product["id"],
            "variant_id": variant["id"],
            "warehouse_id": warehouse["id"],
            "available_quantity": 10,
            "reserved_quantity": 2,
            "damaged_quantity": 1,
            "minimum_stock": 1,
            "maximum_stock": 100,
            "reorder_level": 3,
            "transfer_ready": False,
        },
    )
    assert inventory_response.status_code == 201

    capacity_response = await api_client.get(f"/api/v1/warehouses/{warehouse['id']}/capacity")
    assert capacity_response.status_code == 200
    assert capacity_response.json()["data"]["utilized_units"] == 13

    summary_response = await api_client.get(f"/api/v1/warehouses/{warehouse['id']}/inventory-summary")
    assert summary_response.status_code == 200
    assert summary_response.json()["data"]["inventory_records"] == 1

    delete_response = await api_client.delete(f"/api/v1/warehouses/{warehouse['id']}")
    assert delete_response.status_code == 409


@pytest.mark.anyio
async def test_transfer_inventory_between_warehouses(api_client: AsyncClient) -> None:
    """Warehouse transfer moves stock and records activity."""
    product = await create_product(api_client)
    source = await create_warehouse(api_client, str(product["seller_id"]), warehouse_name="Source Warehouse")
    destination = await create_warehouse(
        api_client,
        str(product["seller_id"]),
        warehouse_name="Destination Warehouse",
    )
    variant = await create_variant(api_client, product["id"])
    inventory_response = await api_client.post(
        "/api/v1/inventory",
        json={
            "product_id": product["id"],
            "variant_id": variant["id"],
            "warehouse_id": source["id"],
            "available_quantity": 20,
            "minimum_stock": 1,
            "maximum_stock": 100,
            "reorder_level": 2,
            "transfer_ready": True,
        },
    )
    assert inventory_response.status_code == 201
    source_inventory = inventory_response.json()["data"]

    transfer_response = await api_client.post(
        "/api/v1/warehouses/transfers",
        json={
            "source_warehouse_id": source["id"],
            "destination_warehouse_id": destination["id"],
            "inventory_id": source_inventory["id"],
            "quantity": 7,
            "reference_number": "TRF-001",
            "remarks": "Transfer for regression test",
        },
    )
    assert transfer_response.status_code == 201
    transfer = transfer_response.json()["data"]
    assert transfer["source_available_quantity"] == 13
    assert transfer["destination_available_quantity"] == 7
    assert transfer["destination_inventory_id"] != source_inventory["id"]

    source_response = await api_client.get(f"/api/v1/inventory/{source_inventory['id']}")
    assert source_response.json()["data"]["available_quantity"] == 13

    destination_inventory_response = await api_client.get(
        "/api/v1/inventory",
        params={"warehouse_id": destination["id"], "search": source_inventory["sku"]},
    )
    assert destination_inventory_response.status_code == 200
    destination_items = destination_inventory_response.json()["data"]["items"]
    assert len(destination_items) == 1
    assert destination_items[0]["available_quantity"] == 7

    activity_response = await api_client.get(f"/api/v1/warehouses/{destination['id']}/activity")
    assert activity_response.status_code == 200
    assert any(item["label"] == "Inventory Added" for item in activity_response.json()["data"]["items"])

    excessive_response = await api_client.post(
        "/api/v1/warehouses/transfers",
        json={
            "source_warehouse_id": source["id"],
            "destination_warehouse_id": destination["id"],
            "inventory_id": source_inventory["id"],
            "quantity": 99,
        },
    )
    assert excessive_response.status_code == 400
