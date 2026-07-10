"""Reusable Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse


class BaseSchema(BaseModel):
    """Base schema configured for ORM serialization."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class EntitySchema(BaseSchema):
    """Base entity response schema."""

    id: UUID
    created_at: datetime
    updated_at: datetime


class PaginationSchema(PaginationParams):
    """Public pagination schema."""


class FilterSchema(BaseSchema):
    """Reusable filter schema."""

    filters: dict[str, str] = Field(default_factory=dict)


class SearchSchema(BaseSchema):
    """Reusable search schema."""

    query: str | None = Field(default=None, min_length=1, max_length=255)


class SortSchema(BaseSchema):
    """Reusable sort schema."""

    sort_by: str | None = None
    sort_direction: SortDirection = SortDirection.ASC


class ResponseSchema(StandardResponse[dict[str, object]]):
    """Reusable response schema alias."""


class ErrorSchema(BaseSchema):
    """Reusable error schema."""

    message: str
    errors: list[dict[str, object]] = Field(default_factory=list)


class SuccessSchema(BaseSchema):
    """Reusable success schema."""

    success: bool = True
    message: str
