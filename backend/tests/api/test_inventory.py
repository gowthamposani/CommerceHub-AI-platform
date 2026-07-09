"""Inventory API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

from tests.api.test_products import create_product


async def create_variant(api_client: AsyncClient, product_id: str, **overrides: object) -> dict[str, object]:
    """Create a product variant for inventory tests."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "sku": f"INV-VAR-{suffix}".upper(),
        "barcode": f"INVBAR{suffix}".upper(),
        "price": "1000.00",
        "status": "active",
        "is_active": True,
        "attributes": [],
    }
    payload.update(overrides)
    response = await api_client.post(f"/api/v1/products/{product_id}/variants", json=payload)
    assert response.status_code == 201
    return response.json()["data"]


async def create_inventory(api_client: AsyncClient, **overrides: object) -> dict[str, object]:
    """Create inventory with a valid product and variant."""
    product = await create_product(api_client)
    variant = await create_variant(api_client, product["id"])
    payload: dict[str, object] = {
        "product_id": product["id"],
        "variant_id": variant["id"],
        "available_quantity": 10,
        "reserved_quantity": 0,
        "damaged_quantity": 0,
        "minimum_stock": 1,
        "maximum_stock": 100,
        "reorder_level": 3,
        "transfer_ready": True,
    }
    payload.update(overrides)
    response = await api_client.post("/api/v1/inventory", json=payload)
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_inventory(api_client: AsyncClient) -> None:
    """Inventory can be created for a product variant."""
    inventory = await create_inventory(api_client)

    assert inventory["available_quantity"] == 10
    assert inventory["status"] == "in_stock"
    assert inventory["sku"].startswith("INV-VAR-")
    assert inventory["product_name"] is not None
    assert inventory["variant_signature"] is not None


@pytest.mark.anyio
async def test_duplicate_inventory_record_rejected(api_client: AsyncClient) -> None:
    """Only one inventory record can exist for a variant."""
    product = await create_product(api_client)
    variant = await create_variant(api_client, product["id"])
    payload = {
        "product_id": product["id"],
        "variant_id": variant["id"],
        "available_quantity": 5,
        "minimum_stock": 1,
        "reorder_level": 2,
    }
    first = await api_client.post("/api/v1/inventory", json=payload)
    assert first.status_code == 201

    duplicate = await api_client.post("/api/v1/inventory", json=payload)

    assert duplicate.status_code == 409


@pytest.mark.anyio
async def test_update_and_soft_delete_inventory(api_client: AsyncClient) -> None:
    """Inventory settings can be updated and inventory can be soft deleted."""
    inventory = await create_inventory(api_client)

    update_response = await api_client.put(
        f"/api/v1/inventory/{inventory['id']}",
        json={"minimum_stock": 2, "reorder_level": 4, "transfer_ready": False},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["reorder_level"] == 4

    delete_response = await api_client.delete(f"/api/v1/inventory/{inventory['id']}")
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["status"] == "deleted"

    get_response = await api_client.get(f"/api/v1/inventory/{inventory['id']}")
    assert get_response.status_code == 404


@pytest.mark.anyio
async def test_stock_in_stock_out_adjustment_and_history(api_client: AsyncClient) -> None:
    """Stock operations update balances and create transaction history."""
    inventory = await create_inventory(api_client)

    stock_in = await api_client.post(
        f"/api/v1/inventory/{inventory['id']}/stock-in",
        json={"quantity": 5, "reference_number": "SIN-1", "remarks": "Inbound"},
    )
    assert stock_in.status_code == 200
    assert stock_in.json()["data"]["available_quantity"] == 15

    stock_out = await api_client.post(
        f"/api/v1/inventory/{inventory['id']}/stock-out",
        json={"quantity": 4, "reference_number": "SOUT-1", "remarks": "Outbound"},
    )
    assert stock_out.status_code == 200
    assert stock_out.json()["data"]["available_quantity"] == 11

    adjustment = await api_client.post(
        f"/api/v1/inventory/{inventory['id']}/adjust",
        json={"available_quantity": 2, "damaged_quantity": 1, "reference_number": "ADJ-1"},
    )
    assert adjustment.status_code == 200
    assert adjustment.json()["data"]["status"] == "low_stock"

    history = await api_client.get(f"/api/v1/inventory/{inventory['id']}/history")
    assert history.status_code == 200
    transaction_types = {item["transaction_type"] for item in history.json()["data"]["items"]}
    assert {"stock_in", "stock_out", "adjustment"}.issubset(transaction_types)


@pytest.mark.anyio
async def test_stock_out_cannot_exceed_available(api_client: AsyncClient) -> None:
    """Stock out cannot exceed available quantity."""
    inventory = await create_inventory(api_client)

    response = await api_client.post(f"/api/v1/inventory/{inventory['id']}/stock-out", json={"quantity": 99})

    assert response.status_code == 400


@pytest.mark.anyio
async def test_reserve_and_release_stock(api_client: AsyncClient) -> None:
    """Stock can be reserved and released."""
    inventory = await create_inventory(api_client)

    reserve = await api_client.post(
        f"/api/v1/inventory/{inventory['id']}/reserve",
        json={"quantity": 3, "reference_number": "RES-1"},
    )
    assert reserve.status_code == 200
    assert reserve.json()["data"]["quantity"] == 3

    after_reserve = await api_client.get(f"/api/v1/inventory/{inventory['id']}")
    assert after_reserve.json()["data"]["available_quantity"] == 7
    assert after_reserve.json()["data"]["reserved_quantity"] == 3

    release = await api_client.post(
        f"/api/v1/inventory/{inventory['id']}/release",
        json={"quantity": 2, "reference_number": "REL-1"},
    )
    assert release.status_code == 200
    assert release.json()["data"]["available_quantity"] == 9
    assert release.json()["data"]["reserved_quantity"] == 1


@pytest.mark.anyio
async def test_low_stock_and_out_of_stock_detection(api_client: AsyncClient) -> None:
    """Inventory status reflects low and out-of-stock thresholds."""
    inventory = await create_inventory(api_client, available_quantity=2, reorder_level=3)
    assert inventory["status"] == "low_stock"

    response = await api_client.post(f"/api/v1/inventory/{inventory['id']}/stock-out", json={"quantity": 2})

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "out_of_stock"
    assert response.json()["data"]["transfer_ready"] is False


@pytest.mark.anyio
async def test_inventory_search_filter_sort_and_pagination(api_client: AsyncClient) -> None:
    """Inventory supports search, filters, sorting, and pagination."""
    product = await create_product(api_client)
    variant = await create_variant(api_client, product["id"])
    create_response = await api_client.post(
        "/api/v1/inventory",
        json={
            "product_id": product["id"],
            "variant_id": variant["id"],
            "available_quantity": 12,
            "minimum_stock": 1,
            "maximum_stock": 50,
            "reorder_level": 2,
        },
    )
    assert create_response.status_code == 201
    inventory = create_response.json()["data"]

    response = await api_client.get(
        "/api/v1/inventory",
        params={
            "search": inventory["sku"],
            "status": "in_stock",
            "seller_id": product["seller_id"],
            "category_id": product["category_id"],
            "brand_id": product["brand_id"],
            "sort_by": "available_quantity",
            "sort_direction": "desc",
        },
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["meta"]["total_items"] >= 1
    assert payload["items"][0]["sku"] == inventory["sku"]
