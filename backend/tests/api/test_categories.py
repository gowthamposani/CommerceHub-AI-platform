"""Category API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient


def category_payload(**overrides: object) -> dict[str, object]:
    """Build a valid category payload."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "category_name": f"Category {suffix}",
        "category_slug": f"category-{suffix}",
        "description": "Enterprise category for product classification",
        "image_url": "https://example.com/category.png",
        "display_order": 10,
    }
    payload.update(overrides)
    return payload


async def create_category(api_client: AsyncClient, **overrides: object) -> dict[str, object]:
    """Create a category and return response data."""
    response = await api_client.post("/api/v1/categories", json=category_payload(**overrides))
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_category(api_client: AsyncClient) -> None:
    """Category can be created."""
    data = await create_category(api_client, category_name="Electronics", category_slug="electronics")

    assert data["category_name"] == "Electronics"
    assert data["category_slug"] == "electronics"
    assert data["status"] == "active"
    assert data["is_active"] is True


@pytest.mark.anyio
async def test_create_category_generates_unique_slug(api_client: AsyncClient) -> None:
    """Category slug is generated from name when omitted."""
    data = await create_category(api_client, category_name="Home Appliances", category_slug=None)

    assert data["category_slug"] == "home-appliances"


@pytest.mark.anyio
async def test_create_category_generates_incremental_unique_slug(api_client: AsyncClient) -> None:
    """Generated category slug remains unique."""
    await create_category(api_client, category_name="Home Appliances", category_slug=None)
    data = await create_category(api_client, category_name="Home Appliances Plus", category_slug=None)

    assert data["category_slug"] == "home-appliances-plus"


