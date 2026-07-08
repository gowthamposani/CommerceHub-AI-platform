"""Tests for Admin category API behavior."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

from backend.app.admin import routes
from backend.app.admin.schemas import (
    CategoryResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
)


class CategoryServiceStub:
    """Service stub for category route tests."""

    def __init__(self) -> None:
        self.categories = {
            1: CategoryResponse(
                id=1,
                name="Electronics",
                description="Devices and accessories.",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
        }

    def get_categories(self) -> list[CategoryResponse]:
        """Return configured test categories."""
        return list(self.categories.values())

    def create_category(self, payload: CreateCategoryRequest) -> CategoryResponse:
        """Create a test category or raise duplicate conflict."""
        if payload.name.lower() == "electronics":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category already exists.",
            )

        category = CategoryResponse(
            id=2,
            name=payload.name,
            description=payload.description,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        )
        self.categories[2] = category
        return category

    def update_category(
        self,
        category_id: int,
        payload: UpdateCategoryRequest,
    ) -> CategoryResponse:
        """Update a configured test category."""
        category = self.categories.get(category_id)
        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found.",
            )

        updated_category = category.model_copy(
            update={
                "name": payload.name if payload.name is not None else category.name,
                "description": (
                    payload.description
                    if payload.description is not None
                    else category.description
                ),
                "is_active": (
                    payload.is_active
                    if payload.is_active is not None
                    else category.is_active
                ),
            }
        )
        self.categories[category_id] = updated_category
        return updated_category

    def delete_category(self, category_id: int) -> None:
        """Delete a configured test category."""
        if category_id not in self.categories:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found.",
            )
        self.categories.pop(category_id)


@pytest.fixture()
def app() -> FastAPI:
    application = FastAPI()
    application.include_router(routes.router)
    yield application
    application.dependency_overrides.clear()


@pytest.fixture()
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


@pytest.fixture()
def category_service() -> CategoryServiceStub:
    return CategoryServiceStub()


def test_create_category(
    app: FastAPI,
    client: TestClient,
    category_service: CategoryServiceStub,
) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: category_service

    response = client.post(
        "/api/v1/admin/categories",
        json={"name": "Home Appliances", "description": "Home and kitchen devices."},
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["name"] == "Home Appliances"


def test_update_category(
    app: FastAPI,
    client: TestClient,
    category_service: CategoryServiceStub,
) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: category_service

    response = client.put(
        "/api/v1/admin/categories/1",
        json={"name": "Consumer Electronics", "is_active": True},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Consumer Electronics"


def test_delete_category(
    app: FastAPI,
    client: TestClient,
    category_service: CategoryServiceStub,
) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: category_service

    response = client.delete("/api/v1/admin/categories/1")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert response.content == b""


def test_duplicate_category(
    app: FastAPI,
    client: TestClient,
    category_service: CategoryServiceStub,
) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: category_service

    response = client.post(
        "/api/v1/admin/categories",
        json={"name": "Electronics", "description": "Duplicate."},
    )

    assert response.status_code == status.HTTP_409_CONFLICT


def test_validation_failure(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = CategoryServiceStub

    response = client.post(
        "/api/v1/admin/categories",
        json={"name": "", "description": "Invalid category name."},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
