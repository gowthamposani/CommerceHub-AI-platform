"""Seller API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient


def seller_payload(**overrides: object) -> dict[str, object]:
    """Build a valid seller payload."""
    payload: dict[str, object] = {
        "user_id": str(uuid4()),
        "business_name": "Acme Retail",
        "legal_business_name": "Acme Retail Private Limited",
        "business_type": "private_limited",
        "business_email": f"seller-{uuid4()}@example.com",
        "business_phone": "+91 9876543210",
        "gst_number": "27ABCDE1234F1Z5",
        "pan_number": "ABCDE1234F",
        "tax_identification_number": "TIN12345",
        "website": "https://example.com",
        "logo_url": "https://example.com/logo.png",
        "description": "Enterprise seller profile",
        "address_line_1": "123 Market Street",
        "address_line_2": "Suite 5",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "400001",
        "account_holder_name": "Acme Retail",
        "bank_name": "Commerce Bank",
        "account_number": "123456789012",
        "ifsc_code": "ABCD0123456",
        "branch_name": "Mumbai Main",
        "default_currency": "INR",
        "notifications_enabled": True,
        "order_auto_accept_enabled": False,
    }
    payload.update(overrides)
    return payload


async def create_seller(api_client: AsyncClient, **overrides: object) -> dict[str, object]:
    """Create a seller and return response data."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload(**overrides))
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_seller(api_client: AsyncClient) -> None:
    """Seller can be created."""
    data = await create_seller(api_client)

    assert data["business_name"] == "Acme Retail"
    assert data["status"] == "pending"
    assert data["is_active"] is True


@pytest.mark.anyio
async def test_update_seller(api_client: AsyncClient) -> None:
    """Seller can be updated."""
    seller = await create_seller(api_client)

    response = await api_client.put(
        f"/api/v1/sellers/{seller['id']}",
        json={"business_name": "Acme Retail Updated"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["business_name"] == "Acme Retail Updated"


@pytest.mark.anyio
async def test_soft_delete_seller(api_client: AsyncClient) -> None:
    """Seller can be soft deleted."""
    seller = await create_seller(api_client)

    response = await api_client.delete(f"/api/v1/sellers/{seller['id']}")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "deleted"
    get_response = await api_client.get(f"/api/v1/sellers/{seller['id']}")
    assert get_response.status_code == 404


@pytest.mark.anyio
async def test_activate_and_deactivate_seller(api_client: AsyncClient) -> None:
    """Seller can be activated and deactivated."""
    seller = await create_seller(api_client)

    deactivate_response = await api_client.patch(f"/api/v1/sellers/{seller['id']}/deactivate")
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["data"]["status"] == "inactive"

    activate_response = await api_client.patch(f"/api/v1/sellers/{seller['id']}/activate")
    assert activate_response.status_code == 200
    assert activate_response.json()["data"]["status"] == "active"


@pytest.mark.anyio
async def test_validation_rejects_invalid_gst(api_client: AsyncClient) -> None:
    """Invalid GST is rejected."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload(gst_number="invalid"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_pan(api_client: AsyncClient) -> None:
    """Invalid PAN is rejected."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload(pan_number="invalid"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_email(api_client: AsyncClient) -> None:
    """Invalid email is rejected."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload(business_email="not-an-email"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_ifsc(api_client: AsyncClient) -> None:
    """Invalid IFSC is rejected."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload(ifsc_code="invalid"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_website(api_client: AsyncClient) -> None:
    """Invalid website URL is rejected."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload(website="invalid-url"))

    assert response.status_code == 422


@pytest.mark.anyio
async def test_duplicate_gst_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate GST is rejected."""
    await create_seller(api_client, gst_number="27ABCDE1234F1Z5", pan_number="ABCDE1234F")

    response = await api_client.post(
        "/api/v1/sellers",
        json=seller_payload(gst_number="27ABCDE1234F1Z5", pan_number="PQRST1234F"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_duplicate_pan_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate PAN is rejected."""
    await create_seller(api_client, pan_number="ABCDE1234F", gst_number="27ABCDE1234F1Z5")

    response = await api_client.post(
        "/api/v1/sellers",
        json=seller_payload(pan_number="ABCDE1234F", gst_number="29PQRST1234F1Z5"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_duplicate_email_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate business email is rejected."""
    email = "duplicate@example.com"
    await create_seller(api_client, business_email=email, gst_number="27ABCDE1234F1Z5", pan_number="ABCDE1234F")

    response = await api_client.post(
        "/api/v1/sellers",
        json=seller_payload(business_email=email, gst_number="29PQRST1234F1Z5", pan_number="PQRST1234F"),
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_search_filter_and_pagination(api_client: AsyncClient) -> None:
    """Seller list supports search, filtering, and pagination."""
    await create_seller(api_client, business_name="North Retail", gst_number="27ABCDE1234F1Z5", pan_number="ABCDE1234F")
    await create_seller(
        api_client,
        business_name="South Retail",
        business_email="south@example.com",
        gst_number="29PQRST1234F1Z5",
        pan_number="PQRST1234F",
        state="Karnataka",
    )

    response = await api_client.get(
        "/api/v1/sellers",
        params={"search": "South", "state": "Karnataka", "page": 1, "page_size": 10},
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["total_items"] == 1
    assert body["items"][0]["business_name"] == "South Retail"


@pytest.mark.anyio
async def test_sorting(api_client: AsyncClient) -> None:
    """Seller list supports sorting."""
    await create_seller(api_client, business_name="A Seller", gst_number="27ABCDE1234F1Z5", pan_number="ABCDE1234F")
    await create_seller(
        api_client,
        business_name="Z Seller",
        business_email="z@example.com",
        gst_number="29PQRST1234F1Z5",
        pan_number="PQRST1234F",
    )

    response = await api_client.get(
        "/api/v1/sellers",
        params={"sort_by": "business_name", "sort_direction": "desc", "page": 1, "page_size": 10},
    )

    assert response.status_code == 200
    assert response.json()["data"]["items"][0]["business_name"] == "Z Seller"


@pytest.mark.anyio
async def test_missing_seller_returns_404(api_client: AsyncClient) -> None:
    """Missing seller returns a safe 404 response."""
    response = await api_client.get(f"/api/v1/sellers/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["success"] is False


@pytest.mark.anyio
async def test_response_contract_includes_request_id(api_client: AsyncClient) -> None:
    """Seller API responses include the shared request ID contract."""
    request_id = "seller-contract-test"
    response = await api_client.post(
        "/api/v1/sellers",
        json=seller_payload(),
        headers={"X-Request-ID": request_id},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["requestId"] == request_id
    assert "timestamp" in body
