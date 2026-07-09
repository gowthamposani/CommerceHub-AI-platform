"""Repository layer for Admin dashboard data access."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal

from backend.app.schemas.admin_schema import AdminDashboardData


logger = logging.getLogger(__name__)


class AdminRepositoryError(RuntimeError):
    """Raised when an Admin repository operation fails."""


class AdminRepository:
    """Repository for Admin dashboard data.

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
