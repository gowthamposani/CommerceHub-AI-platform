"""Product image API tests."""

import pytest
from httpx import AsyncClient

from tests.api.test_products import create_product

PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\xf8\x0f"
    b"\x00\x01\x01\x01\x00\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82"
)
WEBP_BYTES = b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00\x10\x00\x00\x9d\x01*\x01\x00\x01\x00"


async def upload_image(
    api_client: AsyncClient,
    product_id: str,
    content: bytes = PNG_BYTES,
    filename: str = "image.png",
    content_type: str = "image/png",
) -> dict[str, object]:
    """Upload an image and return response data."""
    response = await api_client.post(
        f"/api/v1/products/{product_id}/images",
        files={"file": (filename, content, content_type)},
        data={"alt_text": "Product image"},
    )
    assert response.status_code == 201
    return response.json()["data"]


@pytest.mark.anyio
async def test_upload_and_list_product_images(api_client: AsyncClient) -> None:
    """Product images can be uploaded and listed."""
    product = await create_product(api_client)

    image = await upload_image(api_client, product["id"])
    response = await api_client.get(f"/api/v1/products/{product['id']}/images")

    assert response.status_code == 200
    items = response.json()["data"]["items"]
    assert items[0]["id"] == image["id"]
    assert items[0]["is_primary"] is True


@pytest.mark.anyio
async def test_duplicate_upload_is_rejected(api_client: AsyncClient) -> None:
    """Duplicate image content for a product is rejected."""
    product = await create_product(api_client)
    await upload_image(api_client, product["id"])

    response = await api_client.post(
        f"/api/v1/products/{product['id']}/images",
        files={"file": ("duplicate.png", PNG_BYTES, "image/png")},
    )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_replace_reorder_primary_and_delete_image(api_client: AsyncClient) -> None:
    """Product image replacement, reordering, primary mark, and deletion work."""
    product = await create_product(api_client)
    first = await upload_image(api_client, product["id"])
    second = await upload_image(api_client, product["id"], WEBP_BYTES, "image.webp", "image/webp")

    replace_response = await api_client.put(
        f"/api/v1/products/images/{first['id']}",
        files={"file": ("replacement.webp", WEBP_BYTES + b"2", "image/webp")},
        data={"display_order": "5", "alt_text": "Replacement image"},
    )
    assert replace_response.status_code == 200
    assert replace_response.json()["data"]["display_order"] == 5

    primary_response = await api_client.patch(f"/api/v1/products/images/{second['id']}/primary")
    assert primary_response.status_code == 200
    assert primary_response.json()["data"]["is_primary"] is True

    delete_response = await api_client.delete(f"/api/v1/products/images/{second['id']}")
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["is_deleted"] is True


@pytest.mark.anyio
async def test_invalid_image_type_is_rejected(api_client: AsyncClient) -> None:
    """Unsupported image types are rejected."""
    product = await create_product(api_client)

    response = await api_client.post(
        f"/api/v1/products/{product['id']}/images",
        files={"file": ("image.txt", b"not-image", "text/plain")},
    )

    assert response.status_code == 422
