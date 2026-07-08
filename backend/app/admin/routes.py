"""Admin module API routes."""

from __future__ import annotations

import logging
from collections.abc import Generator
from typing import Annotated, Protocol

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from .repository import AdminModelRegistry, AdminRepository
from .schemas import (
    AdminUserResponse,
    AnalyticsResponse,
    CategoryResponse,
    CreateCategoryRequest,
    DashboardSummaryResponse,
    UpdateCategoryRequest,
    UpdateUserStatusRequest,
)
from .service import AdminService, AdminServiceError, SQLAlchemyTransactionManager


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"],
)


class AdminServiceProtocol(Protocol):
    """Service contract consumed by the Admin route layer."""

    def get_dashboard(self) -> DashboardSummaryResponse:
        """Return platform dashboard summary."""

    def get_dashboard_summary(self) -> DashboardSummaryResponse:
        """Return platform dashboard summary."""

    def get_users(self) -> list[AdminUserResponse]:
        """Return admin-visible users."""

    def update_user_status(
        self,
        user_id: int,
        payload: UpdateUserStatusRequest,
    ) -> AdminUserResponse:
        """Update user account status."""

    def get_categories(self) -> list[CategoryResponse]:
        """Return product categories."""

    def create_category(self, payload: CreateCategoryRequest) -> CategoryResponse:
        """Create a product category."""

    def update_category(
        self,
        category_id: int,
        payload: UpdateCategoryRequest,
    ) -> CategoryResponse:
        """Update a product category."""

    def delete_category(self, category_id: int) -> None:
        """Delete a product category."""

    def get_analytics(self) -> AnalyticsResponse:
        """Return admin analytics."""


def get_database_session() -> Generator[Session, None, None]:
    """Resolve SQLAlchemy database session dependency."""
    # TODO:
    # Replace this placeholder with the shared database session dependency once the
    # core database module is merged.
    raise NotImplementedError("Database session dependency is not configured.")
    yield


def get_admin_model_registry() -> AdminModelRegistry:
    """Resolve model registry for Admin integrations owned by other modules."""
    # TODO:
    # Replace registry defaults when auth, catalog, and orders modules expose stable
    # SQLAlchemy models after integration.
    return AdminModelRegistry()


def get_admin_repository(
    session: Annotated[Session, Depends(get_database_session)],
    models: Annotated[AdminModelRegistry, Depends(get_admin_model_registry)],
) -> AdminRepository:
    """Resolve Admin repository dependency."""
    return AdminRepository(session=session, models=models)


def get_admin_service(
    session: Annotated[Session, Depends(get_database_session)],
    repository: Annotated[AdminRepository, Depends(get_admin_repository)],
) -> AdminServiceProtocol:
    """Resolve Admin service dependency."""
    return AdminService(
        repository=repository,
        transaction_manager=SQLAlchemyTransactionManager(session=session),
    )


AdminServiceDependency = Annotated[AdminServiceProtocol, Depends(get_admin_service)]


@router.get(
    "/dashboard",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get admin dashboard summary",
    description="Returns aggregated operational dashboard metrics for platform administrators.",
)
def get_admin_dashboard(
    admin_service: AdminServiceDependency,
) -> DashboardSummaryResponse:
    try:
        logger.debug("Fetching admin dashboard summary.")
        return admin_service.get_dashboard()
    except AdminServiceError as exc:
        logger.exception("Admin dashboard endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve admin dashboard summary.",
        ) from exc


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get admin users",
    description="Returns the collection of platform users visible to administrators.",
)
def get_admin_users(
    admin_service: AdminServiceDependency,
) -> list[AdminUserResponse]:
    try:
        logger.debug("Fetching admin user list.")
        return admin_service.get_users()
    except AdminServiceError as exc:
        logger.exception("Admin users endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve admin users.",
        ) from exc


@router.patch(
    "/users/{id}/status",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user status",
    description="Updates the administrative status of a platform user.",
)
def update_admin_user_status(
    payload: UpdateUserStatusRequest,
    admin_service: AdminServiceDependency,
    id: int = Path(gt=0, description="Unique user identifier."),
) -> AdminUserResponse:
    try:
        logger.info("Updating admin user status.", extra={"user_id": id})
        return admin_service.update_user_status(user_id=id, payload=payload)
    except AdminServiceError as exc:
        logger.exception("Admin user status endpoint failed.", extra={"user_id": id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update user status.",
        ) from exc


@router.get(
    "/categories",
    response_model=list[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get categories",
    description="Returns product categories managed by administrators.",
)
def get_admin_categories(
    admin_service: AdminServiceDependency,
) -> list[CategoryResponse]:
    try:
        logger.debug("Fetching admin category list.")
        return admin_service.get_categories()
    except AdminServiceError as exc:
        logger.exception("Admin categories endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve admin categories.",
        ) from exc


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
    description="Creates a new product category for the commerce catalog.",
)
def create_admin_category(
    payload: CreateCategoryRequest,
    admin_service: AdminServiceDependency,
) -> CategoryResponse:
    try:
        logger.info("Creating admin category.")
        return admin_service.create_category(payload=payload)
    except AdminServiceError as exc:
        logger.exception("Admin category create endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create admin category.",
        ) from exc


@router.put(
    "/categories/{id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Update category",
    description="Updates an existing product category by identifier.",
)
def update_admin_category(
    payload: UpdateCategoryRequest,
    admin_service: AdminServiceDependency,
    id: int = Path(gt=0, description="Unique category identifier."),
) -> CategoryResponse:
    try:
        logger.info("Updating admin category.", extra={"category_id": id})
        return admin_service.update_category(category_id=id, payload=payload)
    except AdminServiceError as exc:
        logger.exception("Admin category update endpoint failed.", extra={"category_id": id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update admin category.",
        ) from exc


@router.delete(
    "/categories/{id}",
    response_model=None,
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete category",
    description="Deletes an existing product category by identifier.",
)
def delete_admin_category(
    admin_service: AdminServiceDependency,
    id: int = Path(gt=0, description="Unique category identifier."),
) -> None:
    try:
        logger.info("Deleting admin category.", extra={"category_id": id})
        admin_service.delete_category(category_id=id)
    except AdminServiceError as exc:
        logger.exception("Admin category delete endpoint failed.", extra={"category_id": id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete admin category.",
        ) from exc


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get admin analytics",
    description="Returns platform analytics for administrative reporting.",
)
def get_admin_analytics(
    admin_service: AdminServiceDependency,
) -> AnalyticsResponse:
    try:
        logger.debug("Fetching admin analytics.")
        return admin_service.get_analytics()
    except AdminServiceError as exc:
        logger.exception("Admin analytics endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve admin analytics.",
        ) from exc
