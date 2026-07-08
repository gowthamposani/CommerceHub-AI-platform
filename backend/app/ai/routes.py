"""FastAPI routes for AI product description generation."""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from .prompts import ProductDescriptionPromptBuilder
from .provider import GeminiProvider
from .schemas import ProductDescriptionRequest, ProductDescriptionResponse
from .service import AIService, AIServiceError


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Product Description Generator"],
)


def get_gemini_provider() -> GeminiProvider:
    """Resolve Gemini provider dependency."""
    return GeminiProvider()


def get_product_description_prompt_builder() -> ProductDescriptionPromptBuilder:
    """Resolve product description prompt builder dependency."""
    return ProductDescriptionPromptBuilder()


def get_ai_service(
    provider: Annotated[GeminiProvider, Depends(get_gemini_provider)],
    prompt_builder: Annotated[
        ProductDescriptionPromptBuilder,
        Depends(get_product_description_prompt_builder),
    ],
) -> AIService:
    """Resolve AI service dependency."""
    return AIService(provider=provider, prompt_builder=prompt_builder)


@router.post(
    "/product-description",
    response_model=ProductDescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate AI product description",
    description=(
        "Generates a professional product description, SEO title, meta description, "
        "keywords, and highlights using Google Gemini."
    ),
    responses={
        status.HTTP_200_OK: {"description": "Product content generated successfully."},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid generation request."},
        status.HTTP_502_BAD_GATEWAY: {"description": "Gemini generation failed."},
    },
)
def generate_product_description(
    payload: ProductDescriptionRequest,
    ai_service: Annotated[AIService, Depends(get_ai_service)],
) -> ProductDescriptionResponse:
    """Generate product merchandising content from structured product metadata."""
    try:
        logger.info("Received AI product description request.")
        return ai_service.generate_product_description(payload=payload)
    except AIServiceError as exc:
        logger.exception("AI product description endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate product description.",
        ) from exc
