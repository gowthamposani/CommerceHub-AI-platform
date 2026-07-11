"""Factory utilities for future tests."""

from uuid import uuid4


def uuid_string() -> str:
    """Return a UUID string for test data."""
    return str(uuid4())
