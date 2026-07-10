"""Standard error models."""

from pydantic import BaseModel, ConfigDict, Field


class ErrorDetail(BaseModel):
    """Single structured error item."""

    code: str | None = None
    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    """Standard API error response."""

    model_config = ConfigDict(populate_by_name=True)

    success: bool = False
    message: str
    errors: list[ErrorDetail] = Field(default_factory=list)
    timestamp: str
    request_id: str | None = Field(default=None, alias="requestId", serialization_alias="requestId")
