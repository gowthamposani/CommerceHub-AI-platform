"""Pagination request and response helpers."""

from math import ceil
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.common.constants import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Validated pagination parameters."""

    page: int = Field(default=DEFAULT_PAGE, ge=1)
    page_size: int = Field(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE)

    @computed_field
    @property
    def offset(self) -> int:
        """Return SQL offset for the current page."""
        return (self.page - 1) * self.page_size

    @computed_field
    @property
    def limit(self) -> int:
        """Return SQL limit for the current page."""
        return self.page_size


class PageMeta(BaseModel):
    """Pagination metadata."""

    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class Page(BaseModel, Generic[T]):
    """Paginated response payload."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    items: list[T]
    meta: PageMeta


def build_page(items: list[T], total_items: int, params: PaginationParams) -> Page[T]:
    """Build a paginated response from items and total count."""
    total_pages = ceil(total_items / params.page_size) if total_items else 0
    return Page(
        items=items,
        meta=PageMeta(
            page=params.page,
            page_size=params.page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=params.page < total_pages,
            has_previous=params.page > 1,
        ),
    )
