"""Product API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient


def seller_payload(**overrides: object) -> dict[str, object]:
    """Build a valid seller payload for product tests."""
    suffix = uuid4().hex[:8]
    tax_serial = str(int(suffix[:6], 16) % 9000 + 1000)
    payload: dict[str, object] = {
        "user_id": str(uuid4()),
        "business_name": f"Product Seller {suffix}",
        "legal_business_name": f"Product Seller {suffix} Private Limited",
        "business_type": "private_limited",
        "business_email": f"product-seller-{suffix}@example.com",
        "business_phone": "+91 9876543210",
        "gst_number": f"27ABCDE{tax_serial}F1Z5",
        "pan_number": f"ABCDE{tax_serial}F",
        "website": "https://example.com",
        "address_line_1": "123 Market Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "400001",
        "account_holder_name": f"Product Seller {suffix}",
        "bank_name": "Commerce Bank",
        "account_number": "123456789012",
        "ifsc_code": "ABCD0123456",
    }
    payload.update(overrides)
    return payload


def category_payload(**overrides: object) -> dict[str, object]:
    """Build a valid category payload for product tests."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "category_name": f"Product Category {suffix}",
        "category_slug": f"product-category-{suffix}",
        "description": "Category for product tests",
        "display_order": 1,
    }
    payload.update(overrides)
    return payload


def brand_payload(**overrides: object) -> dict[str, object]:
    """Build a valid brand payload for product tests."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "brand_name": f"Product Brand {suffix}",
        "brand_slug": f"product-brand-{suffix}",
        "description": "Brand for product tests",
        "website": "https://example.com",
        "country_of_origin": "India",
        "founded_year": 2020,
    }
    payload.update(overrides)
    return payload


def product_payload(seller_id: str, category_id: str, brand_id: str, **overrides: object) -> dict[str, object]:
    """Build a valid product payload."""
    suffix = uuid4().hex[:8]
    payload: dict[str, object] = {
        "seller_id": seller_id,
        "category_id": category_id,
        "brand_id": brand_id,
        "product_name": f"Product {suffix}",
        "product_slug": f"product-{suffix}",
        "short_description": "Enterprise product listing",
        "long_description": "Detailed enterprise product description",
        "sku": f"SKU-{suffix}".upper(),
        "barcode": f"BAR-{suffix}".upper(),
        "price": "1999.00",
        "discount_price": "1499.00",
        "cost_price": "999.00",
        "currency": "INR",
        "tax_percentage": "18.00",
        "weight": "1.250",
        "length": "10.000",
        "width": "8.000",
        "height": "4.000",
        "visibility": "private",
        "is_featured": False,
    }
    payload.update(overrides)
    return payload


async def create_active_seller(api_client: AsyncClient) -> dict[str, object]:
    """Create and activate a seller."""
    response = await api_client.post("/api/v1/sellers", json=seller_payload())
    assert response.status_code == 201
    seller = response.json()["data"]
    activate_response = await api_client.patch(f"/api/v1/sellers/{seller['id']}/activate")
    assert activate_response.status_code == 200
    return activate_response.json()["data"]


async def create_category(api_client: AsyncClient) -> dict[str, object]:
    """Create a category."""
    response = await api_client.post("/api/v1/categories", json=category_payload())
    assert response.status_code == 201
    return response.json()["data"]


async def create_brand(api_client: AsyncClient) -> dict[str, object]:
    """Create a brand."""
    response = await api_client.post("/api/v1/brands", json=brand_payload())
    assert response.status_code == 201
    return response.json()["data"]


async def create_product(api_client: AsyncClient, **overrides: object) -> dict[str, object]:
    """Create a product with active relationships."""
    seller = await create_active_seller(api_client)
    category = await create_category(api_client)
    brand = await create_brand(api_client)
    response = await api_client.post(
        "/api/v1/products",
        json=product_payload(str(seller["id"]), str(category["id"]), str(brand["id"]), **overrides),
    )
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_product(api_client: AsyncClient) -> None:
    """Product can be created for an active seller."""
    product = await create_product(api_client, product_name="Wireless Headphones", product_slug="wireless-headphones")

    assert product["product_name"] == "Wireless Headphones"
    assert product["product_slug"] == "wireless-headphones"
    assert product["status"] == "draft"
    assert product["seller_name"] is not None
    assert product["category_name"] is not None
    assert product["brand_name"] is not None


@pytest.mark.anyio
async def test_create_product_generates_slug(api_client: AsyncClient) -> None:
    """Product slug is generated when omitted."""
    product = await create_product(api_client, product_name="Generated Product", product_slug=None)

    assert product["product_slug"] == "generated-product"


@pytest.mark.anyio
async def test_inactive_seller_cannot_create_product(api_client: AsyncClient) -> None:
    """Inactive or pending sellers cannot create products."""
    seller_response = await api_client.post("/api/v1/sellers", json=seller_payload())
    assert seller_response.status_code == 201
    seller = seller_response.json()["data"]
    category = await create_category(api_client)
    brand = await create_brand(api_client)

    response = await api_client.post(
        "/api/v1/products",
        json=product_payload(str(seller["id"]), str(category["id"]), str(brand["id"])),
    )

    assert response.status_code == 400


@pytest.mark.anyio
async def test_update_product(api_client: AsyncClient) -> None:
    """Product can be updated."""
    product = await create_product(api_client)

    response = await api_client.put(
        f"/api/v1/products/{product['id']}",
        json={"product_name": "Updated Product", "price": "2499.00"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["product_name"] == "Updated Product"


@pytest.mark.anyio
async def test_soft_delete_product(api_client: AsyncClient) -> None:
    """Product can be soft deleted."""
    product = await create_product(api_client)

    response = await api_client.delete(f"/api/v1/products/{product['id']}")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "deleted"
    get_response = await api_client.get(f"/api/v1/products/{product['id']}")
    assert get_response.status_code == 404


@pytest.mark.anyio
async def test_publish_unpublish_and_archive_product(api_client: AsyncClient) -> None:
    """Product lifecycle transitions work."""
    product = await create_product(api_client)

    publish_response = await api_client.patch(
        f"/api/v1/products/{product['id']}/publish",
        json={"visibility": "public"},
    )
    assert publish_response.status_code == 200
    assert publish_response.json()["data"]["status"] == "published"
    assert publish_response.json()["data"]["published_at"] is not None

    unpublish_response = await api_client.patch(f"/api/v1/products/{product['id']}/unpublish")
    assert unpublish_response.status_code == 200
    assert unpublish_response.json()["data"]["status"] == "unpublished"

    archive_response = await api_client.patch(f"/api/v1/products/{product['id']}/archive")
    assert archive_response.status_code == 200
    assert archive_response.json()["data"]["status"] == "archived"

    republish_response = await api_client.patch(
        f"/api/v1/products/{product['id']}/publish",
        json={"visibility": "public"},
    )
    assert republish_response.status_code == 400


@pytest.mark.anyio
async def test_duplicate_product(api_client: AsyncClient) -> None:
    """Product can be duplicated as a new draft."""
    product = await create_product(api_client)

    response = await api_client.post(f"/api/v1/products/{product['id']}/duplicate")

    assert response.status_code == 201
    duplicate = response.json()["data"]
    assert duplicate["id"] != product["id"]
    assert duplicate["status"] == "draft"
    assert duplicate["sku"] != product["sku"]
    assert duplicate["product_slug"] != product["product_slug"]


@pytest.mark.anyio
async def test_preview_product(api_client: AsyncClient) -> None:
    """Product preview returns product details."""
    product = await create_product(api_client)

    response = await api_client.get(f"/api/v1/products/{product['id']}/preview")

    assert response.status_code == 200
    assert response.json()["data"]["id"] == product["id"]


@pytest.mark.anyio
async def test_search_filter_sort_and_pagination(api_client: AsyncClient) -> None:
    """Product list supports search, filters, sorting, and pagination."""
    first = await create_product(
        api_client,
        product_name="Alpha Phone",
        product_slug="alpha-phone",
        price="1000.00",
        discount_price="900.00",
    )
    await create_product(api_client, product_name="Beta Phone", product_slug="beta-phone", price="2000.00")

    response = await api_client.get(
        "/api/v1/products",
        params={
            "search": "Alpha",
            "seller_id": first["seller_id"],
            "category_id": first["category_id"],
            "brand_id": first["brand_id"],
            "min_price": "900",
            "max_price": "1100",
            "sort_by": "price",
            "sort_direction": "asc",
            "page": 1,
            "page_size": 10,
        },
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["total_items"] == 1
    assert body["items"][0]["product_name"] == "Alpha Phone"


@pytest.mark.anyio
async def test_status_featured_and_published_filters(api_client: AsyncClient) -> None:
    """Product filters support status, featured, and published flags."""
    product = await create_product(api_client, is_featured=True)
    await api_client.patch(f"/api/v1/products/{product['id']}/publish", json={"visibility": "public"})

    response = await api_client.get(
        "/api/v1/products",
        params={"status": "published", "is_featured": True, "is_published": True},
    )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["meta"]["total_items"] >= 1
    assert any(item["id"] == product["id"] for item in body["items"])


@pytest.mark.anyio
async def test_duplicate_sku_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate SKU is rejected."""
    product = await create_product(api_client, sku="DUP-SKU")

    response = await create_product_request(api_client, sku=product["sku"], barcode="OTHER-BAR")

    assert response.status_code == 409


