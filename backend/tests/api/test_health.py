"""Health endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health(api_client: AsyncClient) -> None:
    """Health endpoint returns application status."""
    response = await api_client.get("/health", headers={"X-Request-ID": "test-request"})

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "healthy"
    assert body["requestId"] == "test-request"
    assert "timestamp" in body


@pytest.mark.anyio
async def test_liveness(api_client: AsyncClient) -> None:
    """Liveness endpoint returns live status."""
    response = await api_client.get("/health/live")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "live"


@pytest.mark.anyio
async def test_readiness(api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Readiness endpoint validates configured dependencies."""
    async def healthy_redis(url: str) -> dict[str, object]:
        return {"healthy": True, "configured": True, "message": "Redis connection successful"}

    monkeypatch.setattr("app.api.v1.endpoints.health.check_redis", healthy_redis)

    response = await api_client.get("/health/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["database"]["healthy"] is True
    assert body["data"]["redis"]["healthy"] is True


@pytest.mark.anyio
async def test_versioned_health(api_client: AsyncClient) -> None:
    """Versioned API health endpoint remains available."""
    response = await api_client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "healthy"
