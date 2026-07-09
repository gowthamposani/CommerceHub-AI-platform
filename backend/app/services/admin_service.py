"""Service layer for Admin dashboard operations."""

from __future__ import annotations

import logging
from typing import Protocol

from backend.app.schemas.admin_schema import AdminDashboardData, AdminDashboardResponse


logger = logging.getLogger(__name__)


class AdminServiceError(RuntimeError):
    """Raised when an Admin service operation fails."""


class AdminRepositoryProtocol(Protocol):
    """Repository contract required by the Admin service layer."""

    def get_dashboard_summary(self) -> AdminDashboardData:
        """Return dashboard summary data."""


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
