"""Pydantic schemas for the enterprise notification framework."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NotificationSchema(BaseModel):
    """Base schema configuration for notification API contracts."""

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )


class NotificationChannel(StrEnum):
    """Supported notification channels."""

    EMAIL = "EMAIL"
    SMS = "SMS"
    PUSH = "PUSH"
    IN_APP = "IN_APP"


class NotificationSendRequest(NotificationSchema):
    """Request schema for sending a notification."""

    channel: Annotated[
        NotificationChannel,
        Field(description="Notification delivery channel."),
    ]
    recipient: Annotated[
        str,
        Field(min_length=1, max_length=255, description="Notification recipient."),
    ]
    subject: Annotated[
        str | None,
        Field(default=None, max_length=150, description="Notification subject."),
    ]
    body: Annotated[
        str,
        Field(min_length=1, max_length=2000, description="Notification body."),
    ]
    template_id: Annotated[
        str | None,
        Field(default=None, max_length=100, description="Optional template identifier."),
    ]
    context: Annotated[
        dict[str, Any],
        Field(default_factory=dict, description="Template rendering context."),
    ]

    @field_validator("recipient", "body", "subject", "template_id")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        """Normalize optional text fields."""
        if value is None:
            return value
        return value.strip()


class NotificationSendData(NotificationSchema):
    """Mock provider send result."""

    notification_id: Annotated[
        str,
        Field(description="Deterministic mock notification identifier."),
    ]
    channel: Annotated[
        NotificationChannel,
        Field(description="Notification delivery channel."),
    ]
    status: Annotated[
        str,
        Field(description="Mock notification delivery status."),
    ]
    provider: Annotated[
        str,
        Field(description="Provider implementation name."),
    ]
    sent_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the notification was accepted."),
    ]


class NotificationTemplateData(NotificationSchema):
    """Notification template metadata."""

    template_id: Annotated[
        str,
        Field(description="Template identifier."),
    ]
    name: Annotated[
        str,
        Field(description="Template display name."),
    ]
    supported_channels: Annotated[
        list[NotificationChannel],
        Field(description="Channels supported by this template."),
    ]


class NotificationHistoryData(NotificationSchema):
    """Notification history record."""

    notification_id: Annotated[
        str,
        Field(description="Notification identifier."),
    ]
    channel: Annotated[
        NotificationChannel,
        Field(description="Notification delivery channel."),
    ]
    recipient: Annotated[
        str,
        Field(description="Notification recipient."),
    ]
    status: Annotated[
        str,
        Field(description="Notification delivery status."),
    ]
    created_at: Annotated[
        datetime,
        Field(description="UTC timestamp when the record was created."),
    ]


class NotificationSendResponse(NotificationSchema):
    """Standard response envelope for sending a notification."""

    success: bool = True
    message: str = "Notification sent successfully"
    data: NotificationSendData


class NotificationTemplatesResponse(NotificationSchema):
    """Standard response envelope for notification templates."""

    success: bool = True
    message: str = "Notification templates retrieved successfully"
    data: list[NotificationTemplateData]


class NotificationHistoryResponse(NotificationSchema):
    """Standard response envelope for notification history."""

    success: bool = True
    message: str = "Notification history retrieved successfully"
    data: list[NotificationHistoryData]
