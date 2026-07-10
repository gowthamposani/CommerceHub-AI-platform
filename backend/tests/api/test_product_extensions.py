"""Product variant and metadata API tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

from tests.api.test_products import create_product


async def create_attribute(api_client: AsyncClient, product_id: str, name: str = "Color") -> dict[str, object]:
    """Create a product attribute for variant tests."""
    response = await api_client.post(
        f"/api/v1/products/{product_id}/attributes",
        json={"attribute_name": name, "values": ["Red", "Blue"], "display_order": 0, "is_variant_defining": True},
    )
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_create_variant_with_attribute_combination(api_client: AsyncClient) -> None:
    """Variant can be created with SKU, barcode, and attribute selections."""
    product = await create_product(api_client)
    attribute = await create_attribute(api_client, product["id"])

    response = await api_client.post(
        f"/api/v1/products/{product['id']}/variants",
        json={
            "sku": f"VAR-{uuid4().hex[:8]}".upper(),
            "barcode": f"VBAR-{uuid4().hex[:8]}".upper(),
            "price": "2199.00",
            "discount_price": "1999.00",
            "status": "active",
            "is_active": True,
            "attributes": [{"attribute_id": attribute["id"], "value": "Red"}],
        },
    )

    assert response.status_code == 201
    variant = response.json()["data"]
    assert variant["status"] == "active"
    assert "color=red" in variant["variant_signature"]


@pytest.mark.anyio
async def test_duplicate_variant_combination_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate variant combinations are rejected for the same product."""
    product = await create_product(api_client)
    attribute = await create_attribute(api_client, product["id"])
    payload = {
        "sku": f"VAR-{uuid4().hex[:8]}".upper(),
        "barcode": f"VBAR-{uuid4().hex[:8]}".upper(),
        "price": "2199.00",
        "status": "active",
        "is_active": True,
        "attributes": [{"attribute_id": attribute["id"], "value": "Red"}],
    }
    first = await api_client.post(f"/api/v1/products/{product['id']}/variants", json=payload)
    assert first.status_code == 201

    payload["sku"] = f"VAR-{uuid4().hex[:8]}".upper()
    payload["barcode"] = f"VBAR-{uuid4().hex[:8]}".upper()
    duplicate = await api_client.post(f"/api/v1/products/{product['id']}/variants", json=payload)

    assert duplicate.status_code == 409


@pytest.mark.anyio
async def test_variant_sku_and_barcode_are_unique(api_client: AsyncClient) -> None:
    """Variant SKU and barcode cannot duplicate core product fields."""
    product = await create_product(api_client)

    sku_response = await api_client.post(
        f"/api/v1/products/{product['id']}/variants",
        json={"sku": product["sku"], "price": "1000.00", "status": "draft", "is_active": True, "attributes": []},
    )
    assert sku_response.status_code == 409

    barcode_response = await api_client.post(
        f"/api/v1/products/{product['id']}/variants",
        json={
            "sku": f"VAR-{uuid4().hex[:8]}".upper(),
            "barcode": product["barcode"],
            "price": "1000.00",
            "status": "draft",
            "is_active": True,
            "attributes": [],
        },
    )
    assert barcode_response.status_code == 409


@pytest.mark.anyio
async def test_tags_specifications_seo_and_preview(api_client: AsyncClient) -> None:
    """Tags, specifications, SEO metadata, and extension preview persist."""
    product = await create_product(api_client)

    tag_response = await api_client.post(f"/api/v1/products/{product['id']}/tags", json={"tag_name": "Premium"})
    assert tag_response.status_code == 201

    specification_response = await api_client.post(
        f"/api/v1/products/{product['id']}/specifications",
        json={
            "group_name": "Display",
            "specification_name": "Screen Size",
            "specification_value": "6.7 inch",
            "display_order": 1,
        },
    )
    assert specification_response.status_code == 201

    seo_response = await api_client.put(
        f"/api/v1/products/{product['id']}/seo",
        json={
            "seo_title": "Premium Product",
            "seo_description": "Premium product SEO description",
            "seo_keywords": "premium,product",
            "meta_robots": "index,follow",
            "canonical_url": "https://example.com/products/premium-product",
            "friendly_url": "premium-product",
            "open_graph_title": "Premium Product",
            "open_graph_description": "Premium product social description",
        },
    )
    assert seo_response.status_code == 200

    preview_response = await api_client.get(f"/api/v1/products/{product['id']}/extension-preview")
    assert preview_response.status_code == 200
    preview = preview_response.json()["data"]
    assert preview["tags"][0]["tag_name"] == "Premium"
    assert preview["specifications"][0]["specification_name"] == "Screen Size"
    assert preview["seo"]["friendly_url"] == "premium-product"


@pytest.mark.anyio
async def test_variant_search_pagination_filtering_sorting(api_client: AsyncClient) -> None:
    """Variant list supports search, filtering, sorting, and pagination."""
    product = await create_product(api_client)
    response = await api_client.post(
        f"/api/v1/products/{product['id']}/variants",
        json={
            "sku": "VAR-SEARCH-001",
            "barcode": "VARSEARCH001",
            "price": "1000.00",
            "status": "active",
            "is_active": True,
            "attributes": [],
        },
    )
    assert response.status_code == 201

    list_response = await api_client.get(
        f"/api/v1/products/{product['id']}/variants",
        params={"search": "SEARCH", "status": "active", "sort_by": "sku", "sort_direction": "asc"},
    )

    assert list_response.status_code == 200
    payload = list_response.json()["data"]
    assert payload["meta"]["total_items"] == 1
    assert payload["items"][0]["sku"] == "VAR-SEARCH-001"
