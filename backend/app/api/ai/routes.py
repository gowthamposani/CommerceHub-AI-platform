"""FastAPI routes for AI product description generation."""

from __future__ import annotations

import logging
from typing import Annotated, Protocol

from backend.app.schemas.ai_schema import (
    ProductDescriptionRequest,
    ProductDescriptionResponse,
)
from backend.app.services.ai_service import AIService, AIServiceError
from backend.app.utils.ai_provider import ConfigurableAIProvider
from fastapi import APIRouter, Depends, HTTPException, status

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["AI Product Description"])


class AIServiceProtocol(Protocol):
    """Service contract consumed by AI routes."""

    def generate_product_description(
        self,
        payload: ProductDescriptionRequest,
    ) -> ProductDescriptionResponse:
        """Generate product description content."""


def get_ai_provider() -> ConfigurableAIProvider:
    """Resolve the AI provider dependency."""
    return ConfigurableAIProvider()


def get_ai_service(
    provider: Annotated[ConfigurableAIProvider, Depends(get_ai_provider)],
) -> AIServiceProtocol:
    """Resolve the AI service dependency."""
    return AIService(provider=provider)


AIServiceDependency = Annotated[AIServiceProtocol, Depends(get_ai_service)]


@router.post(
    "/product-description",
    response_model=ProductDescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate AI product description",
    description=(
        "Generates product title, description, SEO metadata, highlights, and keywords. "
        "Returns deterministic mock content when no AI provider API key is configured."
    ),
    responses={
        status.HTTP_200_OK: {"description": "Description generated successfully."},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid generation request."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Product description generation failed."},
    },
)
def generate_product_description(
    payload: ProductDescriptionRequest,
    ai_service: AIServiceDependency,
) -> ProductDescriptionResponse:
    """Generate marketplace-ready product description content."""
    try:
        logger.info("Received AI product description request.")
        return ai_service.generate_product_description(payload=payload)
    except AIServiceError as exc:
        logger.exception("AI product description endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate product description.",
        ) from exc
