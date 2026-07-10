"""Standard response models."""

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

from app.utils.datetime import utc_now_iso

T = TypeVar("T")


class StandardResponse(BaseModel, Generic[T]):
    """Standard successful API response wrapper."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool = True
    message: str
    data: T | None = None
    timestamp: str = Field(default_factory=utc_now_iso)
    requestId: str | None = None  # noqa: N815

    @classmethod
    def success_response(
        cls,
        message: str,
        data: T | None = None,
        request_id: str | None = None,
    ) -> "StandardResponse[T]":
        """Create a standard success response."""
        return cls(message=message, data=data, requestId=request_id)
