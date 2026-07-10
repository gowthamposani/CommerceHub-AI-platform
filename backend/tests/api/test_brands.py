"""Brand API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient


def brand_payload(**overrides: object) -> dict[str, object]:
    """Build a valid brand payload."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "brand_name": f"Brand {suffix}",
        "brand_slug": f"brand-{suffix}",
        "description": "Enterprise brand for product association",
        "logo_url": "https://example.com/brand.png",
        "website": "https://example.com",
        "country_of_origin": "India",
        "founded_year": 2020,
    }
    payload.update(overrides)
    return payload


async def create_brand(api_client: AsyncClient, **overrides: object) -> dict[str, object]:
    """Create a brand and return response data."""
    response = await api_client.post("/api/v1/brands", json=brand_payload(**overrides))
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_brand(api_client: AsyncClient) -> None:
    """Brand can be created."""
    data = await create_brand(api_client, brand_name="Acme Brand", brand_slug="acme-brand")

    assert data["brand_name"] == "Acme Brand"
    assert data["brand_slug"] == "acme-brand"
    assert data["status"] == "active"
    assert data["is_active"] is True


@pytest.mark.anyio
async def test_create_brand_generates_slug(api_client: AsyncClient) -> None:
    """Brand slug is generated from name when omitted."""
    data = await create_brand(api_client, brand_name="Generated Brand", brand_slug=None)

    assert data["brand_slug"] == "generated-brand"


@pytest.mark.anyio
async def test_update_brand(api_client: AsyncClient) -> None:
    """Brand can be updated."""
    brand = await create_brand(api_client)

    response = await api_client.put(
        f"/api/v1/brands/{brand['id']}",
        json={"brand_name": "Updated Brand", "brand_slug": "updated-brand"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["brand_name"] == "Updated Brand"


@pytest.mark.anyio
async def test_soft_delete_brand(api_client: AsyncClient) -> None:
    """Brand can be soft deleted."""
    brand = await create_brand(api_client)

    response = await api_client.delete(f"/api/v1/brands/{brand['id']}")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "deleted"
    get_response = await api_client.get(f"/api/v1/brands/{brand['id']}")
    assert get_response.status_code == 404


@pytest.mark.anyio
async def test_activate_and_deactivate_brand(api_client: AsyncClient) -> None:
    """Brand can be activated and deactivated."""
    brand = await create_brand(api_client)

    deactivate_response = await api_client.patch(f"/api/v1/brands/{brand['id']}/deactivate")
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["data"]["status"] == "inactive"

    activate_response = await api_client.patch(f"/api/v1/brands/{brand['id']}/activate")
    assert activate_response.status_code == 200
    assert activate_response.json()["data"]["status"] == "active"


@pytest.mark.anyio
async def test_duplicate_brand_name_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate brand name is rejected."""
    await create_brand(api_client, brand_name="Duplicate Brand", brand_slug="duplicate-brand")

    response = await api_client.post(
        "/api/v1/brands",
        json=brand_payload(brand_name="Duplicate Brand", brand_slug="duplicate-brand-alt"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_duplicate_brand_slug_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate brand slug is rejected."""
    await create_brand(api_client, brand_name="Slug Brand", brand_slug="slug-brand")

    response = await api_client.post(
        "/api/v1/brands",
        json=brand_payload(brand_name="Slug Brand Alt", brand_slug="slug-brand"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_search_filter_sort_and_pagination(api_client: AsyncClient) -> None:
    """Brand list supports search, filtering, sorting, and pagination."""
    await create_brand(api_client, brand_name="North Brand", brand_slug="north-brand", country_of_origin="India")
    await create_brand(api_client, brand_name="South Brand", brand_slug="south-brand", country_of_origin="Japan")

    response = await api_client.get(
        "/api/v1/brands",
        params={
            "search": "South",
            "country_of_origin": "Japan",
            "sort_by": "brand_name",
            "sort_direction": "asc",
            "page": 1,
            "page_size": 10,
        },
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["total_items"] == 1
    assert body["items"][0]["brand_name"] == "South Brand"


@pytest.mark.anyio
async def test_status_filter_and_pagination(api_client: AsyncClient) -> None:
    """Brand list supports status filtering and pagination metadata."""
    first = await create_brand(api_client, brand_name="Alpha Brand", brand_slug="alpha-brand")
    await create_brand(api_client, brand_name="Beta Brand", brand_slug="beta-brand")
    await api_client.patch(f"/api/v1/brands/{first['id']}/deactivate")

    response = await api_client.get(
        "/api/v1/brands",
        params={"status": "inactive", "page": 1, "page_size": 1, "sort_by": "brand_name"},
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["page_size"] == 1
    assert body["meta"]["total_items"] == 1
    assert body["items"][0]["status"] == "inactive"


@pytest.mark.anyio
async def test_country_sorting(api_client: AsyncClient) -> None:
    """Brand list supports country sorting for frontend table controls."""
    await create_brand(api_client, brand_name="Japan Brand", brand_slug="japan-brand", country_of_origin="Japan")
    await create_brand(api_client, brand_name="India Brand", brand_slug="india-brand", country_of_origin="India")

    response = await api_client.get(
        "/api/v1/brands",
        params={
            "sort_by": "country_of_origin",
            "sort_direction": "asc",
            "page": 1,
            "page_size": 10,
        },
    )

    assert response.status_code == 200
    items = response.json()["data"]["items"]
    assert [item["country_of_origin"] for item in items[:2]] == ["India", "Japan"]


@pytest.mark.anyio
async def test_validation_rejects_invalid_slug(api_client: AsyncClient) -> None:
    """Invalid brand slug is rejected."""
    response = await api_client.post("/api/v1/brands", json=brand_payload(brand_slug="Invalid Slug"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_website(api_client: AsyncClient) -> None:
    """Invalid website URL is rejected."""
    response = await api_client.post("/api/v1/brands", json=brand_payload(website="invalid-url"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_founded_year(api_client: AsyncClient) -> None:
    """Invalid founded year is rejected."""
    response = await api_client.post("/api/v1/brands", json=brand_payload(founded_year=1700))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_country(api_client: AsyncClient) -> None:
    """Invalid country text is rejected to prevent unsafe input."""
    response = await api_client.post("/api/v1/brands", json=brand_payload(country_of_origin="<script>alert(1)</script>"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_missing_brand_returns_404(api_client: AsyncClient) -> None:
    """Missing brand returns a safe 404 response."""
    response = await api_client.get(f"/api/v1/brands/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["success"] is False


@pytest.mark.anyio
async def test_response_contract_includes_request_id(api_client: AsyncClient) -> None:
    """Brand API responses include the shared request ID contract."""
    request_id = "brand-contract-test"
    response = await api_client.post(
        "/api/v1/brands",
        json=brand_payload(brand_name="Contract Brand", brand_slug="contract-brand"),
        headers={"X-Request-ID": request_id},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["requestId"] == request_id
    assert "timestamp" in body
