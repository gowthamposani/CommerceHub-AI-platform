"""Datetime utilities."""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return the current timezone-aware UTC datetime."""
    return datetime.now(UTC)


def utc_now_iso() -> str:
    """Return the current timezone-aware UTC datetime as ISO text."""
    return utc_now().isoformat()
