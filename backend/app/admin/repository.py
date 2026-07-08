"""Repository layer for Admin data access."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal
from dataclasses import dataclass
from typing import Any, TypeVar, cast

from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

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

ModelT = TypeVar("ModelT")

# TODO:
# Replace placeholder model imports once Developer 1 completes the auth module.
try:
    from backend.app.auth.models import SellerRequest as SellerRequestModel
    from backend.app.auth.models import User as UserModel
except ImportError:
    SellerRequestModel = None
    UserModel = None

# TODO:
# Replace placeholder model imports once Developer 2 completes the catalog module.
try:
    from backend.app.catalog.models import Category as CategoryModel
    from backend.app.catalog.models import Product as ProductModel
except ImportError:
    CategoryModel = None
    ProductModel = None

# TODO:
# Replace placeholder model imports once the order module is available.
try:
    from backend.app.orders.models import Order as OrderModel
except ImportError:
    OrderModel = None


class AdminRepositoryError(RuntimeError):
    """Raised when an Admin repository operation fails."""


@dataclass(frozen=True, slots=True)
class AdminModelRegistry:
    """Container for models owned by other CommerceHub AI modules.

    The Admin module depends on these models for reporting and management views,
    but it does not own their definitions. Keep this registry as the integration
    boundary until the auth, catalog, and order modules are merged.
    """

    user_model: Any | None = UserModel
    seller_request_model: Any | None = SellerRequestModel
    category_model: Any | None = CategoryModel
    product_model: Any | None = ProductModel
    order_model: Any | None = OrderModel


class AdminRepository:
    """SQLAlchemy-backed repository for Admin operations."""

    def __init__(
        self,
        session: Session,
        models: AdminModelRegistry | None = None,
    ) -> None:
        self.session = session
        self.models = models or AdminModelRegistry()

    def get_dashboard(self) -> DashboardSummaryResponse:
        """Return aggregate dashboard metrics for service-layer compatibility."""
        return self.get_dashboard_summary()

    def get_dashboard_summary(self) -> DashboardSummaryResponse:
        """Return aggregate dashboard metrics for administrators."""
        try:
            logger.info("Loading admin dashboard summary from database.")
            user_model = self._require_model(self.models.user_model, "UserModel")
            seller_request_model = self._require_model(
                self.models.seller_request_model,
                "SellerRequestModel",
            )
            product_model = self._require_model(self.models.product_model, "ProductModel")
            order_model = self._require_model(self.models.order_model, "OrderModel")

            total_users = self._count(user_model)
            total_customers = self._count_where(user_model, user_model.role == "CUSTOMER")
            total_sellers = self._count_where(user_model, user_model.role == "SELLER")
            active_users = self._count_where(user_model, user_model.status == "ACTIVE")
            total_products = self._count(product_model)
            total_orders = self._count(order_model)
            pending_seller_requests = self._count_where(
                seller_request_model,
                seller_request_model.status == "PENDING",
            )
            revenue = self.session.scalar(
                select(func.coalesce(func.sum(order_model.total_amount), 0))
            )

            return DashboardSummaryResponse(
                total_users=total_users,
                total_customers=total_customers,
                total_sellers=total_sellers,
                total_products=total_products,
                total_orders=total_orders,
                pending_seller_requests=pending_seller_requests,
                active_users=active_users,
                revenue=Decimal(str(revenue or 0)),
                generated_at=datetime.now(timezone.utc),
            )
        except SQLAlchemyError as exc:
            logger.exception("Database error while loading admin dashboard summary.")
            raise AdminRepositoryError("Unable to load dashboard summary.") from exc

    def get_users(self) -> list[AdminUserResponse]:
        """Return users for administrative management."""
        try:
            logger.info("Loading admin users from database.")
            user_model = self._require_model(self.models.user_model, "UserModel")
            users = self.session.scalars(
                select(user_model).order_by(user_model.created_at.desc())
            ).all()
            return [AdminUserResponse.model_validate(user) for user in users]
        except SQLAlchemyError as exc:
            logger.exception("Database error while loading admin users.")
            raise AdminRepositoryError("Unable to load users.") from exc

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Persist a user status update."""
        try:
            logger.info("Updating user status in database.", extra={"user_id": user_id})
            user_model = self._require_model(self.models.user_model, "UserModel")
            user = self.session.get(user_model, user_id)
            if user is None:
                raise AdminRepositoryError("User not found.")

            user.status = payload.status.value
            self.session.add(user)
            self.session.flush()
            self.session.refresh(user)
            return AdminUserResponse.model_validate(user)
        except SQLAlchemyError as exc:
            logger.exception(
                "Database error while updating user status.",
                extra={"user_id": user_id},
            )
            raise AdminRepositoryError("Unable to update user status.") from exc

    def get_categories(self) -> list[CategoryResponse]:
        """Return product categories for administrative management."""
        try:
            logger.info("Loading admin categories from database.")
            category_model = self._require_model(self.models.category_model, "CategoryModel")
            categories = self.session.scalars(
                select(category_model).order_by(category_model.name.asc())
            ).all()
            return [CategoryResponse.model_validate(category) for category in categories]
        except SQLAlchemyError as exc:
            logger.exception("Database error while loading admin categories.")
            raise AdminRepositoryError("Unable to load categories.") from exc

    def create_category(self, payload: CreateCategoryRequest) -> CategoryResponse:
        """Persist a new product category."""
        try:
            logger.info("Creating category in database.")
            category_model = self._require_model(self.models.category_model, "CategoryModel")
            category = category_model(
                name=payload.name,
                description=payload.description,
                is_active=True,
            )
            self.session.add(category)
            self.session.flush()
            self.session.refresh(category)
            return CategoryResponse.model_validate(category)
        except SQLAlchemyError as exc:
            logger.exception("Database error while creating category.")
            raise AdminRepositoryError("Unable to create category.") from exc

    def update_category(
        self,
        category_id: int,
        payload: UpdateCategoryRequest,
    ) -> CategoryResponse:
        """Persist updates to an existing product category."""
        try:
            logger.info(
                "Updating category in database.",
                extra={"category_id": category_id},
            )
            category_model = self._require_model(self.models.category_model, "CategoryModel")
            category = self.session.get(category_model, category_id)
            if category is None:
                raise AdminRepositoryError("Category not found.")

            update_data = payload.model_dump(exclude_unset=True)
            for field_name, field_value in update_data.items():
                setattr(category, field_name, field_value)

            self.session.add(category)
            self.session.flush()
            self.session.refresh(category)
            return CategoryResponse.model_validate(category)
        except SQLAlchemyError as exc:
            logger.exception(
                "Database error while updating category.",
                extra={"category_id": category_id},
            )
            raise AdminRepositoryError("Unable to update category.") from exc

    def delete_category(self, category_id: int) -> None:
        """Delete a product category by identifier."""
        try:
            logger.info(
                "Deleting category from database.",
                extra={"category_id": category_id},
            )
            category_model = self._require_model(self.models.category_model, "CategoryModel")
            category = self.session.get(category_model, category_id)
            if category is None:
                raise AdminRepositoryError("Category not found.")

            self.session.delete(category)
            self.session.flush()
        except SQLAlchemyError as exc:
            logger.exception(
                "Database error while deleting category.",
                extra={"category_id": category_id},
            )
            raise AdminRepositoryError("Unable to delete category.") from exc

    def get_analytics(self) -> AnalyticsResponse:
        """Return administrative analytics metrics."""
        try:
            logger.info("Loading admin analytics from database.")
            user_model = self._require_model(self.models.user_model, "UserModel")
            category_model = self._require_model(self.models.category_model, "CategoryModel")
            product_model = self._require_model(self.models.product_model, "ProductModel")
            order_model = self._require_model(self.models.order_model, "OrderModel")

            monthly_revenue = self.session.scalar(
                select(func.coalesce(func.sum(order_model.total_amount), 0))
            )
            monthly_orders = self._count(order_model)
            total_customers = self._count_where(user_model, user_model.role == "CUSTOMER")
            total_sellers = self._count_where(user_model, user_model.role == "SELLER")

            # TODO:
            # Replace simple ordered lookups with performance analytics once reporting
            # projections are available.
            top_categories = self.session.scalars(
                select(category_model.name).order_by(category_model.name.asc()).limit(5)
            ).all()
            top_products = self.session.scalars(
                select(product_model.name).order_by(product_model.name.asc()).limit(5)
            ).all()

            return AnalyticsResponse(
                monthly_revenue=Decimal(str(monthly_revenue or 0)),
                monthly_orders=monthly_orders,
                total_customers=total_customers,
                total_sellers=total_sellers,
                top_categories=list(top_categories),
                top_products=list(top_products),
            )
        except SQLAlchemyError as exc:
            logger.exception("Database error while loading admin analytics.")
            raise AdminRepositoryError("Unable to load analytics.") from exc

    def _count(self, model: Any) -> int:
        return int(self.session.scalar(select(func.count()).select_from(model)) or 0)

    def _count_where(self, model: Any, predicate: Any) -> int:
        return int(
            self.session.scalar(select(func.count()).select_from(model).where(predicate))
            or 0
        )

    @staticmethod
    def _require_model(model: ModelT | None, model_name: str) -> ModelT:
        if model is None:
            raise AdminRepositoryError(
                f"{model_name} is not configured. Complete the pending model import TODO."
            )
        return cast(ModelT, model)
