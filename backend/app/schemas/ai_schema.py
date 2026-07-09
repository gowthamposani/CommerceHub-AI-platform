"""Pydantic schemas for AI product description generation."""

from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AISchema(BaseModel):
    """Base schema configuration for AI API contracts."""

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )


class ProductDescriptionRequest(AISchema):
    """Request schema for AI product description generation."""

    product_name: Annotated[
        str,
        Field(min_length=1, max_length=150, description="Product display name."),
    ]
    brand: Annotated[
        str,
        Field(min_length=1, max_length=100, description="Product brand name."),
    ]
    category: Annotated[
        str,
        Field(min_length=1, max_length=100, description="Product category name."),
    ]
    specifications: Annotated[
        list[str],
        Field(
            default_factory=list,
            description="Product specifications or key selling attributes.",
        ),
    ]

    @field_validator("specifications")
    @classmethod
    def normalize_specifications(cls, specifications: list[str]) -> list[str]:
        """Normalize specifications and remove empty values."""
        return [item.strip() for item in specifications if item.strip()]


class ProductDescriptionData(AISchema):
    """Generated product merchandising content."""

    title: Annotated[
        str,
        Field(description="Generated product title."),
    ]
    description: Annotated[
        str,
        Field(description="Generated product description."),
    ]
    seo_title: Annotated[
        str,
        Field(description="Generated SEO title."),
    ]
    seo_description: Annotated[
        str,
        Field(description="Generated SEO meta description."),
    ]
    highlights: Annotated[
        list[str],
        Field(description="Generated product highlights."),
    ]
    keywords: Annotated[
        list[str],
        Field(description="Generated SEO keywords."),
    ]


class ProductDescriptionResponse(AISchema):
    """Standard API response envelope for product description generation."""

    success: Annotated[
        bool,
        Field(description="Indicates whether the request completed successfully."),
    ] = True
    message: Annotated[
        str,
        Field(description="Human-readable response message."),
    ] = "Description generated successfully"
    data: Annotated[
        ProductDescriptionData,
        Field(description="Generated product description content."),
    ]
