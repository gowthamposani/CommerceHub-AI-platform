"""Service layer for AI product description generation."""

from __future__ import annotations

import logging
from typing import Protocol

from .prompts import ProductDescriptionPromptBuilder
from .schemas import ProductDescriptionRequest, ProductDescriptionResponse


logger = logging.getLogger(__name__)


class AIServiceError(RuntimeError):
    """Raised when AI product description generation fails."""


class ProductDescriptionProviderProtocol(Protocol):
    """Provider dependency required by AIService."""

    def generate_product_description(self, prompt: str) -> ProductDescriptionResponse:
        """Generate product description content from a structured prompt."""


class AIService:
    """Coordinates validation, prompt generation, and Gemini provider execution."""

    def __init__(
        self,
        provider: ProductDescriptionProviderProtocol,
        prompt_builder: ProductDescriptionPromptBuilder | None = None,
    ) -> None:
        self.provider = provider
        self.prompt_builder = prompt_builder or ProductDescriptionPromptBuilder()

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionResponse:
        """Generate formatted product merchandising content."""
        try:
            validated_payload = ProductDescriptionRequest.model_validate(payload)
            logger.info(
                "Generating AI product description.",
                extra={
                    "product_name": validated_payload.product_name,
                    "brand": validated_payload.brand,
                    "category": validated_payload.category,
                },
            )
            prompt = self.prompt_builder.build(payload=validated_payload)
            return self.provider.generate_product_description(prompt=prompt)
        except Exception as exc:
            logger.exception(
                "AI product description generation failed.",
                extra={
                    "product_name": getattr(payload, "product_name", None),
                    "category": getattr(payload, "category", None),
                },
            )
            raise AIServiceError("Unable to generate product description.") from exc