@pytest.mark.anyio
async def test_duplicate_barcode_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate barcode is rejected."""
    product = await create_product(api_client, sku="UNIQUE-SKU", barcode="DUP-BAR")

    response = await create_product_request(api_client, sku="OTHER-SKU", barcode=product["barcode"])

    assert response.status_code == 409


@pytest.mark.anyio
async def test_validation_rejects_invalid_prices(api_client: AsyncClient) -> None:
    """Invalid prices are rejected."""
    response = await create_product_request(api_client, price="-1.00")

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_discount(api_client: AsyncClient) -> None:
    """Discount cannot exceed price."""
    response = await create_product_request(api_client, price="100.00", discount_price="101.00")

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_currency(api_client: AsyncClient) -> None:
    """Invalid currency is rejected."""
    response = await create_product_request(api_client, currency="rupee")

    assert response.status_code == 422


@pytest.mark.anyio
async def test_validation_rejects_invalid_dimensions(api_client: AsyncClient) -> None:
    """Invalid dimensions are rejected."""
    response = await create_product_request(api_client, weight="-1.000")

    assert response.status_code == 422


async def create_product_request(api_client: AsyncClient, **overrides: object):
    """Create a product request without asserting status."""
    seller = await create_active_seller(api_client)
    category = await create_category(api_client)
    brand = await create_brand(api_client)
    return await api_client.post(
        "/api/v1/products",
        json=product_payload(str(seller["id"]), str(category["id"]), str(brand["id"]), **overrides),
    )
