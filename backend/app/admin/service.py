"""Service layer for Admin operations."""

from __future__ import annotations

import logging
from typing import Protocol

from .schemas import (
    AdminUserResponse,
    AnalyticsResponse,
    CategoryResponse,
    CreateCategoryRequest,
    DashboardSummaryResponse,
    UpdateCategoryRequest,
    UpdateUserStatusRequest,
)


logger = logging.getLogger(__name__)


class AdminServiceError(RuntimeError):
    """Raised when an Admin service operation fails."""


class AdminRepositoryProtocol(Protocol):
    """Repository contract required by the Admin service layer."""

    def get_dashboard(self) -> DashboardSummaryResponse:
        """Return dashboard summary data."""

    def get_users(self) -> list[AdminUserResponse]:
        """Return admin-visible users."""

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Persist a user status change."""

    def get_categories(self) -> list[CategoryResponse]:
        """Return product categories."""

    def create_category(self, payload: CreateCategoryRequest) -> CategoryResponse:
        """Persist a new product category."""

    def update_category(
        self,
        category_id: int,
        payload: UpdateCategoryRequest,
    ) -> CategoryResponse:
        """Persist category updates."""

    def delete_category(self, category_id: int) -> None:
        """Delete a product category."""

    def get_analytics(self) -> AnalyticsResponse:
        """Return platform analytics."""


class TransactionManagerProtocol(Protocol):
    """Transaction boundary owned by the service layer."""

    def commit(self) -> None:
        """Commit the current unit of work."""

    def rollback(self) -> None:
        """Rollback the current unit of work."""


class NoOpTransactionManager:
    """Transaction manager used when a caller supplies an already-managed unit of work."""

    def commit(self) -> None:
        """No-op commit for tests and externally managed transactions."""

    def rollback(self) -> None:
        """No-op rollback for tests and externally managed transactions."""


class SQLAlchemyTransactionManager:
    """SQLAlchemy transaction boundary for Admin write operations."""

    def __init__(self, session: object) -> None:
        self.session = session

    def commit(self) -> None:
        """Commit the active SQLAlchemy transaction."""
        commit = getattr(self.session, "commit")
        commit()

    def rollback(self) -> None:
        """Rollback the active SQLAlchemy transaction."""
        rollback = getattr(self.session, "rollback")
        rollback()


class DashboardOperations:
    """Coordinates administrative dashboard use cases."""

    def __init__(self, repository: AdminRepositoryProtocol) -> None:
        self.repository = repository

    def get_dashboard(self) -> DashboardSummaryResponse:
        """Return the administrative dashboard summary."""
        try:
            logger.info("Retrieving admin dashboard summary.")
            return self.repository.get_dashboard()
        except Exception as exc:
            logger.exception("Failed to retrieve admin dashboard summary.")
            raise AdminServiceError("Unable to retrieve admin dashboard summary.") from exc


class UserManagementOperations:
    """Coordinates administrative user management use cases."""

    def __init__(
        self,
        repository: AdminRepositoryProtocol,
        transaction_manager: TransactionManagerProtocol,
    ) -> None:
        self.repository = repository
        self.transaction_manager = transaction_manager

    def get_users(self) -> list[AdminUserResponse]:
        """Return users available to the admin module."""
        try:
            logger.info("Retrieving admin users.")
            return self.repository.get_users()
        except Exception as exc:
            logger.exception("Failed to retrieve admin users.")
            raise AdminServiceError("Unable to retrieve admin users.") from exc

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Update a user's administrative account status."""
        try:
            logger.info("Updating user status.", extra={"user_id": user_id})
            updated_user = self.repository.update_user_status(
                user_id=user_id,
                payload=payload,
            )
            self.transaction_manager.commit()
            return updated_user
        except Exception as exc:
            self.transaction_manager.rollback()
            logger.exception("Failed to update user status.", extra={"user_id": user_id})
            raise AdminServiceError("Unable to update user status.") from exc


