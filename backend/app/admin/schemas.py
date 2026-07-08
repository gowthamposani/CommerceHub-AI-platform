"""Pydantic schemas for the Admin module."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserStatus(StrEnum):
    """Supported administrative user account states."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    BLOCKED = "BLOCKED"


class AdminSchema(BaseModel):
    """Base schema configuration for Admin API contracts."""

    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class DashboardSummaryResponse(AdminSchema):
    total_users: Annotated[
        int,
        Field(ge=0, description="Total number of registered platform users.", examples=[12500]),
    ]
    total_customers: Annotated[
        int,
        Field(ge=0, description="Total number of registered customer accounts.", examples=[10450]),
    ]
    total_sellers: Annotated[
        int,
        Field(ge=0, description="Total number of registered seller accounts.", examples=[2050]),
    ]
    total_products: Annotated[
        int,
        Field(ge=0, description="Total number of products listed on the platform.", examples=[84230]),
    ]
    total_orders: Annotated[
        int,
        Field(ge=0, description="Total number of orders placed on the platform.", examples=[318900]),
    ]
    pending_seller_requests: Annotated[
        int,
        Field(ge=0, description="Number of seller onboarding requests awaiting review.", examples=[37]),
    ]
    active_users: Annotated[
        int,
        Field(ge=0, description="Number of currently active platform users.", examples=[9870]),
    ]
    revenue: Annotated[
        Decimal,
        Field(ge=0, description="Total platform revenue for the dashboard reporting scope.", examples=["2599999.50"]),
    ]
    generated_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the dashboard summary was generated."),
    ]


class AdminUserResponse(AdminSchema):
    id: Annotated[
        int,
        Field(gt=0, description="Unique user identifier.", examples=[1001]),
    ]
    full_name: Annotated[
        str,
        Field(min_length=1, max_length=150, description="User full name.", examples=["Ananya Sharma"]),
    ]
    email: Annotated[
        EmailStr,
        Field(description="User email address.", examples=["ananya.sharma@example.com"]),
    ]
    role: Annotated[
        str,
        Field(min_length=1, max_length=50, description="Assigned platform role.", examples=["SELLER"]),
    ]
    status: Annotated[
        UserStatus,
        Field(description="Current administrative account status.", examples=[UserStatus.ACTIVE]),
    ]
    created_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the user account was created."),
    ]


class UpdateUserStatusRequest(AdminSchema):
    status: Annotated[
        UserStatus,
        Field(description="New account status to apply to the user.", examples=[UserStatus.BLOCKED]),
    ]


class CategoryResponse(AdminSchema):
    id: Annotated[
        int,
        Field(gt=0, description="Unique category identifier.", examples=[12]),
    ]
    name: Annotated[
        str,
        Field(min_length=1, max_length=100, description="Category display name.", examples=["Electronics"]),
    ]
    description: Annotated[
        str | None,
        Field(max_length=500, description="Category description.", examples=["Electronic devices and accessories."]),
    ] = None
    is_active: Annotated[
        bool,
        Field(description="Indicates whether the category is active.", examples=[True]),
    ]
    created_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the category was created."),
    ]


class CreateCategoryRequest(AdminSchema):
    name: Annotated[
        str,
        Field(min_length=1, max_length=100, description="Category display name.", examples=["Home Appliances"]),
    ]
    description: Annotated[
        str | None,
        Field(max_length=500, description="Category description.", examples=["Appliances for home and kitchen use."]),
    ] = None


class UpdateCategoryRequest(AdminSchema):
    name: Annotated[
        str | None,
        Field(min_length=1, max_length=100, description="Updated category display name.", examples=["Consumer Electronics"]),
    ] = None
    description: Annotated[
        str | None,
        Field(max_length=500, description="Updated category description.", examples=["Devices, gadgets, and accessories."]),
    ] = None
    is_active: Annotated[
        bool | None,
        Field(description="Updated category active state.", examples=[True]),
    ] = None


class AnalyticsResponse(AdminSchema):
    monthly_revenue: Annotated[
        Decimal,
        Field(ge=0, description="Revenue generated during the current month.", examples=["425000.75"]),
    ]
    monthly_orders: Annotated[
        int,
        Field(ge=0, description="Number of orders placed during the current month.", examples=[18420]),
    ]
    total_customers: Annotated[
        int,
        Field(ge=0, description="Total number of customer accounts.", examples=[10450]),
    ]
    total_sellers: Annotated[
        int,
        Field(ge=0, description="Total number of seller accounts.", examples=[2050]),
    ]
    top_categories: Annotated[
        list[str],
        Field(description="Top-performing category names.", examples=[["Electronics", "Fashion", "Home Appliances"]]),
    ]
    top_products: Annotated[
        list[str],
        Field(description="Top-performing product names.", examples=[["Wireless Headphones", "Running Shoes"]]),
    ]
