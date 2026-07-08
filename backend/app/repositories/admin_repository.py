"""Repository layer for Admin dashboard data access."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, TypeVar, cast

from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.app.schemas.admin_schema import AdminDashboardResponse


logger = logging.getLogger(__name__)

ModelT = TypeVar("ModelT")

# TODO: Replace placeholder imports after Developer 1 completes auth models.
try:
    from backend.app.models.user import SellerRequest as SellerRequestModel
    from backend.app.models.user import User as UserModel
except ImportError:
    SellerRequestModel = None
    UserModel = None

# TODO: Replace placeholder import after Developer 2 completes product models.
try:
    from backend.app.models.product import Product as ProductModel
except ImportError:
    ProductModel = None

# TODO: Replace placeholder import after the orders module is completed.
try:
    from backend.app.models.order import Order as OrderModel
except ImportError:
    OrderModel = None


class AdminRepositoryError(RuntimeError):
    """Raised when an Admin repository operation fails."""


@dataclass(frozen=True, slots=True)
class AdminDashboardModelRegistry:
    """Model registry for dashboard dependencies owned by other developers."""

    user_model: Any | None = UserModel
    seller_request_model: Any | None = SellerRequestModel
    product_model: Any | None = ProductModel
    order_model: Any | None = OrderModel


class AdminRepository:
    """SQLAlchemy repository for Admin dashboard read operations."""

    def __init__(
        self,
        session: Session,
        models: AdminDashboardModelRegistry | None = None,
    ) -> None:
        self.session = session
        self.models = models or AdminDashboardModelRegistry()

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return aggregate dashboard metrics for platform administrators."""
        try:
            logger.info("Loading Admin dashboard summary.")
            user_model = self._require_model(self.models.user_model, "UserModel")
            seller_request_model = self._require_model(
                self.models.seller_request_model,
                "SellerRequestModel",
            )
            product_model = self._require_model(
                self.models.product_model,
                "ProductModel",
            )
            order_model = self._require_model(self.models.order_model, "OrderModel")

            revenue = self.session.scalar(
                select(func.coalesce(func.sum(order_model.total_amount), 0))
            )

            return AdminDashboardResponse(
                total_users=self._count(user_model),
                total_customers=self._count_where(
                    user_model,
                    user_model.role == "CUSTOMER",
                ),
                total_sellers=self._count_where(
                    user_model,
                    user_model.role == "SELLER",
                ),
                total_products=self._count(product_model),
                total_orders=self._count(order_model),
                pending_seller_requests=self._count_where(
                    seller_request_model,
                    seller_request_model.status == "PENDING",
                ),
                revenue=Decimal(str(revenue or 0)),
                generated_at=datetime.now(timezone.utc),
            )
        except AdminRepositoryError:
            raise
        except SQLAlchemyError as exc:
            logger.exception("Database error while loading Admin dashboard summary.")
            raise AdminRepositoryError("Unable to load Admin dashboard summary.") from exc

    def _count(self, model: Any) -> int:
        """Count all records for a SQLAlchemy model."""
        return int(self.session.scalar(select(func.count()).select_from(model)) or 0)

    def _count_where(self, model: Any, predicate: Any) -> int:
        """Count records matching a SQLAlchemy predicate."""
        return int(
            self.session.scalar(select(func.count()).select_from(model).where(predicate))
            or 0
        )

    @staticmethod
    def _require_model(model: ModelT | None, model_name: str) -> ModelT:
        """Return a configured model or fail with an integration-ready error."""
        if model is None:
            raise AdminRepositoryError(
                f"{model_name} is not configured. Complete the pending model integration TODO."
            )
        return cast(ModelT, model)
