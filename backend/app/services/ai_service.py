"""Service layer for AI product description generation."""

from __future__ import annotations

import logging

from backend.app.schemas.ai_schema import ProductDescriptionRequest, ProductDescriptionResponse
from backend.app.utils.ai_provider import AIProvider

logger = logging.getLogger(__name__)


class AIServiceError(RuntimeError):
    """Raised when AI product description generation fails."""


class AIService:
    """Coordinates AI product description use cases."""

    def __init__(self, provider: AIProvider) -> None:
        self.provider = provider

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionResponse:
        """Generate product description content in the standard API envelope."""
        try:
            logger.info(
                "Generating AI product description.",
                extra={
                    "feature": "ai_product_description",
                    "category": payload.category,
                    "brand": payload.brand,
                },
            )
            generated_content = self.provider.generate_product_description(payload=payload)
            return ProductDescriptionResponse(
                success=True,
                message="Description generated successfully",
                data=generated_content,
            )
        except Exception as exc:
            logger.exception(
                "Failed to generate AI product description.",
                extra={"feature": "ai_product_description"},
            )
            raise AIServiceError("Unable to generate product description.") from exc
