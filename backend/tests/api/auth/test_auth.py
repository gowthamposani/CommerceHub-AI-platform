"""Authentication API tests."""

from __future__ import annotations

from datetime import timedelta

from app.core.config import get_settings
from app.core.security import create_jwt_token

settings = get_settings()

REGISTER_ENDPOINT = "/api/v1/auth/register"
LOGIN_ENDPOINT = "/api/v1/auth/login"
REFRESH_ENDPOINT = "/api/v1/auth/refresh"
LOGOUT_ENDPOINT = "/api/v1/auth/logout"
ME_ENDPOINT = "/api/v1/auth/me"

DEFAULT_FIRST_NAME = "manasa"
DEFAULT_LAST_NAME = "manasa"
DEFAULT_EMAIL = "manasa@example.com"
DEFAULT_PASSWORD = "Pass12345"
DEFAULT_ROLE = "customer"


def registration_payload(
    *,
    first_name: str = DEFAULT_FIRST_NAME,
    last_name: str = DEFAULT_LAST_NAME,
    email: str = DEFAULT_EMAIL,
    password: str = DEFAULT_PASSWORD,
    role: str = DEFAULT_ROLE,
) -> dict[str, str]:
    """Build a standard registration payload."""

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password,
        "role": role,
    }


def login_payload(*, email: str = DEFAULT_EMAIL, password: str = DEFAULT_PASSWORD) -> dict[str, str]:
    """Build a standard login payload."""

    return {
        "email": email,
        "password": password,
    }


def register_user(client, *, email: str = DEFAULT_EMAIL, password: str = DEFAULT_PASSWORD, role: str = DEFAULT_ROLE):
    """Register a user and return the raw response."""

    return client.post(REGISTER_ENDPOINT, json=registration_payload(email=email, password=password, role=role))


def login_user(client, *, email: str = DEFAULT_EMAIL, password: str = DEFAULT_PASSWORD):
    """Authenticate a user and return the raw response."""

    return client.post(LOGIN_ENDPOINT, json=login_payload(email=email, password=password))


def auth_headers(token: str) -> dict[str, str]:
    """Return a bearer authorization header."""

    return {"Authorization": f"Bearer {token}"}


def test_user_registration(client):
    """Register a new customer successfully."""

    response = register_user(client)

    assert response.status_code == 201, response.text
    body = response.json()

    assert body["success"] is True
    assert body["message"] == "Registration successful"

    data = body["data"]
    assert data["first_name"] == DEFAULT_FIRST_NAME
    assert data["last_name"] == DEFAULT_LAST_NAME
    assert data["full_name"] == f"{DEFAULT_FIRST_NAME} {DEFAULT_LAST_NAME}"
    assert data["email"] == DEFAULT_EMAIL
    assert data["role"]["name"] == DEFAULT_ROLE
    assert data["status"] == "active"
    assert data["id"]
    assert data["created_at"]
    assert data["updated_at"]


def test_duplicate_email_registration(client):
    """Reject a second registration with the same email address."""

    first_response = register_user(client)
    assert first_response.status_code == 201, first_response.text

    second_response = register_user(client)

    assert second_response.status_code == 409, second_response.text
    body = second_response.json()
    assert body["success"] is False
    assert body["message"] == "A user with this email already exists"


def test_login_with_valid_credentials(client):
    """Authenticate a registered user and return a token pair."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    response = login_user(client)

    assert response.status_code == 200, response.text
    body = response.json()

    assert body["success"] is True
    assert body["message"] == "Login successful"

    data = body["data"]
    assert data["user"]["email"] == DEFAULT_EMAIL
    assert data["user"]["role"]["name"] == DEFAULT_ROLE
    assert data["user"]["status"] == "active"
    assert data["user"]["last_login_at"] is not None
    assert data["tokens"]["token_type"] == "bearer"
    assert data["tokens"]["access_token"]
    assert data["tokens"]["refresh_token"]


def test_login_with_invalid_password(client):
    """Reject login attempts with a wrong password."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    response = login_user(client, password="WrongPass123")

    assert response.status_code == 401, response.text
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Invalid email or password"


