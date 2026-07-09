"""AI provider abstraction for product description generation."""

from __future__ import annotations

import logging
from typing import Protocol

from backend.app.core.config import settings
from backend.app.schemas.ai_schema import ProductDescriptionData, ProductDescriptionRequest


logger = logging.getLogger(__name__)


class AIProviderError(RuntimeError):
    """Raised when AI provider generation fails."""


class AIProviderProtocol(Protocol):
    """Provider contract consumed by the AI service layer."""

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Generate product merchandising content."""


class ConfigurableAIProvider:
    """AI provider adapter with deterministic fallback behavior.

    Production provider calls are intentionally deferred until Gemini/OpenAI
    configuration and SDK choices are finalized.
    """

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Generate product description content or a deterministic mock response."""
        if not self._has_configured_provider():
            logger.info(
                "AI provider API key is not configured; returning deterministic mock response.",
                extra={"feature": "ai_product_description"},
            )
            return self._mock_product_description(payload=payload)

        # TODO: Integrate Gemini/OpenAI-compatible provider call using environment
        # configuration only. Keep this adapter behind AIProviderProtocol so the
        # service layer remains provider-agnostic.
        logger.info(
            "AI provider API key detected; production provider integration is pending.",
            extra={"feature": "ai_product_description"},
        )
        return self._mock_product_description(payload=payload)

    @staticmethod
    def _has_configured_provider() -> bool:
        return bool(settings.gemini_api_key or settings.openai_api_key)

    @staticmethod
    def _mock_product_description(
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        specifications = payload.specifications or ["Reliable quality", "Customer-ready value"]
        highlights = specifications[:5]
        keywords = [
            payload.product_name.lower(),
            payload.brand.lower(),
            payload.category.lower(),
            "commercehub ai",
        ]

        return ProductDescriptionData(
            title=f"{payload.brand} {payload.product_name}",
            description=(
                f"{payload.brand} {payload.product_name} is a {payload.category} product "
                "prepared for marketplace listing with clear specifications and customer-focused value."
            ),
            seo_title=f"{payload.brand} {payload.product_name}",
            seo_description=(
                f"Shop {payload.brand} {payload.product_name} in {payload.category} with "
                "reliable specifications and marketplace-ready details."
            ),
            highlights=highlights,
            keywords=list(dict.fromkeys(keywords)),
        )
