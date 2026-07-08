"""Pydantic schemas for AI product description generation."""

from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AISchema(BaseModel):
    """Base schema configuration for AI API contracts."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class ProductDescriptionRequest(AISchema):
    product_name: Annotated[
        str,
        Field(
            min_length=2,
            max_length=150,
            description="Product name used for AI content generation.",
            examples=["Wireless Noise Cancelling Headphones"],
        ),
    ]
    brand: Annotated[
        str,
        Field(
            min_length=1,
            max_length=100,
            description="Brand name associated with the product.",
            examples=["SoundMax"],
        ),
    ]
    category: Annotated[
        str,
        Field(
            min_length=2,
            max_length=100,
            description="Catalog category for generation context.",
            examples=["Electronics"],
        ),
    ]
    features: Annotated[
        list[str],
        Field(
            min_length=1,
            max_length=20,
            description="Product features to include in the generated content.",
            examples=[["Bluetooth 5.3", "40-hour battery life", "Active noise cancellation"]],
        ),
    ]
    specifications: Annotated[
        dict[str, str],
        Field(
            min_length=1,
            description="Structured product specifications as key-value pairs.",
            examples=[{"Battery Life": "40 hours", "Connectivity": "Bluetooth 5.3"}],
        ),
    ]

    @field_validator("features")
    @classmethod
    def validate_features(cls, value: list[str]) -> list[str]:
        normalized_features = [feature.strip() for feature in value if feature.strip()]
        if not normalized_features:
            raise ValueError("At least one feature is required.")
        if any(len(feature) > 120 for feature in normalized_features):
            raise ValueError("Each feature must be 120 characters or fewer.")
        return normalized_features

    @field_validator("specifications")
    @classmethod
    def validate_specifications(cls, value: dict[str, str]) -> dict[str, str]:
        normalized_specifications = {
            key.strip(): specification.strip()
            for key, specification in value.items()
            if key.strip() and specification.strip()
        }
        if not normalized_specifications:
            raise ValueError("At least one specification is required.")
        if any(len(key) > 80 for key in normalized_specifications):
            raise ValueError("Specification names must be 80 characters or fewer.")
        if any(len(specification) > 200 for specification in normalized_specifications.values()):
            raise ValueError("Specification values must be 200 characters or fewer.")
        return normalized_specifications


class ProductDescriptionResponse(AISchema):
    generated_description: Annotated[
        str,
        Field(
            min_length=80,
            max_length=5000,
            description="Professional AI-generated product description.",
        ),
    ]
    generated_keywords: Annotated[
        list[str],
        Field(
            min_length=3,
            max_length=12,
            description="SEO and marketplace discovery keywords.",
        ),
    ]
    seo_title: Annotated[
        str,
        Field(
            min_length=10,
            max_length=70,
            description="SEO-optimized product page title.",
        ),
    ]
    meta_description: Annotated[
        str,
        Field(
            min_length=50,
            max_length=160,
            description="SEO meta description for product discovery.",
        ),
    ]
    highlights: Annotated[
        list[str],
        Field(
            min_length=3,
            max_length=8,
            description="Short product highlights for merchandising surfaces.",
        ),
    ]
