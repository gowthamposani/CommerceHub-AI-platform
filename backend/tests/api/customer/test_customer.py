"""Customer profile and address management API tests."""

from __future__ import annotations

from uuid import uuid4

import pytest

PROFILE_ENDPOINT = "/api/v1/customer/profile"
ADDRESSES_ENDPOINT = "/api/v1/customer/addresses"


def address_payload(
    *,
    address_line_1: str = "221 Baker Street",
    address_line_2: str | None = "Apt 4",
    city: str = "London",
    state: str = "Greater London",
    postal_code: str = "NW1 6XE",
    country: str = "United Kingdom",
    phone_number: str | None = "+44 20 7946 0958",
    is_default: bool = False,
) -> dict[str, object]:
    return {
        "address_line_1": address_line_1,
        "address_line_2": address_line_2,
        "city": city,
        "state": state,
        "postal_code": postal_code,
        "country": country,
        "phone_number": phone_number,
        "is_default": is_default,
    }


def profile_payload(*, first_name: str, last_name: str) -> dict[str, str]:
    return {
        "first_name": first_name,
        "last_name": last_name,
    }


def test_customer_profile_get_and_update(client, customer_headers):
    """Return the current profile and persist name changes."""

    profile_response = client.get(PROFILE_ENDPOINT, headers=customer_headers)

    assert profile_response.status_code == 200, profile_response.text
    profile_body = profile_response.json()
    assert profile_body["success"] is True
    assert profile_body["message"] == "Customer profile retrieved successfully"
    assert profile_body["data"]["email"] == "manasa@example.com"
    assert profile_body["data"]["role"]["name"] == "customer"
    assert profile_body["data"]["status"] == "active"
    assert profile_body["data"]["addresses"] == []

    update_response = client.put(
        PROFILE_ENDPOINT,
        json=profile_payload(first_name="Mira", last_name="Shah"),
        headers=customer_headers,
    )

    assert update_response.status_code == 200, update_response.text
    update_body = update_response.json()
    assert update_body["success"] is True
    assert update_body["message"] == "Customer profile updated successfully"
    assert update_body["data"]["first_name"] == "Mira"
    assert update_body["data"]["last_name"] == "Shah"
    assert update_body["data"]["full_name"] == "Mira Shah"

    refreshed_response = client.get(PROFILE_ENDPOINT, headers=customer_headers)
    assert refreshed_response.status_code == 200, refreshed_response.text
    assert refreshed_response.json()["data"]["full_name"] == "Mira Shah"


def test_customer_address_management_default_switch_and_delete_fallback(client, customer_headers):
    """Create, update, default, and delete addresses while preserving a single default."""

    first_response = client.post(
        ADDRESSES_ENDPOINT,
        json=address_payload(
            address_line_1="10 Downing Street",
            city="London",
            postal_code="SW1A 2AA",
            phone_number="+44 20 7925 0918",
        ),
        headers=customer_headers,
    )
    assert first_response.status_code == 201, first_response.text
    first_address = first_response.json()["data"]
    assert first_address["is_default"] is True

    second_response = client.post(
        ADDRESSES_ENDPOINT,
        json=address_payload(
            address_line_1="221B Baker Street",
            address_line_2=None,
            city="London",
            state="Greater London",
            postal_code="NW1 6XE",
            country="United Kingdom",
            phone_number=None,
            is_default=False,
        ),
        headers=customer_headers,
    )
    assert second_response.status_code == 201, second_response.text
    second_address = second_response.json()["data"]
    assert second_address["is_default"] is False

    list_response = client.get(ADDRESSES_ENDPOINT, headers=customer_headers)
    assert list_response.status_code == 200, list_response.text
    list_body = list_response.json()
    assert list_body["success"] is True
    assert [item["id"] for item in list_body["data"]] == [first_address["id"], second_address["id"]]
    assert list_body["data"][0]["is_default"] is True
    assert list_body["data"][1]["is_default"] is False

    update_response = client.put(
        f"{ADDRESSES_ENDPOINT}/{second_address['id']}",
        json={
            "city": "Bengaluru",
            "phone_number": "+91 90000 00000",
        },
        headers=customer_headers,
    )
    assert update_response.status_code == 200, update_response.text
    assert update_response.json()["data"]["city"] == "Bengaluru"
    assert update_response.json()["data"]["phone_number"] == "+91 90000 00000"

    default_response = client.patch(
        f"{ADDRESSES_ENDPOINT}/{second_address['id']}/default",
        headers=customer_headers,
    )
    assert default_response.status_code == 200, default_response.text
    assert default_response.json()["data"]["is_default"] is True

    updated_list_response = client.get(ADDRESSES_ENDPOINT, headers=customer_headers)
    assert updated_list_response.status_code == 200, updated_list_response.text
    updated_addresses = updated_list_response.json()["data"]
    assert updated_addresses[0]["id"] == second_address["id"]
    assert updated_addresses[0]["is_default"] is True
    assert updated_addresses[1]["is_default"] is False

    delete_response = client.delete(f"{ADDRESSES_ENDPOINT}/{second_address['id']}", headers=customer_headers)
    assert delete_response.status_code == 200, delete_response.text
    assert delete_response.json()["message"] == "Address deleted successfully"

    final_list_response = client.get(ADDRESSES_ENDPOINT, headers=customer_headers)
    assert final_list_response.status_code == 200, final_list_response.text
    final_addresses = final_list_response.json()["data"]
    assert len(final_addresses) == 1
    assert final_addresses[0]["id"] == first_address["id"]
    assert final_addresses[0]["is_default"] is True


@pytest.mark.parametrize(
    ("method", "path", "payload"),
    [
        ("get", PROFILE_ENDPOINT, None),
        ("put", PROFILE_ENDPOINT, profile_payload(first_name="Ava", last_name="Stone")),
        ("get", ADDRESSES_ENDPOINT, None),
        ("post", ADDRESSES_ENDPOINT, address_payload()),
        ("put", f"{ADDRESSES_ENDPOINT}/{uuid4()}", {"city": "Paris"}),
        ("delete", f"{ADDRESSES_ENDPOINT}/{uuid4()}", None),
        ("patch", f"{ADDRESSES_ENDPOINT}/{uuid4()}/default", None),
    ],
)
def test_customer_routes_require_authentication(client, method, path, payload):
    """Protected customer routes should reject unauthenticated requests."""

    request = getattr(client, method)
    if payload is None:
        response = request(path)
    else:
        response = request(path, json=payload)

    assert response.status_code == 401, response.text
    assert response.json()["message"] == "Not authenticated"


def test_non_customer_cannot_access_customer_routes(client, seller_headers):
    """Authenticated non-customers should be blocked from customer operations."""

    response = client.get(PROFILE_ENDPOINT, headers=seller_headers)
    assert response.status_code == 403, response.text
    assert response.json()["message"] == "Customer access is required"
