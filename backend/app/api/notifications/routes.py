"""FastAPI routes for enterprise notification workflows."""

from __future__ import annotations

import logging
from typing import Annotated, Protocol

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.notification_schema import (
    NotificationHistoryResponse,
    NotificationSendRequest,
    NotificationSendResponse,
    NotificationTemplatesResponse,
)
from app.services.notification_service import NotificationService, NotificationServiceError
from app.utils.notification_provider import MockNotificationProvider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


class NotificationServiceProtocol(Protocol):
    """Service contract consumed by notification routes."""

    def send_notification(
        self,
        payload: NotificationSendRequest,
    ) -> NotificationSendResponse:
        """Send a notification."""

    def get_templates(self) -> NotificationTemplatesResponse:
        """Return notification templates."""

    def get_history(self) -> NotificationHistoryResponse:
        """Return notification history."""


def get_notification_provider() -> MockNotificationProvider:
    """Resolve the notification provider dependency."""
    # TODO: Replace with SMTP, SendGrid, Twilio, Firebase, or in-app provider.
    return MockNotificationProvider()


def get_notification_service(
    provider: Annotated[MockNotificationProvider, Depends(get_notification_provider)],
) -> NotificationServiceProtocol:
    """Resolve the notification service dependency."""
    return NotificationService(provider=provider)


NotificationServiceDependency = Annotated[
    NotificationServiceProtocol,
    Depends(get_notification_service),
]


@router.post(
    "/send",
    response_model=NotificationSendResponse,
    status_code=status.HTTP_200_OK,
    summary="Send notification",
    description="Sends a mock notification through the provider abstraction.",
)
def send_notification(
    payload: NotificationSendRequest,
    notification_service: NotificationServiceDependency,
) -> NotificationSendResponse:
    """Send a mock notification."""
    try:
        logger.info("Received notification send request.")
        return notification_service.send_notification(payload=payload)
    except NotificationServiceError as exc:
        logger.exception("Notification send endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send notification.",
        ) from exc


@router.get(
    "/templates",
    response_model=NotificationTemplatesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get notification templates",
    description="Returns deterministic mock notification templates.",
)
def get_notification_templates(
    notification_service: NotificationServiceDependency,
) -> NotificationTemplatesResponse:
    """Return mock notification templates."""
    try:
        logger.info("Received notification templates request.")
        return notification_service.get_templates()
    except NotificationServiceError as exc:
        logger.exception("Notification templates endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve notification templates.",
        ) from exc


@router.get(
    "/history",
    response_model=NotificationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get notification history",
    description="Returns deterministic mock notification history.",
)
def get_notification_history(
    notification_service: NotificationServiceDependency,
) -> NotificationHistoryResponse:
    """Return mock notification history."""
    try:
        logger.info("Received notification history request.")
        return notification_service.get_history()
    except NotificationServiceError as exc:
        logger.exception("Notification history endpoint failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve notification history.",
        ) from exc
