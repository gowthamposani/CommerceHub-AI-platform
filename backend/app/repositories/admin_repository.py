"""Repository layer for Admin dashboard, analytics, and user management data access."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from decimal import Decimal

from app.schemas.admin_schema import (
    AdminAnalyticsData,
    AdminDashboardData,
    AdminUserData,
    AdminUserRole,
    AdminUserStatus,
)

logger = logging.getLogger(__name__)


class AdminRepositoryError(RuntimeError):
    """Raised when an Admin repository operation fails."""


class AdminRepository:
    """Repository for Admin dashboard, analytics, and user management data.

    Sprint 1 uses placeholder values until cross-team domain models are merged.
    The repository intentionally does not query real database models and never
    owns transaction control.
    """

    def get_dashboard_summary(self) -> AdminDashboardData:
        """Return placeholder dashboard metrics for platform administrators."""
        try:
            logger.info("Loading placeholder Admin dashboard summary.")
            # TODO: Integrate User counts when Developer 1 completes User models.
            # TODO: Integrate Seller and seller request counts when seller onboarding is merged.
            # TODO: Integrate Product counts when Developer 2 completes Product models.
            # TODO: Integrate Order counts and revenue when the Orders module is merged.
            return AdminDashboardData(
                total_users=0,
                total_customers=0,
                total_sellers=0,
                total_products=0,
                total_orders=0,
                pending_seller_requests=0,
                revenue=Decimal("0"),
                generated_at=datetime.now(UTC),
            )
        except Exception as exc:
            logger.exception("Failed to load placeholder Admin dashboard summary.")
            raise AdminRepositoryError("Unable to load Admin dashboard summary.") from exc

    def get_analytics_summary(self) -> AdminAnalyticsData:
        """Return placeholder analytics metrics for platform administrators."""
        try:
            logger.info("Loading placeholder Admin analytics summary.")
            # TODO: Integrate Orders metrics for revenue, today orders, and monthly orders.
            # TODO: Integrate Products metrics for best-selling category.
            # TODO: Integrate Inventory metrics for low-stock product counts.
            # TODO: Integrate Users metrics for active customer and seller counts.
            return AdminAnalyticsData(
                total_revenue=Decimal("0"),
                today_orders=0,
                monthly_orders=0,
                active_customers=0,
                active_sellers=0,
                best_selling_category="N/A",
                low_stock_products=0,
                generated_at=datetime.now(UTC),
            )
        except Exception as exc:
            logger.exception("Failed to load placeholder Admin analytics summary.")
            raise AdminRepositoryError("Unable to load Admin analytics summary.") from exc

    def get_users(self) -> list[AdminUserData]:
        """Return placeholder users for administrative management."""
        try:
            logger.info("Loading placeholder Admin users.")
            # TODO: Integrate with Developer 1 User module when User models and
            # persistence contracts are available.
            return [self._placeholder_user()]
        except Exception as exc:
            logger.exception("Failed to load placeholder Admin users.")
            raise AdminRepositoryError("Unable to load Admin users.") from exc

    def get_user_by_id(self, user_id: int) -> AdminUserData:
        """Return one placeholder user by identifier."""
        try:
            logger.info("Loading placeholder Admin user.", extra={"user_id": user_id})
            # TODO: Integrate with Developer 1 User repository lookup.
            return self._placeholder_user(user_id=user_id)
        except Exception as exc:
            logger.exception(
                "Failed to load placeholder Admin user.",
                extra={"user_id": user_id},
            )
            raise AdminRepositoryError("Unable to load Admin user.") from exc

    def update_user_status(
        self,
        user_id: int,
        status: AdminUserStatus,
    ) -> AdminUserData:
        """Return a placeholder user with updated status."""
        try:
            logger.info(
                "Updating placeholder Admin user status.",
                extra={"user_id": user_id, "status": status.value},
            )
            # TODO: Integrate with Developer 1 User status update operation.
            return self._placeholder_user(user_id=user_id, status=status)
        except Exception as exc:
            logger.exception(
                "Failed to update placeholder Admin user status.",
                extra={"user_id": user_id},
            )
            raise AdminRepositoryError("Unable to update Admin user status.") from exc

    def update_user_role(
        self,
        user_id: int,
        role: AdminUserRole,
    ) -> AdminUserData:
        """Return a placeholder user with updated role."""
        try:
            logger.info(
                "Updating placeholder Admin user role.",
                extra={"user_id": user_id, "role": role.value},
            )
            # TODO: Integrate with Developer 1 User role update operation.
            return self._placeholder_user(user_id=user_id, role=role)
        except Exception as exc:
            logger.exception(
                "Failed to update placeholder Admin user role.",
                extra={"user_id": user_id},
            )
            raise AdminRepositoryError("Unable to update Admin user role.") from exc

    @staticmethod
    def _placeholder_user(
        user_id: int = 1,
        role: AdminUserRole = AdminUserRole.CUSTOMER,
        status: AdminUserStatus = AdminUserStatus.ACTIVE,
    ) -> AdminUserData:
        """Build deterministic placeholder user data."""
        return AdminUserData(
            id=user_id,
            full_name="Placeholder User",
            email=f"user{user_id}@commercehub.local",
            role=role,
            status=status,
            created_at=datetime.now(UTC),
        )
