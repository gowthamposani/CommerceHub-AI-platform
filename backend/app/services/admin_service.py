"""Service layer for Admin dashboard operations."""

from __future__ import annotations

import logging
from typing import Protocol

from backend.app.schemas.admin_schema import AdminDashboardResponse


logger = logging.getLogger(__name__)


class AdminServiceError(RuntimeError):
    """Raised when an Admin service operation fails."""


class AdminRepositoryProtocol(Protocol):
    """Repository contract required by the Admin service layer."""

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return dashboard summary data."""


class TransactionManagerProtocol(Protocol):
    """Transaction boundary owned by the service layer."""

    def commit(self) -> None:
        """Commit the active unit of work."""

    def rollback(self) -> None:
        """Rollback the active unit of work."""


class SQLAlchemyTransactionManager:
    """SQLAlchemy transaction manager for service-level unit of work control."""

    def __init__(self, session: object) -> None:
        self.session = session

    def commit(self) -> None:
        """Commit the current SQLAlchemy transaction."""
        commit = getattr(self.session, "commit")
        commit()

    def rollback(self) -> None:
        """Rollback the current SQLAlchemy transaction."""
        rollback = getattr(self.session, "rollback")
        rollback()


class AdminService:
    """Coordinates Admin dashboard use cases."""

    def __init__(
        self,
        repository: AdminRepositoryProtocol,
        transaction_manager: TransactionManagerProtocol,
    ) -> None:
        self.repository = repository
        self.transaction_manager = transaction_manager

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return dashboard summary metrics for administrators."""
        try:
            logger.info("Retrieving Admin dashboard summary.")
            dashboard_summary = self.repository.get_dashboard_summary()
            self.transaction_manager.commit()
            return dashboard_summary
        except Exception as exc:
            self.transaction_manager.rollback()
            logger.exception("Failed to retrieve Admin dashboard summary.")
            raise AdminServiceError("Unable to retrieve Admin dashboard summary.") from exc