def test_refresh_token_rotates_tokens(client):
    """Refresh a token pair and invalidate the previous refresh token."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    login_response = login_user(client)
    assert login_response.status_code == 200, login_response.text
    session = login_response.json()["data"]
    original_access_token = session["tokens"]["access_token"]
    original_refresh_token = session["tokens"]["refresh_token"]

    refresh_response = client.post(REFRESH_ENDPOINT, json={"refresh_token": original_refresh_token})

    assert refresh_response.status_code == 200, refresh_response.text
    body = refresh_response.json()
    assert body["success"] is True
    assert body["message"] == "Token refreshed successfully"

    refreshed_session = body["data"]
    assert refreshed_session["tokens"]["access_token"] != original_access_token
    assert refreshed_session["tokens"]["refresh_token"] != original_refresh_token

    reused_response = client.post(REFRESH_ENDPOINT, json={"refresh_token": original_refresh_token})
    assert reused_response.status_code == 401, reused_response.text
    assert reused_response.json()["message"] == "Refresh token is invalid or revoked"


def test_logout_revokes_refresh_token(client):
    """Logout should revoke the current refresh token."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    login_response = login_user(client)
    assert login_response.status_code == 200, login_response.text
    refresh_token = login_response.json()["data"]["tokens"]["refresh_token"]

    logout_response = client.post(LOGOUT_ENDPOINT, json={"refresh_token": refresh_token})

    assert logout_response.status_code == 200, logout_response.text
    body = logout_response.json()
    assert body["success"] is True
    assert body["message"] == "Logout successful"

    refresh_after_logout = client.post(REFRESH_ENDPOINT, json={"refresh_token": refresh_token})
    assert refresh_after_logout.status_code == 401, refresh_after_logout.text
    assert refresh_after_logout.json()["message"] == "Refresh token is invalid or revoked"


def test_current_user_returns_authenticated_profile(client):
    """Return the current authenticated user from the access token."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    login_response = login_user(client)
    assert login_response.status_code == 200, login_response.text
    session = login_response.json()["data"]

    response = client.get(ME_ENDPOINT, headers=auth_headers(session["tokens"]["access_token"]))

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Current user retrieved successfully"

    user = body["data"]
    assert user["email"] == DEFAULT_EMAIL
    assert user["full_name"] == f"{DEFAULT_FIRST_NAME} {DEFAULT_LAST_NAME}"
    assert user["role"]["name"] == DEFAULT_ROLE
    assert user["status"] == "active"


def test_expired_jwt_returns_unauthorized(client):
    """Reject an expired access token when calling the protected profile endpoint."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    login_response = login_user(client)
    assert login_response.status_code == 200, login_response.text
    user = login_response.json()["data"]["user"]

    expired_token, _, _ = create_jwt_token(
        subject=str(user["id"]),
        token_type="access",
        expires_delta=timedelta(minutes=-5),
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        issuer=settings.token_issuer,
        audience=settings.token_audience,
        extra_claims={
            "email": user["email"],
            "role": user["role"]["name"],
        },
    )

    response = client.get(ME_ENDPOINT, headers=auth_headers(expired_token))

    assert response.status_code == 401, response.text
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Invalid or expired token"


def test_invalid_jwt_returns_unauthorized(client):
    """Reject a signed token that does not match the configured secret."""

    register_response = register_user(client)
    assert register_response.status_code == 201, register_response.text

    login_response = login_user(client)
    assert login_response.status_code == 200, login_response.text
    user = login_response.json()["data"]["user"]

    invalid_token, _, _ = create_jwt_token(
        subject=str(user["id"]),
        token_type="access",
        expires_delta=timedelta(minutes=5),
        secret_key="wrong-secret",
        algorithm=settings.jwt_algorithm,
        issuer=settings.token_issuer,
        audience=settings.token_audience,
        extra_claims={
            "email": user["email"],
            "role": user["role"]["name"],
        },
    )

    response = client.get(ME_ENDPOINT, headers=auth_headers(invalid_token))

    assert response.status_code == 401, response.text
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Invalid or expired token"


def test_unauthorized_access_is_rejected(client):
    """Reject unauthenticated access to the profile endpoint."""

    response = client.get(ME_ENDPOINT)

    assert response.status_code == 401, response.text
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Not authenticated"
