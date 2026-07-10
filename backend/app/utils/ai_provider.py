"""Enterprise AI provider abstraction and provider selection."""

from __future__ import annotations

import logging
from enum import StrEnum
from typing import Protocol

from backend.app.core.config import settings
from backend.app.schemas.ai_schema import ProductDescriptionData, ProductDescriptionRequest


logger = logging.getLogger(__name__)


class AIProviderError(RuntimeError):
    """Raised when AI provider generation fails."""


class AIProviderName(StrEnum):
    """Supported AI provider names."""

    MOCK = "MOCK"
    OPENAI = "OPENAI"
    GEMINI = "GEMINI"


class AIProvider(Protocol):
    """Provider contract consumed by all AI service-layer features."""

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Generate product merchandising content."""


class MockAIProvider:
    """Deterministic mock AI provider used for local development and missing keys."""

    provider_name = AIProviderName.MOCK

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Generate deterministic product description content."""
        logger.info(
            "Generating product description with MockAIProvider.",
            extra={"feature": "ai_product_description", "ai_provider": self.provider_name.value},
        )
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


class OpenAIProvider:
    """OpenAI-compatible provider stub.

    TODO: Add OpenAI-compatible SDK/client integration after provider contract,
    retry policy, and secret management are finalized.
    """

    provider_name = AIProviderName.OPENAI

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Generate content through OpenAI-compatible provider when implemented."""
        logger.info(
            "OpenAIProvider selected; returning mock response until integration is complete.",
            extra={"feature": "ai_product_description", "ai_provider": self.provider_name.value},
        )
        return MockAIProvider().generate_product_description(payload=payload)


class GeminiProvider:
    """Gemini provider stub.

    TODO: Add Gemini SDK/client integration after provider contract, retry policy,
    and secret management are finalized.
    """

    provider_name = AIProviderName.GEMINI

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Generate content through Gemini provider when implemented."""
        logger.info(
            "GeminiProvider selected; returning mock response until integration is complete.",
            extra={"feature": "ai_product_description", "ai_provider": self.provider_name.value},
        )
        return MockAIProvider().generate_product_description(payload=payload)


class AIProviderFactory:
    """Factory for selecting AI providers from environment configuration."""

    @staticmethod
    def create() -> AIProvider:
        """Create an AI provider using configured provider and API keys."""
        configured_provider = AIProviderFactory._configured_provider()

        if configured_provider is AIProviderName.OPENAI:
            if settings.openai_api_key:
                return OpenAIProvider()
            logger.warning(
                "OPENAI provider selected but OPENAI_API_KEY is missing; using MockAIProvider.",
                extra={"feature": "ai_provider"},
            )
            return MockAIProvider()

        if configured_provider is AIProviderName.GEMINI:
            if settings.gemini_api_key:
                return GeminiProvider()
            logger.warning(
                "GEMINI provider selected but GEMINI_API_KEY is missing; using MockAIProvider.",
                extra={"feature": "ai_provider"},
            )
            return MockAIProvider()

        return MockAIProvider()

    @staticmethod
    def _configured_provider() -> AIProviderName:
        provider_name = settings.ai_provider.upper()
        try:
            return AIProviderName(provider_name)
        except ValueError:
            logger.warning(
                "Unsupported AI_PROVIDER configured; using MockAIProvider.",
                extra={"feature": "ai_provider", "ai_provider": provider_name},
            )
            return AIProviderName.MOCK


class ConfigurableAIProvider:
    """Backward-compatible provider facade used by existing route dependency wiring."""

    def __init__(self, provider: AIProvider | None = None) -> None:
        self.provider = provider or AIProviderFactory.create()

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionData:
        """Delegate product description generation to the selected provider."""
        return self.provider.generate_product_description(payload=payload)


AIProviderProtocol = AIProvider
