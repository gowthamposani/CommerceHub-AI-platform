"""FastAPI routes for Admin dashboard, analytics, and user management operations."""

from __future__ import annotations

import logging
from typing import Annotated, Protocol

from backend.app.repositories.admin_repository import AdminRepository
from backend.app.schemas.admin_schema import (
    AdminAnalyticsResponse,
    AdminDashboardResponse,
    AdminUserResponse,
    AdminUsersResponse,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
)
from backend.app.services.admin_service import AdminService, AdminServiceError
from fastapi import APIRouter, Depends, HTTPException, Path, status

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Dashboard"])


class AdminServiceProtocol(Protocol):
    """Service contract consumed by Admin routes."""

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return dashboard summary response."""

    def get_analytics_summary(self) -> AdminAnalyticsResponse:
        """Return analytics summary response."""

    def get_users(self) -> AdminUsersResponse:
        """Return users visible to administrators."""

    def get_user_by_id(self, user_id: int) -> AdminUserResponse:
        """Return a user by identifier."""

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Update a user's status."""

    def update_user_role(
        self,
        user_id: int,
        payload: UpdateUserRoleRequest,
    ) -> AdminUserResponse:
        """Update a user's role."""


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
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Dashboard summary could not be retrieved."},
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
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Analytics summary could not be retrieved."},
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


@router.get(
    "/users",
    response_model=AdminUsersResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Admin users",
    description=("Returns placeholder users until Developer 1 User module integration is available."),
    responses={
        status.HTTP_200_OK: {"description": "Users retrieved successfully."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Users could not be retrieved."},
    },
)
def get_admin_users(
    admin_service: AdminServiceDependency,
) -> AdminUsersResponse:
    """Return placeholder users visible to administrators."""
    try:
        logger.info("Received Admin users request.")
        return admin_service.get_users()
    except AdminServiceError as exc:
        logger.exception("Admin users endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve Admin users.",
        ) from exc


@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Admin user by ID",
    description=("Returns a placeholder user by identifier until Developer 1 User module integration is available."),
    responses={
        status.HTTP_200_OK: {"description": "User retrieved successfully."},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid user identifier."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "User could not be retrieved."},
    },
)
def get_admin_user_by_id(
    admin_service: AdminServiceDependency,
    user_id: int = Path(gt=0, description="Unique user identifier."),
) -> AdminUserResponse:
    """Return one placeholder user by identifier."""
    try:
        logger.info("Received Admin user detail request.", extra={"user_id": user_id})
        return admin_service.get_user_by_id(user_id=user_id)
    except AdminServiceError as exc:
        logger.exception("Admin user detail endpoint failed.", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve Admin user.",
        ) from exc


@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Admin user status",
    description=("Updates placeholder user status until Developer 1 User module integration is available."),
    responses={
        status.HTTP_200_OK: {"description": "User status updated successfully."},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid update request."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "User status could not be updated."},
    },
)
def update_admin_user_status(
    payload: UpdateUserStatusRequest,
    admin_service: AdminServiceDependency,
    user_id: int = Path(gt=0, description="Unique user identifier."),
) -> AdminUserResponse:
    """Update one placeholder user's status."""
    try:
        logger.info("Received Admin user status update request.", extra={"user_id": user_id})
        return admin_service.update_user_status(user_id=user_id, payload=payload)
    except AdminServiceError as exc:
        logger.exception("Admin user status endpoint failed.", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update Admin user status.",
        ) from exc


@router.patch(
    "/users/{user_id}/role",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Admin user role",
    description=("Updates placeholder user role until Developer 1 User module integration is available."),
    responses={
        status.HTTP_200_OK: {"description": "User role updated successfully."},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid update request."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "User role could not be updated."},
    },
)
def update_admin_user_role(
    payload: UpdateUserRoleRequest,
    admin_service: AdminServiceDependency,
    user_id: int = Path(gt=0, description="Unique user identifier."),
) -> AdminUserResponse:
    """Update one placeholder user's role."""
    try:
        logger.info("Received Admin user role update request.", extra={"user_id": user_id})
        return admin_service.update_user_role(user_id=user_id, payload=payload)
    except AdminServiceError as exc:
        logger.exception("Admin user role endpoint failed.", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update Admin user role.",
        ) from exc