@pytest.mark.anyio
async def test_update_category(api_client: AsyncClient) -> None:
    """Category can be updated."""
    category = await create_category(api_client)

    response = await api_client.put(
        f"/api/v1/categories/{category['id']}",
        json={"category_name": "Updated Category", "category_slug": "updated-category"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["category_name"] == "Updated Category"


@pytest.mark.anyio
async def test_soft_delete_category(api_client: AsyncClient) -> None:
    """Category can be soft deleted."""
    category = await create_category(api_client)

    response = await api_client.delete(f"/api/v1/categories/{category['id']}")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "deleted"
    get_response = await api_client.get(f"/api/v1/categories/{category['id']}")
    assert get_response.status_code == 404


@pytest.mark.anyio
async def test_activate_and_deactivate_category(api_client: AsyncClient) -> None:
    """Category can be activated and deactivated."""
    category = await create_category(api_client)

    deactivate_response = await api_client.patch(f"/api/v1/categories/{category['id']}/deactivate")
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["data"]["status"] == "inactive"

    activate_response = await api_client.patch(f"/api/v1/categories/{category['id']}/activate")
    assert activate_response.status_code == 200
    assert activate_response.json()["data"]["status"] == "active"


@pytest.mark.anyio
async def test_duplicate_category_name_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate category name is rejected."""
    await create_category(api_client, category_name="Books", category_slug="books")

    response = await api_client.post(
        "/api/v1/categories",
        json=category_payload(category_name="Books", category_slug="books-alt"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_duplicate_category_slug_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate category slug is rejected."""
    await create_category(api_client, category_name="Fashion", category_slug="fashion")

    response = await api_client.post(
        "/api/v1/categories",
        json=category_payload(category_name="Fashion Accessories", category_slug="fashion"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_invalid_parent_category_is_rejected(api_client: AsyncClient) -> None:
    """Invalid parent category assignment is rejected."""
    response = await api_client.post(
        "/api/v1/categories",
        json=category_payload(parent_category_id=str(uuid4())),
    )

    assert response.status_code == 404


@pytest.mark.anyio
async def test_self_parent_category_is_rejected(api_client: AsyncClient) -> None:
    """A category cannot be assigned as its own parent."""
    category = await create_category(api_client)

    response = await api_client.put(
        f"/api/v1/categories/{category['id']}",
        json={"parent_category_id": category["id"]},
    )

    assert response.status_code == 400


@pytest.mark.anyio
async def test_search_filter_sort_and_pagination(api_client: AsyncClient) -> None:
    """Category list supports search, filtering, sorting, and pagination."""
    parent = await create_category(
        api_client,
        category_name="Parent Category",
        category_slug="parent-category",
        display_order=20,
    )
    await create_category(
        api_client,
        category_name="Child Category",
        category_slug="child-category",
        parent_category_id=parent["id"],
        display_order=1,
    )

    response = await api_client.get(
        "/api/v1/categories",
        params={
            "search": "Child",
            "parent_category_id": parent["id"],
            "sort_by": "display_order",
            "sort_direction": "asc",
            "page": 1,
            "page_size": 10,
        },
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["total_items"] == 1
    assert body["items"][0]["category_name"] == "Child Category"


@pytest.mark.anyio
async def test_status_filter_and_pagination(api_client: AsyncClient) -> None:
    """Category list supports status filtering and pagination metadata."""
    first = await create_category(api_client, category_name="Alpha Category", category_slug="alpha-category")
    await create_category(api_client, category_name="Beta Category", category_slug="beta-category")
    await api_client.patch(f"/api/v1/categories/{first['id']}/deactivate")

    response = await api_client.get(
        "/api/v1/categories",
        params={"status": "inactive", "page": 1, "page_size": 1, "sort_by": "category_name"},
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["page_size"] == 1
    assert body["meta"]["total_items"] == 1
    assert body["items"][0]["status"] == "inactive"


@pytest.mark.anyio
async def test_category_tree_retrieval(api_client: AsyncClient) -> None:
    """Category tree returns parent-child hierarchy."""
    parent = await create_category(api_client, category_name="Root Category", category_slug="root-category")
    child = await create_category(
        api_client,
        category_name="Leaf Category",
        category_slug="leaf-category",
        parent_category_id=parent["id"],
    )

    response = await api_client.get("/api/v1/categories/tree")

    assert response.status_code == 200
    tree = response.json()["data"]
    root = next(item for item in tree if item["id"] == parent["id"])
    assert root["children"][0]["id"] == child["id"]


@pytest.mark.anyio
async def test_circular_category_hierarchy_is_rejected(api_client: AsyncClient) -> None:
    """Circular category parent assignment is rejected."""
    parent = await create_category(api_client, category_name="Circular Parent", category_slug="circular-parent")
    child = await create_category(
        api_client,
        category_name="Circular Child",
        category_slug="circular-child",
        parent_category_id=parent["id"],
    )

    response = await api_client.put(
        f"/api/v1/categories/{parent['id']}",
        json={"parent_category_id": child["id"]},
    )

    assert response.status_code == 400


@pytest.mark.anyio
async def test_delete_category_with_child_is_rejected(api_client: AsyncClient) -> None:
    """Category with active child categories cannot be soft deleted."""
    parent = await create_category(api_client, category_name="Protected Parent", category_slug="protected-parent")
    await create_category(
        api_client,
        category_name="Protected Child",
        category_slug="protected-child",
        parent_category_id=parent["id"],
    )

    response = await api_client.delete(f"/api/v1/categories/{parent['id']}")

    assert response.status_code == 400


@pytest.mark.anyio
async def test_validation_rejects_invalid_slug(api_client: AsyncClient) -> None:
    """Invalid category slug is rejected."""
    response = await api_client.post(
        "/api/v1/categories",
        json=category_payload(category_slug="Invalid Slug"),
    )

    assert response.status_code == 422


@pytest.mark.anyio
async def test_response_contract_includes_request_id(api_client: AsyncClient) -> None:
    """Category API responses include the shared request ID contract."""
    request_id = "category-contract-test"
    response = await api_client.post(
        "/api/v1/categories",
        json=category_payload(category_name="Contract Category", category_slug="contract-category"),
        headers={"X-Request-ID": request_id},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["requestId"] == request_id
    assert "timestamp" in body
