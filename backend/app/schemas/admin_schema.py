"""Pydantic schemas for Admin dashboard contracts."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class AdminSchema(BaseModel):
    """Base schema configuration for Admin API contracts."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class AdminDashboardResponse(AdminSchema):
    """Response schema for the Admin dashboard summary endpoint."""

    total_users: Annotated[
        int,
        Field(
            ge=0,
            description="Total number of registered platform users.",
            examples=[12500],
        ),
    ]
    total_customers: Annotated[
        int,
        Field(
            ge=0,
            description="Total number of registered customer accounts.",
            examples=[10450],
        ),
    ]
    total_sellers: Annotated[
        int,
        Field(
            ge=0,
            description="Total number of registered seller accounts.",
            examples=[2050],
        ),
    ]
    total_products: Annotated[
        int,
        Field(
            ge=0,
            description="Total number of products listed on the platform.",
            examples=[84230],
        ),
    ]
    total_orders: Annotated[
        int,
        Field(
            ge=0,
            description="Total number of orders placed on the platform.",
            examples=[318900],
        ),
    ]
    pending_seller_requests: Annotated[
        int,
        Field(
            ge=0,
            description="Seller onboarding requests pending administrative review.",
            examples=[37],
        ),
    ]
    revenue: Annotated[
        Decimal,
        Field(
            ge=0,
            description="Total platform revenue for the dashboard reporting scope.",
            examples=["2599999.50"],
        ),
    ]
    generated_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the dashboard summary was generated."),
    ]
