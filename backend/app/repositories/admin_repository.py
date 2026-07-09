"""Repository layer for Admin dashboard and analytics data access."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal

from backend.app.schemas.admin_schema import AdminAnalyticsData, AdminDashboardData


logger = logging.getLogger(__name__)


class AdminRepositoryError(RuntimeError):
    """Raised when an Admin repository operation fails."""


class AdminRepository:
    """Repository for Admin dashboard and analytics data.

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
                generated_at=datetime.now(timezone.utc),
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
                generated_at=datetime.now(timezone.utc),
            )
        except Exception as exc:
            logger.exception("Failed to load placeholder Admin analytics summary.")
            raise AdminRepositoryError("Unable to load Admin analytics summary.") from exc
