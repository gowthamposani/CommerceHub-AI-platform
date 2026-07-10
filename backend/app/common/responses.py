"""Standard response models."""

from typing import TypeVar

from pydantic import BaseModel, ConfigDict, Field

from app.utils.datetime import utc_now_iso

T = TypeVar("T")


class StandardResponse[T](BaseModel):
    """Standard successful API response wrapper."""

    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    success: bool = True
    message: str
    data: T | None = None
    timestamp: str = Field(default_factory=utc_now_iso)
    request_id: str | None = Field(default=None, alias="requestId", serialization_alias="requestId")

    @classmethod
    def success_response(
        cls,
        message: str,
        data: T | None = None,
        request_id: str | None = None,
    ) -> "StandardResponse[T]":
        """Create a standard success response."""
        return cls(message=message, data=data, request_id=request_id)
