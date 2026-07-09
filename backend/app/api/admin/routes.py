"""FastAPI routes for Admin dashboard and analytics operations."""

from __future__ import annotations

import logging
from typing import Annotated, Protocol

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.repositories.admin_repository import AdminRepository
from backend.app.schemas.admin_schema import AdminAnalyticsResponse, AdminDashboardResponse
from backend.app.services.admin_service import AdminService, AdminServiceError


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Dashboard"])


class AdminServiceProtocol(Protocol):
    """Service contract consumed by Admin routes."""

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return dashboard summary response."""

    def get_analytics_summary(self) -> AdminAnalyticsResponse:
        """Return analytics summary response."""


def get_admin_repository() -> AdminRepository:
    """Resolve the Admin repository dependency."""
    return AdminRepository()


def get_admin_service(
    repository: Annotated[AdminRepository, Depends(get_admin_repository)],
) -> AdminServiceProtocol:
    """Resolve the Admin service dependency."""
    return AdminService(repository=repository)


AdminServiceDependency = Annotated[AdminServiceProtocol, Depends(get_admin_service)]


@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Admin dashboard summary",
    description=(
        "Returns the Sprint 1 Admin dashboard response envelope with placeholder "
        "marketplace metrics until User, Seller, Product, and Order integrations land."
    ),
    responses={
        status.HTTP_200_OK: {"description": "Dashboard retrieved successfully."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Dashboard summary could not be retrieved."
        },
    },
)
def get_admin_dashboard(
    admin_service: AdminServiceDependency,
) -> AdminDashboardResponse:
    """Return aggregate placeholder metrics for the Admin dashboard."""
    try:
        logger.info("Received Admin dashboard summary request.")
        return admin_service.get_dashboard_summary()
    except AdminServiceError as exc:
        logger.exception("Admin dashboard summary endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve Admin dashboard summary.",
        ) from exc


@router.get(
    "/analytics",
    response_model=AdminAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Admin analytics summary",
    description=(
        "Returns the Sprint 1 Admin analytics response envelope with placeholder "
        "metrics until Orders, Products, Inventory, and Users integrations land."
    ),
    responses={
        status.HTTP_200_OK: {"description": "Analytics retrieved successfully."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Analytics summary could not be retrieved."
        },
    },
)
def get_admin_analytics(
    admin_service: AdminServiceDependency,
) -> AdminAnalyticsResponse:
    """Return placeholder metrics for Admin analytics."""
    try:
        logger.info("Received Admin analytics summary request.")
        return admin_service.get_analytics_summary()
    except AdminServiceError as exc:
        logger.exception("Admin analytics summary endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve Admin analytics summary.",
        ) from exc
