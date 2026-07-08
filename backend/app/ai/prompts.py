"""Prompt builder for AI product description generation."""

from __future__ import annotations

import json

from .schemas import ProductDescriptionRequest


class ProductDescriptionPromptBuilder:
    """Builds structured Gemini prompts for product description generation."""

    def build(self, payload: ProductDescriptionRequest) -> str:
        """Create a deterministic prompt for product merchandising content."""
        prompt_payload = {
            "product": {
                "name": payload.product_name,
                "brand": payload.brand,
                "category": payload.category,
                "features": payload.features,
                "specifications": payload.specifications,
            },
            "instructions": {
                "audience": "enterprise multi-vendor e-commerce shoppers",
                "tone": "professional, clear, premium, conversion-focused",
                "description_requirements": [
                    "Write one polished product description between 120 and 220 words.",
                    "Mention brand, category, major features, and meaningful specifications.",
                    "Avoid unsupported claims, medical claims, guarantees, and exaggerated language.",
                ],
                "seo_requirements": [
                    "Create one SEO title with 10 to 70 characters.",
                    "Create one meta description with 50 to 160 characters.",
                    "Create 5 to 10 useful search keywords.",
                    "Create 3 to 6 short merchandising highlights.",
                ],
                "response_format": {
                    "generated_description": "string",
                    "generated_keywords": ["string"],
                    "seo_title": "string",
                    "meta_description": "string",
                    "highlights": ["string"],
                },
            },
        }

        return (
            "You are CommerceHub AI, an enterprise e-commerce merchandising assistant. "
            "Generate product content using only the data provided. "
            "Return valid JSON only. Do not include markdown, code fences, or commentary.\n\n"
            f"{json.dumps(prompt_payload, ensure_ascii=False, indent=2)}"
        )
