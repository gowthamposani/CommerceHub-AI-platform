"""Tests for Admin user API behavior."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

from backend.app.admin import routes
from backend.app.admin.schemas import AdminUserResponse, UpdateUserStatusRequest, UserStatus


class UserServiceStub:
    """Service stub for user management route tests."""

    def __init__(self) -> None:
        self.users = [
            AdminUserResponse(
                id=1,
                full_name="Ananya Sharma",
                email="ananya.sharma@example.com",
                role="SELLER",
                status=UserStatus.ACTIVE,
                created_at=datetime.now(timezone.utc),
            )
        ]

    def get_users(self) -> list[AdminUserResponse]:
        """Return configured test users."""
        return self.users

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Update a configured test user status."""
        if user_id != 1:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        updated_user = self.users[0].model_copy(update={"status": payload.status})
        self.users[0] = updated_user
        return updated_user


@pytest.fixture()
def app() -> FastAPI:
    application = FastAPI()
    application.include_router(routes.router)
    yield application
    application.dependency_overrides.clear()


@pytest.fixture()
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


def test_get_users(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = UserServiceStub

    response = client.get("/api/v1/admin/users")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()[0]["email"] == "ananya.sharma@example.com"


def test_invalid_user_id(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = UserServiceStub

    response = client.patch(
        "/api/v1/admin/users/0/status",
        json={"status": "BLOCKED"},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_update_status(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = UserServiceStub

    response = client.patch(
        "/api/v1/admin/users/1/status",
        json={"status": "BLOCKED"},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "BLOCKED"


def test_invalid_status(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = UserServiceStub

    response = client.patch(
        "/api/v1/admin/users/1/status",
        json={"status": "SUSPENDED"},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_unauthorized(app: FastAPI, client: TestClient) -> None:
    def unauthorized_service() -> None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized.")

    app.dependency_overrides[routes.get_admin_service] = unauthorized_service

    response = client.get("/api/v1/admin/users")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_forbidden_role(app: FastAPI, client: TestClient) -> None:
    def forbidden_service() -> None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    app.dependency_overrides[routes.get_admin_service] = forbidden_service

    response = client.get("/api/v1/admin/users")

    assert response.status_code == status.HTTP_403_FORBIDDEN
