"""String utility functions."""

import re


def slugify(value: str) -> str:
    """Convert text into a URL-friendly slug."""
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")