class CategoryManagementOperations:
    """Coordinates administrative category management use cases."""

    def __init__(
        self,
        repository: AdminRepositoryProtocol,
        transaction_manager: TransactionManagerProtocol,
    ) -> None:
        self.repository = repository
        self.transaction_manager = transaction_manager

    def get_categories(self) -> list[CategoryResponse]:
        """Return product categories available to administrators."""
        try:
            logger.info("Retrieving admin categories.")
            return self.repository.get_categories()
        except Exception as exc:
            logger.exception("Failed to retrieve admin categories.")
            raise AdminServiceError("Unable to retrieve admin categories.") from exc

    def create_category(self, payload: CreateCategoryRequest) -> CategoryResponse:
        """Create a new product category."""
        try:
            logger.info("Creating admin category.")
            category = self.repository.create_category(payload=payload)
            self.transaction_manager.commit()
            return category
        except Exception as exc:
            self.transaction_manager.rollback()
            logger.exception("Failed to create admin category.")
            raise AdminServiceError("Unable to create admin category.") from exc

    def update_category(
        self,
        category_id: int,
        payload: UpdateCategoryRequest,
    ) -> CategoryResponse:
        """Update an existing product category."""
        try:
            logger.info("Updating admin category.", extra={"category_id": category_id})
            category = self.repository.update_category(category_id=category_id, payload=payload)
            self.transaction_manager.commit()
            return category
        except Exception as exc:
            self.transaction_manager.rollback()
            logger.exception(
                "Failed to update admin category.",
                extra={"category_id": category_id},
            )
            raise AdminServiceError("Unable to update admin category.") from exc

    def delete_category(self, category_id: int) -> None:
        """Delete an existing product category."""
        try:
            logger.info("Deleting admin category.", extra={"category_id": category_id})
            self.repository.delete_category(category_id=category_id)
            self.transaction_manager.commit()
        except Exception as exc:
            self.transaction_manager.rollback()
            logger.exception(
                "Failed to delete admin category.",
                extra={"category_id": category_id},
            )
            raise AdminServiceError("Unable to delete admin category.") from exc


class AnalyticsOperations:
    """Coordinates administrative analytics use cases."""

    def __init__(self, repository: AdminRepositoryProtocol) -> None:
        self.repository = repository

    def get_analytics(self) -> AnalyticsResponse:
        """Return platform analytics for administrative reporting."""
        try:
            logger.info("Retrieving admin analytics.")
            return self.repository.get_analytics()
        except Exception as exc:
            logger.exception("Failed to retrieve admin analytics.")
            raise AdminServiceError("Unable to retrieve admin analytics.") from exc


class AdminService:
    """Facade for Admin service operations."""

    def __init__(
        self,
        repository: AdminRepositoryProtocol,
        transaction_manager: TransactionManagerProtocol | None = None,
    ) -> None:
        transaction_manager = transaction_manager or NoOpTransactionManager()
        self.dashboard_operations = DashboardOperations(repository=repository)
        self.user_management_operations = UserManagementOperations(
            repository=repository,
            transaction_manager=transaction_manager,
        )
        self.category_management_operations = CategoryManagementOperations(
            repository=repository,
            transaction_manager=transaction_manager,
        )
        self.analytics_operations = AnalyticsOperations(repository=repository)

    def get_dashboard(self) -> DashboardSummaryResponse:
        """Return administrative dashboard summary data."""
        return self.dashboard_operations.get_dashboard()

    def get_dashboard_summary(self) -> DashboardSummaryResponse:
        """Return administrative dashboard summary data for route compatibility."""
        return self.get_dashboard()

    def get_users(self) -> list[AdminUserResponse]:
        """Return users available to administrators."""
        return self.user_management_operations.get_users()

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Update a user's administrative account status."""
        return self.user_management_operations.update_user_status(
            user_id=user_id,
            payload=payload,
        )

    def get_categories(self) -> list[CategoryResponse]:
        """Return product categories available to administrators."""
        return self.category_management_operations.get_categories()

    def create_category(self, payload: CreateCategoryRequest) -> CategoryResponse:
        """Create a new product category."""
        return self.category_management_operations.create_category(payload=payload)

    def update_category(
        self,
        category_id: int,
        payload: UpdateCategoryRequest,
    ) -> CategoryResponse:
        """Update an existing product category."""
        return self.category_management_operations.update_category(
            category_id=category_id,
            payload=payload,
        )

    def delete_category(self, category_id: int) -> None:
        """Delete an existing product category."""
        self.category_management_operations.delete_category(category_id=category_id)

    def get_analytics(self) -> AnalyticsResponse:
        """Return administrative analytics data."""
        return self.analytics_operations.get_analytics()
