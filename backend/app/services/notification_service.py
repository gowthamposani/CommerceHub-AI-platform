"""Service layer for enterprise notification workflows."""

from __future__ import annotations

import logging

from backend.app.schemas.notification_schema import (
    NotificationHistoryResponse,
    NotificationSendRequest,
    NotificationSendResponse,
    NotificationTemplatesResponse,
)
from backend.app.utils.notification_provider import NotificationProviderProtocol


logger = logging.getLogger(__name__)


class NotificationServiceError(RuntimeError):
    """Raised when notification service operations fail."""


class NotificationService:
    """Coordinates notification use cases through a provider abstraction."""

    def __init__(self, provider: NotificationProviderProtocol) -> None:
        self.provider = provider

    def send_notification(
        self,
        payload: NotificationSendRequest,
    ) -> NotificationSendResponse:
        """Send a notification through the configured provider."""
        try:
            logger.info(
                "Processing notification send request.",
                extra={"feature": "notifications", "channel": payload.channel.value},
            )
            send_result = self.provider.send(payload=payload)
            return NotificationSendResponse(
                success=True,
                message="Notification sent successfully",
                data=send_result,
            )
        except Exception as exc:
            logger.exception("Failed to send notification.", extra={"feature": "notifications"})
            raise NotificationServiceError("Unable to send notification.") from exc

    def get_templates(self) -> NotificationTemplatesResponse:
        """Return notification templates."""
        try:
            logger.info("Retrieving notification templates.", extra={"feature": "notifications"})
            templates = self.provider.get_templates()
            return NotificationTemplatesResponse(
                success=True,
                message="Notification templates retrieved successfully",
                data=templates,
            )
        except Exception as exc:
            logger.exception(
                "Failed to retrieve notification templates.",
                extra={"feature": "notifications"},
            )
            raise NotificationServiceError("Unable to retrieve notification templates.") from exc

    def get_history(self) -> NotificationHistoryResponse:
        """Return notification history."""
        try:
            logger.info("Retrieving notification history.", extra={"feature": "notifications"})
            history = self.provider.get_history()
            return NotificationHistoryResponse(
                success=True,
                message="Notification history retrieved successfully",
                data=history,
            )
        except Exception as exc:
            logger.exception(
                "Failed to retrieve notification history.",
                extra={"feature": "notifications"},
            )
            raise NotificationServiceError("Unable to retrieve notification history.") from exc
