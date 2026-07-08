"""Tests for AI product description generator API and provider behavior."""

from __future__ import annotations

import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from backend.app.ai import routes
from backend.app.ai.provider import GeminiProvider, GeminiProviderSettings
from backend.app.ai.schemas import ProductDescriptionResponse
from backend.app.ai.service import AIServiceError


class AIServiceStub:
    def generate_product_description(self, payload: object) -> ProductDescriptionResponse:
        return product_description_response()


class FailingAIServiceStub:
    def __init__(self, message: str = "AI generation failed.") -> None:
        self.message = message

    def generate_product_description(self, payload: object) -> ProductDescriptionResponse:
        raise AIServiceError(self.message)


@pytest.fixture()
def app() -> FastAPI:
    application = FastAPI()
    application.include_router(routes.router)
    yield application
    application.dependency_overrides.clear()


@pytest.fixture()
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


def valid_request() -> dict[str, object]:
    return {
        "product_name": "Wireless Noise Cancelling Headphones",
        "brand": "SoundMax",
        "category": "Electronics",
        "features": [
            "Bluetooth 5.3",
            "40-hour battery life",
            "Active noise cancellation",
        ],
        "specifications": {
            "Battery Life": "40 hours",
            "Connectivity": "Bluetooth 5.3",
        },
    }


def product_description_response() -> ProductDescriptionResponse:
    return ProductDescriptionResponse(
        generated_description=(
            "SoundMax Wireless Noise Cancelling Headphones deliver a refined listening "
            "experience for shoppers who want dependable wireless performance, active "
            "noise cancellation, and long battery life in a polished everyday design."
        ),
        generated_keywords=[
            "wireless headphones",
            "noise cancelling",
            "bluetooth headphones",
        ],
        seo_title="SoundMax Wireless Noise Cancelling Headphones",
        meta_description=(
            "Shop SoundMax wireless headphones with Bluetooth 5.3, active noise "
            "cancellation, and up to 40 hours of battery life."
        ),
        highlights=[
            "Active noise cancellation",
            "Bluetooth 5.3 connectivity",
            "Up to 40 hours battery",
        ],
    )


def test_generate_product_description(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_ai_service] = AIServiceStub

    response = client.post("/api/v1/ai/product-description", json=valid_request())

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["seo_title"] == "SoundMax Wireless Noise Cancelling Headphones"


def test_invalid_request(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_ai_service] = AIServiceStub

    payload = valid_request()
    payload.pop("features")
    response = client.post("/api/v1/ai/product-description", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_empty_product_name(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_ai_service] = AIServiceStub

    payload = valid_request()
    payload["product_name"] = ""
    response = client.post("/api/v1/ai/product-description", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_gemini_timeout(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_ai_service] = lambda: FailingAIServiceStub(
        "Gemini provider timed out."
    )

    response = client.post("/api/v1/ai/product-description", json=valid_request())

    assert response.status_code == status.HTTP_502_BAD_GATEWAY


def test_gemini_api_failure(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_ai_service] = lambda: FailingAIServiceStub(
        "Gemini API failure."
    )

    response = client.post("/api/v1/ai/product-description", json=valid_request())

    assert response.status_code == status.HTTP_502_BAD_GATEWAY


def test_response_validation(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[routes.get_ai_service] = AIServiceStub

    response = client.post("/api/v1/ai/product-description", json=valid_request())

    assert response.status_code == status.HTTP_200_OK
    validated_response = ProductDescriptionResponse.model_validate(response.json())
    assert len(validated_response.generated_keywords) >= 3
    assert len(validated_response.highlights) >= 3


def test_gemini_provider_timeout_is_mocked(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = GeminiProviderSettings(
        api_key="test-api-key",
        model="gemini-test",
        endpoint_url="https://gemini.invalid",
        max_retries=1,
        timeout_seconds=0.01,
    )
    provider = GeminiProvider(settings=settings)

    def raise_timeout(prompt: str) -> dict[str, object]:
        raise TimeoutError("Gemini timeout.")

    monkeypatch.setattr(provider, "_send_request", raise_timeout)

    with pytest.raises(Exception, match="Gemini provider request failed"):
        provider.generate_product_description("Generate product copy.")
