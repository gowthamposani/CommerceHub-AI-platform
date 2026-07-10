"""Notification provider abstractions and mock implementation."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Protocol
from uuid import NAMESPACE_URL, uuid5

from backend.app.schemas.notification_schema import (
    NotificationChannel,
    NotificationHistoryData,
    NotificationSendData,
    NotificationSendRequest,
    NotificationTemplateData,
)

logger = logging.getLogger(__name__)


class NotificationProviderError(RuntimeError):
    """Raised when notification provider operations fail."""


class NotificationProviderProtocol(Protocol):
    """Provider contract used by the notification service layer."""

    def send(self, payload: NotificationSendRequest) -> NotificationSendData:
        """Send a notification through the configured provider."""

    def get_templates(self) -> list[NotificationTemplateData]:
        """Return available notification templates."""

    def get_history(self) -> list[NotificationHistoryData]:
        """Return notification delivery history."""


class MockNotificationProvider:
    """Deterministic mock provider for Sprint 1 notification workflows."""

    provider_name = "mock"

    def send(self, payload: NotificationSendRequest) -> NotificationSendData:
        """Return a deterministic mock send result."""
        logger.info(
            "Sending mock notification.",
            extra={"feature": "notifications", "channel": payload.channel.value},
        )
        notification_id = str(
            uuid5(
                NAMESPACE_URL,
                f"{payload.channel.value}:{payload.recipient}:{payload.template_id}:{payload.body}",
            )
        )
        return NotificationSendData(
            notification_id=notification_id,
            channel=payload.channel,
            status="QUEUED",
            provider=self.provider_name,
            sent_at=datetime.now(UTC),
        )

    def get_templates(self) -> list[NotificationTemplateData]:
        """Return deterministic mock notification templates."""
        logger.info("Loading mock notification templates.", extra={"feature": "notifications"})
        return [
            NotificationTemplateData(
                template_id="welcome",
                name="Welcome Notification",
                supported_channels=[
                    NotificationChannel.EMAIL,
                    NotificationChannel.IN_APP,
                ],
            ),
            NotificationTemplateData(
                template_id="order-status",
                name="Order Status Update",
                supported_channels=[
                    NotificationChannel.EMAIL,
                    NotificationChannel.SMS,
                    NotificationChannel.PUSH,
                    NotificationChannel.IN_APP,
                ],
            ),
        ]

    def get_history(self) -> list[NotificationHistoryData]:
        """Return deterministic mock notification history."""
        logger.info("Loading mock notification history.", extra={"feature": "notifications"})
        return [
            NotificationHistoryData(
                notification_id="mock-history-001",
                channel=NotificationChannel.EMAIL,
                recipient="customer@example.com",
                status="DELIVERED",
                created_at=datetime.now(UTC),
            )
        ]
