"""Service layer for Admin dashboard and analytics operations."""

from __future__ import annotations

import logging
from typing import Protocol

from backend.app.schemas.admin_schema import (
    AdminAnalyticsData,
    AdminAnalyticsResponse,
    AdminDashboardData,
    AdminDashboardResponse,
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
