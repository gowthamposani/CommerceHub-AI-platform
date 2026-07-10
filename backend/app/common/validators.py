"""Reusable Pydantic validators."""

from typing import Any


def normalize_blank_to_none(value: Any) -> Any:
    """Convert blank strings to None for optional request fields."""
    if isinstance(value, str) and not value.strip():
        return None
    return value


def normalize_search_term(value: str | None) -> str | None:
    """Trim and normalize a search term."""
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None

