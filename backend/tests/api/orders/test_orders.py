"""Order API tests."""

from __future__ import annotations

from uuid import uuid4

import pytest
from sqlalchemy import text

CHECKOUT_ENDPOINT = "/api/v1/orders/checkout"
ORDERS_ENDPOINT = "/api/v1/orders"


def cart_item_payload(product_id, quantity: int = 1) -> dict[str, object]:
    return {
        "product_id": str(product_id),
        "quantity": quantity,
    }


def checkout_payload(payment_id) -> dict[str, str]:
    return {"payment_id": str(payment_id)}


def seed_checkout_cart(client, headers, product_catalog) -> None:
    """Populate the cart with two products before checkout."""

    client.post(
        "/api/v1/cart",
        json=cart_item_payload(product_catalog["tee"]["id"], quantity=2),
        headers=headers,
    )
    client.post(
        "/api/v1/cart",
        json=cart_item_payload(product_catalog["tote"]["id"], quantity=1),
        headers=headers,
    )


def get_product_stock(db_connection, product_id) -> int:
    return int(
        db_connection.execute(
            text("SELECT stock FROM products WHERE id = :product_id"),
            {"product_id": product_id},
        ).scalar_one()
    )


def test_checkout_creates_order_empties_cart_and_reduces_stock(client, customer_headers, db_connection, product_catalog):
    """Checkout should create an order, clear the cart, and reduce inventory."""

    seed_checkout_cart(client, customer_headers, product_catalog)
    payment_id = uuid4()

    checkout_response = client.post(
        CHECKOUT_ENDPOINT,
        json=checkout_payload(payment_id),
        headers=customer_headers,
    )

    assert checkout_response.status_code == 201, checkout_response.text
    checkout_body = checkout_response.json()
    assert checkout_body["success"] is True
    assert checkout_body["message"] == "Order placed successfully"

    order = checkout_body["data"]
    assert order["payment_id"] == str(payment_id)
    assert order["status"] == "placed"
    assert order["item_count"] == 2
    assert order["total_quantity"] == 3
    assert len(order["items"]) == 2
    assert [item["product_id"] for item in order["items"]] == [
        str(product_catalog["tee"]["id"]),
        str(product_catalog["tote"]["id"]),
    ]

    expected_total = (float(product_catalog["tee"]["price"]) * 2) + float(product_catalog["tote"]["price"])
    assert order["total_amount"] == pytest.approx(expected_total, rel=1e-6)

    cart_response = client.get("/api/v1/cart", headers=customer_headers)
    assert cart_response.status_code == 200, cart_response.text
    cart = cart_response.json()["data"]
    assert cart["item_count"] == 0
    assert cart["total_quantity"] == 0
    assert cart["items"] == []
    assert cart["subtotal"] == 0
    assert cart["grand_total"] == 0

    assert get_product_stock(db_connection, product_catalog["tee"]["id"]) == 8
    assert get_product_stock(db_connection, product_catalog["tote"]["id"]) == 4


def test_orders_list_and_get_order(client, customer_headers, product_catalog):
    """Customers should be able to list and fetch their own orders."""

    seed_checkout_cart(client, customer_headers, product_catalog)
    checkout_response = client.post(CHECKOUT_ENDPOINT, json=checkout_payload(uuid4()), headers=customer_headers)
    assert checkout_response.status_code == 201, checkout_response.text
    order_id = checkout_response.json()["data"]["id"]

    list_response = client.get(ORDERS_ENDPOINT, headers=customer_headers)
    assert list_response.status_code == 200, list_response.text
    list_body = list_response.json()
    assert list_body["success"] is True
    assert len(list_body["data"]) == 1
    assert list_body["data"][0]["id"] == order_id
    assert list_body["data"][0]["status"] == "placed"

    detail_response = client.get(f"{ORDERS_ENDPOINT}/{order_id}", headers=customer_headers)
    assert detail_response.status_code == 200, detail_response.text
    detail_body = detail_response.json()
    assert detail_body["message"] == "Order retrieved successfully"
    assert detail_body["data"]["id"] == order_id
    assert detail_body["data"]["item_count"] == 2
    assert detail_body["data"]["total_quantity"] == 3


def test_cancel_order_before_shipment_restores_stock(client, customer_headers, db_connection, product_catalog):
    """Orders should be cancellable before shipment and restore inventory."""

    seed_checkout_cart(client, customer_headers, product_catalog)
    checkout_response = client.post(CHECKOUT_ENDPOINT, json=checkout_payload(uuid4()), headers=customer_headers)
    assert checkout_response.status_code == 201, checkout_response.text
    order_id = checkout_response.json()["data"]["id"]

    cancel_response = client.patch(f"{ORDERS_ENDPOINT}/{order_id}/cancel", headers=customer_headers)
    assert cancel_response.status_code == 200, cancel_response.text
    cancel_body = cancel_response.json()
    assert cancel_body["message"] == "Order cancelled successfully"
    assert cancel_body["data"]["status"] == "cancelled"

    assert get_product_stock(db_connection, product_catalog["tee"]["id"]) == 10
    assert get_product_stock(db_connection, product_catalog["tote"]["id"]) == 5

    refreshed_response = client.get(f"{ORDERS_ENDPOINT}/{order_id}", headers=customer_headers)
    assert refreshed_response.status_code == 200, refreshed_response.text
    assert refreshed_response.json()["data"]["status"] == "cancelled"


def test_cancel_shipped_order_is_rejected(client, customer_headers, db_connection, product_catalog):
    """Orders that have already shipped should not be cancellable."""

    seed_checkout_cart(client, customer_headers, product_catalog)
    checkout_response = client.post(CHECKOUT_ENDPOINT, json=checkout_payload(uuid4()), headers=customer_headers)
    assert checkout_response.status_code == 201, checkout_response.text
    order_id = checkout_response.json()["data"]["id"]

    db_connection.execute(
        text("UPDATE orders SET status = 'shipped' WHERE id = :order_id"),
        {"order_id": order_id},
    )

    cancel_response = client.patch(f"{ORDERS_ENDPOINT}/{order_id}/cancel", headers=customer_headers)
    assert cancel_response.status_code == 409, cancel_response.text
    assert cancel_response.json()["message"] == "Order can only be cancelled before shipment"

    order_response = client.get(f"{ORDERS_ENDPOINT}/{order_id}", headers=customer_headers)
    assert order_response.status_code == 200, order_response.text
    assert order_response.json()["data"]["status"] == "shipped"


@pytest.mark.parametrize(
    ("method", "path", "payload"),
    [
        ("post", CHECKOUT_ENDPOINT, checkout_payload(uuid4())),
        ("get", ORDERS_ENDPOINT, None),
        ("get", f"{ORDERS_ENDPOINT}/{uuid4()}", None),
        ("patch", f"{ORDERS_ENDPOINT}/{uuid4()}/cancel", None),
    ],
)
def test_orders_routes_require_authentication(client, method, path, payload):
    """Order routes should require authentication."""

    request = getattr(client, method)
    if payload is None:
        response = request(path)
    else:
        response = request(path, json=payload)

    assert response.status_code == 401, response.text
    assert response.json()["message"] == "Not authenticated"


def test_non_customer_cannot_access_orders(client, seller_headers):
    """Authenticated non-customers should be blocked from order operations."""

    response = client.get(ORDERS_ENDPOINT, headers=seller_headers)
    assert response.status_code == 403, response.text
    assert response.json()["message"] == "Customer access is required"

