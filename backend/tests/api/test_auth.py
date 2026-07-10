"""Authentication API tests."""

from httpx import AsyncClient


def register_payload(email: str = "jane.seller@example.com") -> dict[str, object]:
    """Build a valid registration payload."""
    return {
        "first_name": "Jane",
        "last_name": "Seller",
        "email": email,
        "password": "StrongPass123",
        "role": "seller",
        "phone": "+919876543210",
    }


async def register_user(api_client: AsyncClient, email: str = "jane.seller@example.com") -> dict[str, object]:
    """Register a user and return the token payload."""
    response = await api_client.post("/api/v1/auth/register", json=register_payload(email))
    assert response.status_code == 201
    return response.json()["data"]


async def test_register_user_returns_tokens(api_client: AsyncClient) -> None:
    """A new user can register and receive token credentials."""
    data = await register_user(api_client)

    assert data["access_token"]
    assert data["refresh_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane.seller@example.com"
    assert data["user"]["role"] == "seller"


async def test_register_rejects_duplicate_email(api_client: AsyncClient) -> None:
    """Duplicate account registration is rejected."""
    await register_user(api_client)
    response = await api_client.post("/api/v1/auth/register", json=register_payload())

    assert response.status_code == 409
    assert response.json()["success"] is False


async def test_login_and_get_current_user(api_client: AsyncClient) -> None:
    """A registered user can log in and resolve /me."""
    await register_user(api_client)
    login_response = await api_client.post(
        "/api/v1/auth/login",
        json={"email": "jane.seller@example.com", "password": "StrongPass123"},
    )

    assert login_response.status_code == 200
    access_token = login_response.json()["data"]["access_token"]
    me_response = await api_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})

    assert me_response.status_code == 200
    assert me_response.json()["data"]["email"] == "jane.seller@example.com"


async def test_login_rejects_invalid_password(api_client: AsyncClient) -> None:
    """Invalid credentials return unauthorized."""
    await register_user(api_client)
    response = await api_client.post(
        "/api/v1/auth/login",
        json={"email": "jane.seller@example.com", "password": "WrongPass123"},
    )

    assert response.status_code == 401


async def test_refresh_rotates_refresh_token(api_client: AsyncClient) -> None:
    """Refresh token endpoint rotates credentials."""
    data = await register_user(api_client)
    response = await api_client.post("/api/v1/auth/refresh", json={"refresh_token": data["refresh_token"]})

    assert response.status_code == 200
    assert response.json()["data"]["access_token"]
    assert response.json()["data"]["refresh_token"] != data["refresh_token"]


async def test_logout_revokes_user_sessions(api_client: AsyncClient) -> None:
    """Logout revokes stored refresh tokens for the authenticated user."""
    data = await register_user(api_client)
    response = await api_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )

    assert response.status_code == 200
    refresh_response = await api_client.post("/api/v1/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert refresh_response.status_code == 401


async def test_register_enforces_password_policy(api_client: AsyncClient) -> None:
    """Weak passwords are rejected by request validation."""
    payload = register_payload("weak@example.com")
    payload["password"] = "weakpass"
    response = await api_client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 422
