"""Pydantic schemas for Admin dashboard contracts."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class AdminSchema(BaseModel):
    """Base schema configuration for Admin API contracts."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class AdminDashboardRequest(AdminSchema):
    """Request schema placeholder for Admin dashboard retrieval."""


class AdminDashboardData(AdminSchema):
    """Dashboard metrics returned inside the standard API response envelope."""

    total_users: Annotated[
        int,
        Field(ge=0, description="Total number of registered platform users."),
    ]
    total_customers: Annotated[
        int,
        Field(ge=0, description="Total number of registered customer accounts."),
    ]
    total_sellers: Annotated[
        int,
        Field(ge=0, description="Total number of registered seller accounts."),
    ]
    total_products: Annotated[
        int,
        Field(ge=0, description="Total number of products listed on the platform."),
    ]
    total_orders: Annotated[
        int,
        Field(ge=0, description="Total number of orders placed on the platform."),
    ]
    pending_seller_requests: Annotated[
        int,
        Field(ge=0, description="Seller onboarding requests pending review."),
    ]
    revenue: Annotated[
        Decimal,
        Field(ge=0, description="Total platform revenue for the reporting scope."),
    ]
    generated_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the dashboard summary was generated."),
    ]

    @field_serializer("revenue")
    def serialize_revenue(self, revenue: Decimal) -> int | float:
        """Serialize revenue as a JSON number for the API contract."""
        if revenue == revenue.to_integral_value():
            return int(revenue)
        return float(revenue)


class AdminDashboardResponse(AdminSchema):
    """Standard API response envelope for the Admin dashboard endpoint."""

    success: Annotated[
        bool,
        Field(description="Indicates whether the request completed successfully."),
    ] = True
    message: Annotated[
        str,
        Field(description="Human-readable response message."),
    ] = "Dashboard retrieved successfully"
    data: Annotated[
        AdminDashboardData,
        Field(description="Admin dashboard metrics."),
    ]
