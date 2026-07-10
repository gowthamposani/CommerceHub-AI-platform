"""Standard error models."""

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Single structured error item."""

    code: str | None = None
    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    """Standard API error response."""

    success: bool = False
    message: str
    errors: list[ErrorDetail] = Field(default_factory=list)
    timestamp: str
    requestId: str | None = None
