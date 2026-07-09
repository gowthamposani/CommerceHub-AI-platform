"""Shopping cart API tests."""

from __future__ import annotations

from uuid import uuid4

import pytest
from sqlalchemy import text

CART_ENDPOINT = "/api/v1/cart"


def cart_item_payload(product_id, quantity: int = 1) -> dict[str, object]:
    return {
        "product_id": str(product_id),
        "quantity": quantity,
    }


def test_duplicate_cart_items_accumulate_quantity_and_totals(client, customer_headers, product_catalog):
    """Adding the same product twice should update quantity rather than create duplicates."""

    tee = product_catalog["tee"]
    tote = product_catalog["tote"]

    first_response = client.post(
        CART_ENDPOINT,
        json=cart_item_payload(tee["id"], quantity=1),
        headers=customer_headers,
    )
    assert first_response.status_code == 200, first_response.text
    assert first_response.json()["data"]["item_count"] == 1
    assert first_response.json()["data"]["total_quantity"] == 1
    assert first_response.json()["data"]["subtotal"] == pytest.approx(float(tee["price"]), rel=1e-6)

    second_response = client.post(
        CART_ENDPOINT,
        json=cart_item_payload(tee["id"], quantity=2),
        headers=customer_headers,
    )
    assert second_response.status_code == 200, second_response.text
    cart = second_response.json()["data"]
    assert cart["item_count"] == 1
    assert cart["total_quantity"] == 3
    assert cart["items"][0]["quantity"] == 3
    assert cart["subtotal"] == pytest.approx(float(tee["price"]) * 3, rel=1e-6)
    assert cart["grand_total"] == pytest.approx(float(tee["price"]) * 3, rel=1e-6)

    third_response = client.post(
        CART_ENDPOINT,
        json=cart_item_payload(tote["id"], quantity=1),
        headers=customer_headers,
    )
    assert third_response.status_code == 200, third_response.text
    cart = third_response.json()["data"]
    assert cart["item_count"] == 2
    assert cart["total_quantity"] == 4
    assert [item["product_id"] for item in cart["items"]] == [str(tee["id"]), str(tote["id"])]
    expected_total = (float(tee["price"]) * 3) + float(tote["price"])
    assert cart["subtotal"] == pytest.approx(expected_total, rel=1e-6)
    assert cart["grand_total"] == pytest.approx(expected_total, rel=1e-6)


def test_update_delete_and_clear_cart(client, customer_headers, product_catalog):
    """Customers should be able to update quantities, remove items, and clear their cart."""

    product_id = product_catalog["tee"]["id"]

    add_response = client.post(
        CART_ENDPOINT,
        json=cart_item_payload(product_id, quantity=1),
        headers=customer_headers,
    )
    assert add_response.status_code == 200, add_response.text
    item_id = add_response.json()["data"]["items"][0]["id"]

    update_response = client.put(
        f"{CART_ENDPOINT}/items/{item_id}",
        json={"quantity": 4},
        headers=customer_headers,
    )
    assert update_response.status_code == 200, update_response.text
    updated_cart = update_response.json()["data"]
    assert updated_cart["item_count"] == 1
    assert updated_cart["total_quantity"] == 4
    assert updated_cart["items"][0]["quantity"] == 4
    assert updated_cart["subtotal"] == pytest.approx(float(product_catalog["tee"]["price"]) * 4, rel=1e-6)

    delete_response = client.delete(f"{CART_ENDPOINT}/items/{item_id}", headers=customer_headers)
    assert delete_response.status_code == 200, delete_response.text
    assert delete_response.json()["data"]["items"] == []

    client.post(
        CART_ENDPOINT,
        json=cart_item_payload(product_catalog["tee"]["id"], quantity=1),
        headers=customer_headers,
    )
    client.post(
        CART_ENDPOINT,
        json=cart_item_payload(product_catalog["tote"]["id"], quantity=2),
        headers=customer_headers,
    )

    clear_response = client.delete(CART_ENDPOINT, headers=customer_headers)
    assert clear_response.status_code == 200, clear_response.text
    cleared_cart = clear_response.json()["data"]
    assert cleared_cart["item_count"] == 0
    assert cleared_cart["total_quantity"] == 0
    assert cleared_cart["items"] == []
    assert cleared_cart["subtotal"] == 0
    assert cleared_cart["grand_total"] == 0


def test_cart_rejects_insufficient_stock(client, customer_headers, db_connection, product_catalog):
    """Cart additions should fail when the requested quantity exceeds stock."""

    product_id = product_catalog["tee"]["id"]
    db_connection.execute(
        text("UPDATE products SET stock = 1 WHERE id = :product_id"),
        {"product_id": product_id},
    )

    response = client.post(
        CART_ENDPOINT,
        json=cart_item_payload(product_id, quantity=2),
        headers=customer_headers,
    )

    assert response.status_code == 409, response.text
    assert response.json()["message"] == "Requested quantity exceeds available stock"


@pytest.mark.parametrize(
    ("method", "path", "payload"),
    [
        ("get", CART_ENDPOINT, None),
        ("post", CART_ENDPOINT, cart_item_payload(uuid4(), quantity=1)),
        ("put", f"{CART_ENDPOINT}/items/{uuid4()}", {"quantity": 2}),
        ("delete", f"{CART_ENDPOINT}/items/{uuid4()}", None),
        ("delete", CART_ENDPOINT, None),
    ],
)
def test_cart_routes_require_authentication(client, method, path, payload):
    """Cart endpoints should reject requests without a valid bearer token."""

    request = getattr(client, method)
    if payload is None:
        response = request(path)
    else:
        response = request(path, json=payload)

    assert response.status_code == 401, response.text
    assert response.json()["message"] == "Not authenticated"


def test_non_customer_cannot_access_cart(client, seller_headers):
    """Authenticated non-customers should be blocked from cart endpoints."""

    response = client.get(CART_ENDPOINT, headers=seller_headers)
    assert response.status_code == 403, response.text
    assert response.json()["message"] == "Customer access is required"
