"""Sample API tests for validating backend test infrastructure."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_endpoint_returns_success(api_client: TestClient) -> None:
    """Verify the health endpoint is reachable through the test client."""
    response = api_client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_openapi_schema_is_available(api_client: TestClient) -> None:
    """Verify OpenAPI schema generation remains available."""
    response = api_client.get("/openapi.json")

    assert response.status_code == 200
    assert "paths" in response.json()
