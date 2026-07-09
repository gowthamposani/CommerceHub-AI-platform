"""Wishlist API tests."""

from __future__ import annotations

from uuid import uuid4

import pytest

WISHLIST_ENDPOINT = "/api/v1/wishlist"


def wishlist_payload(product_id) -> dict[str, str]:
    return {"product_id": str(product_id)}


def test_add_list_remove_and_move_wishlist_items(client, customer_headers, product_catalog):
    """Customers should be able to manage wishlist items end-to-end."""

    tee = product_catalog["tee"]
    tote = product_catalog["tote"]

    first_response = client.post(
        WISHLIST_ENDPOINT,
        json=wishlist_payload(tee["id"]),
        headers=customer_headers,
    )
    assert first_response.status_code == 201, first_response.text
    assert first_response.json()["message"] == "Wishlist item added successfully"

    second_response = client.post(
        WISHLIST_ENDPOINT,
        json=wishlist_payload(tote["id"]),
        headers=customer_headers,
    )
    assert second_response.status_code == 201, second_response.text

    list_response = client.get(WISHLIST_ENDPOINT, headers=customer_headers)
    assert list_response.status_code == 200, list_response.text
    list_body = list_response.json()
    assert list_body["success"] is True
    assert {item["product_id"] for item in list_body["data"]} == {str(tee["id"]), str(tote["id"])}

    remove_response = client.delete(f"{WISHLIST_ENDPOINT}/{tee['id']}", headers=customer_headers)
    assert remove_response.status_code == 200, remove_response.text
    assert remove_response.json()["message"] == "Wishlist item deleted successfully"

    move_response = client.post(f"{WISHLIST_ENDPOINT}/{tote['id']}/move-to-cart", headers=customer_headers)
    assert move_response.status_code == 200, move_response.text
    assert move_response.json()["message"] == "Wishlist item moved to cart successfully"

    empty_list_response = client.get(WISHLIST_ENDPOINT, headers=customer_headers)
    assert empty_list_response.status_code == 200, empty_list_response.text
    assert empty_list_response.json()["data"] == []


def test_duplicate_wishlist_item_is_rejected(client, customer_headers, product_catalog):
    """A customer should not be able to add the same product twice."""

    product_id = product_catalog["tee"]["id"]

    first_response = client.post(
        WISHLIST_ENDPOINT,
        json=wishlist_payload(product_id),
        headers=customer_headers,
    )
    assert first_response.status_code == 201, first_response.text

    duplicate_response = client.post(
        WISHLIST_ENDPOINT,
        json=wishlist_payload(product_id),
        headers=customer_headers,
    )

    assert duplicate_response.status_code == 409, duplicate_response.text
    assert duplicate_response.json()["message"] == "Product already exists in wishlist"


@pytest.mark.parametrize(
    ("method", "path", "payload"),
    [
        ("get", WISHLIST_ENDPOINT, None),
        ("post", WISHLIST_ENDPOINT, wishlist_payload(uuid4())),
        ("delete", f"{WISHLIST_ENDPOINT}/{uuid4()}", None),
        ("post", f"{WISHLIST_ENDPOINT}/{uuid4()}/move-to-cart", None),
    ],
)
def test_wishlist_routes_require_authentication(client, method, path, payload):
    """Wishlist endpoints should require a bearer token."""

    request = getattr(client, method)
    if payload is None:
        response = request(path)
    else:
        response = request(path, json=payload)

    assert response.status_code == 401, response.text
    assert response.json()["message"] == "Not authenticated"


def test_non_customer_cannot_manage_wishlist(client, seller_headers, product_catalog):
    """Authenticated non-customers should be blocked from wishlist actions."""

    response = client.post(
        WISHLIST_ENDPOINT,
        json=wishlist_payload(product_catalog["tee"]["id"]),
        headers=seller_headers,
    )

    assert response.status_code == 403, response.text
    assert response.json()["message"] == "Customer access is required"

