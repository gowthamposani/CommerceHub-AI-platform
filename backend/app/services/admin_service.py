"""Service layer for Admin dashboard, analytics, and user management operations."""

from __future__ import annotations

import logging
from typing import Protocol

from backend.app.schemas.admin_schema import (
    AdminAnalyticsData,
    AdminAnalyticsResponse,
    AdminDashboardData,
    AdminDashboardResponse,
    AdminUserData,
    AdminUserResponse,
    AdminUsersResponse,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
)


logger = logging.getLogger(__name__)


class AdminServiceError(RuntimeError):
    """Raised when an Admin service operation fails."""


class AdminRepositoryProtocol(Protocol):
    """Repository contract required by the Admin service layer."""

    def get_dashboard_summary(self) -> AdminDashboardData:
        """Return dashboard summary data."""

    def get_analytics_summary(self) -> AdminAnalyticsData:
        """Return analytics summary data."""

    def get_users(self) -> list[AdminUserData]:
        """Return users visible to administrators."""

    def get_user_by_id(self, user_id: int) -> AdminUserData:
        """Return a user by identifier."""

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserData:
        """Update a user's status."""

    def update_user_role(
        self,
        user_id: int,
        payload: UpdateUserRoleRequest,
    ) -> AdminUserData:
        """Update a user's role."""


class AdminService:
    """Coordinates Admin dashboard use cases."""

    def __init__(self, repository: AdminRepositoryProtocol) -> None:
        self.repository = repository

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return dashboard summary metrics in the standard API envelope."""
        try:
            logger.info(
                "Retrieving Admin dashboard summary.",
                extra={"feature": "admin_dashboard"},
            )
            dashboard_data = self.repository.get_dashboard_summary()
            return AdminDashboardResponse(
                success=True,
                message="Dashboard retrieved successfully",
                data=dashboard_data,
            )
        except Exception as exc:
            logger.exception(
                "Failed to retrieve Admin dashboard summary.",
                extra={"feature": "admin_dashboard"},
            )
            raise AdminServiceError("Unable to retrieve Admin dashboard summary.") from exc

    def get_analytics_summary(self) -> AdminAnalyticsResponse:
        """Return analytics summary metrics in the standard API envelope."""
        try:
            logger.info(
                "Retrieving Admin analytics summary.",
                extra={"feature": "admin_analytics"},
            )
            analytics_data = self.repository.get_analytics_summary()
            return AdminAnalyticsResponse(
                success=True,
                message="Analytics retrieved successfully",
                data=analytics_data,
            )
        except Exception as exc:
            logger.exception(
                "Failed to retrieve Admin analytics summary.",
                extra={"feature": "admin_analytics"},
            )
            raise AdminServiceError("Unable to retrieve Admin analytics summary.") from exc

    def get_users(self) -> AdminUsersResponse:
        """Return users visible to administrators."""
        try:
            logger.info("Retrieving Admin users.", extra={"feature": "admin_users"})
            users = self.repository.get_users()
            return AdminUsersResponse(
                success=True,
                message="Users retrieved successfully",
                data=users,
            )
        except Exception as exc:
            logger.exception("Failed to retrieve Admin users.", extra={"feature": "admin_users"})
            raise AdminServiceError("Unable to retrieve Admin users.") from exc

    def get_user_by_id(self, user_id: int) -> AdminUserResponse:
        """Return one user by identifier."""
        try:
            logger.info(
                "Retrieving Admin user.",
                extra={"feature": "admin_users", "user_id": user_id},
            )
            user = self.repository.get_user_by_id(user_id=user_id)
            return AdminUserResponse(
                success=True,
                message="User retrieved successfully",
                data=user,
            )
        except Exception as exc:
            logger.exception(
                "Failed to retrieve Admin user.",
                extra={"feature": "admin_users", "user_id": user_id},
            )
            raise AdminServiceError("Unable to retrieve Admin user.") from exc

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Update a user's status through the repository boundary."""
        try:
            logger.info(
                "Updating Admin user status.",
                extra={
                    "feature": "admin_users",
                    "user_id": user_id,
                    "status": payload.status.value,
                },
            )
            user = self.repository.update_user_status(user_id=user_id, status=payload.status)
            return AdminUserResponse(
                success=True,
                message="User status updated successfully",
                data=user,
            )
        except Exception as exc:
            logger.exception(
                "Failed to update Admin user status.",
                extra={"feature": "admin_users", "user_id": user_id},
            )
            raise AdminServiceError("Unable to update Admin user status.") from exc

    def update_user_role(
        self,
        user_id: int,
        payload: UpdateUserRoleRequest,
    ) -> AdminUserResponse:
        """Update a user's role through the repository boundary."""
        try:
            logger.info(
                "Updating Admin user role.",
                extra={
                    "feature": "admin_users",
                    "user_id": user_id,
                    "role": payload.role.value,
                },
            )
            user = self.repository.update_user_role(user_id=user_id, role=payload.role)
            return AdminUserResponse(
                success=True,
                message="User role updated successfully",
                data=user,
            )
        except Exception as exc:
            logger.exception(
                "Failed to update Admin user role.",
                extra={"feature": "admin_users", "user_id": user_id},
            )
            raise AdminServiceError("Unable to update Admin user role.") from exc
