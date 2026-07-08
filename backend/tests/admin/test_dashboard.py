"""Tests for Admin dashboard API behavior."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

import pytest
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

from backend.app.admin import routes
from backend.app.admin.schemas import DashboardSummaryResponse


class DashboardServiceStub:
    """Service stub for dashboard route tests."""

    def __init__(self, response: DashboardSummaryResponse) -> None:
        self.response = response

    def get_dashboard(self) -> DashboardSummaryResponse:
        """Return a configured dashboard response."""
        return self.response


@pytest.fixture()
def app() -> FastAPI:
    application = FastAPI()
    application.include_router(routes.router)
    yield application
    application.dependency_overrides.clear()


@pytest.fixture()
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


def dashboard_response(**overrides: object) -> DashboardSummaryResponse:
    data = {
        "total_users": 125,
        "total_customers": 95,
        "total_sellers": 30,
        "total_products": 420,
        "total_orders": 850,
        "pending_seller_requests": 7,
        "active_users": 118,
        "revenue": Decimal("45890.25"),
        "generated_at": datetime.now(timezone.utc),
    }
    data.update(overrides)
    return DashboardSummaryResponse(**data)


def test_dashboard_api_returns_200(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: DashboardServiceStub(
        dashboard_response()
    )

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total_users"] == 125


def test_dashboard_response_schema_validation(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: DashboardServiceStub(
        dashboard_response()
    )

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == status.HTTP_200_OK
    validated_response = DashboardSummaryResponse.model_validate(response.json())
    assert validated_response.total_products == 420
    assert validated_response.revenue == Decimal("45890.25")


def test_dashboard_unauthorized_request_returns_401(
    app: FastAPI,
    client: TestClient,
) -> None:
    def unauthorized_service() -> None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    app.dependency_overrides[routes.get_admin_service] = unauthorized_service

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_empty_dashboard_response_handling(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: DashboardServiceStub(
        dashboard_response(
            total_users=0,
            total_customers=0,
            total_sellers=0,
            total_products=0,
            total_orders=0,
            pending_seller_requests=0,
            active_users=0,
            revenue=Decimal("0"),
        )
    )

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total_users"] == 0
    assert Decimal(response.json()["revenue"]) == Decimal("0")
