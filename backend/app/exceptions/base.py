"""Application exception classes."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ApplicationError(Exception):
    """Base application exception."""

    message: str
    status_code: int = 400
    errors: list[dict[str, Any]] = field(default_factory=list)


class DatabaseApplicationError(ApplicationError):
    """Raised for database-related application failures."""

