"""FastAPI routes for Admin dashboard operations."""

from __future__ import annotations

import logging
from collections.abc import Generator
from typing import Annotated, Protocol

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.repositories.admin_repository import (
    AdminDashboardModelRegistry,
    AdminRepository,
)
from backend.app.schemas.admin_schema import AdminDashboardResponse
from backend.app.services.admin_service import (
    AdminService,
    AdminServiceError,
    SQLAlchemyTransactionManager,
)


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Dashboard"])


class AdminServiceProtocol(Protocol):
    """Service contract consumed by Admin dashboard routes."""

    def get_dashboard_summary(self) -> AdminDashboardResponse:
        """Return dashboard summary data."""


def get_database_session() -> Generator[Session, None, None]:
    """Resolve the shared SQLAlchemy session dependency."""
    # TODO: Replace with the shared database session dependency after core integration.
    raise NotImplementedError("Database session dependency is not configured.")
    yield


def get_admin_dashboard_model_registry() -> AdminDashboardModelRegistry:
    """Resolve external model dependencies for Admin dashboard reporting."""
    # TODO: Replace registry defaults when User, Product, Order, and SellerRequest
    # models are merged by their owning developers.
    return AdminDashboardModelRegistry()


def get_admin_repository(
    session: Annotated[Session, Depends(get_database_session)],
    models: Annotated[
        AdminDashboardModelRegistry,
        Depends(get_admin_dashboard_model_registry),
    ],
) -> AdminRepository:
    """Resolve the Admin dashboard repository dependency."""
    return AdminRepository(session=session, models=models)


def get_admin_service(
    session: Annotated[Session, Depends(get_database_session)],
    repository: Annotated[AdminRepository, Depends(get_admin_repository)],
) -> AdminServiceProtocol:
    """Resolve the Admin dashboard service dependency."""
    return AdminService(
        repository=repository,
        transaction_manager=SQLAlchemyTransactionManager(session=session),
    )


AdminServiceDependency = Annotated[AdminServiceProtocol, Depends(get_admin_service)]


@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Admin dashboard summary",
    description=(
        "Returns aggregate platform metrics for the Admin dashboard, including users, "
        "customers, sellers, products, orders, pending seller requests, revenue, and "
        "generation timestamp."
    ),
    responses={
        status.HTTP_200_OK: {"description": "Dashboard summary returned successfully."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Dashboard summary could not be retrieved."
        },
    },
)
def get_admin_dashboard(
    admin_service: AdminServiceDependency,
) -> AdminDashboardResponse:
    """Return aggregate metrics for the Admin dashboard."""
    try:
        logger.info("Received Admin dashboard summary request.")
        return admin_service.get_dashboard_summary()
    except AdminServiceError as exc:
        logger.exception("Admin dashboard summary endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve Admin dashboard summary.",
        ) from exc
