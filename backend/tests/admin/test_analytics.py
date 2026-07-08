"""Tests for Admin analytics API behavior."""

from __future__ import annotations

from decimal import Decimal

import pytest
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

from backend.app.admin import routes
from backend.app.admin.schemas import AnalyticsResponse


class AnalyticsServiceStub:
    """Service stub for analytics route tests."""

    def __init__(self, response: AnalyticsResponse) -> None:
        self.response = response

    def get_analytics(self) -> AnalyticsResponse:
        """Return configured analytics response."""
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


def analytics_response(**overrides: object) -> AnalyticsResponse:
    data = {
        "monthly_revenue": Decimal("425000.75"),
        "monthly_orders": 18420,
        "total_customers": 10450,
        "total_sellers": 2050,
        "top_categories": ["Electronics", "Fashion", "Home Appliances"],
        "top_products": ["Wireless Headphones", "Running Shoes"],
    }
    data.update(overrides)
    return AnalyticsResponse(**data)


def test_analytics_response(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: AnalyticsServiceStub(
        analytics_response()
    )

    response = client.get("/api/v1/admin/analytics")

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["monthly_orders"] == 18420
    assert payload["top_categories"] == ["Electronics", "Fashion", "Home Appliances"]


def test_empty_analytics(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_admin_service] = lambda: AnalyticsServiceStub(
        analytics_response(
            monthly_revenue=Decimal("0"),
            monthly_orders=0,
            total_customers=0,
            total_sellers=0,
            top_categories=[],
            top_products=[],
        )
    )

    response = client.get("/api/v1/admin/analytics")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["top_products"] == []


def test_authorization(app: FastAPI, client: TestClient) -> None:
    def forbidden_service() -> None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    app.dependency_overrides[routes.get_admin_service] = forbidden_service

    response = client.get("/api/v1/admin/analytics")

    assert response.status_code == status.HTTP_403_FORBIDDEN
