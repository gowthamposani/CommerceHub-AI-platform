"""Logging configuration."""

from __future__ import annotations

import logging
import os


class StructuredLogFormatter(logging.Formatter):
    """Formatter that supplies defaults for optional structured log fields."""

    default_fields = {
        "path": "-",
        "method": "-",
        "timestamp": "-",
        "exception_type": "-",
        "status_code": "-",
        "error_code": "-",
    }

    def format(self, record: logging.LogRecord) -> str:
        """Format log records with safe defaults for structured fields."""
        for field_name, default_value in self.default_fields.items():
            if not hasattr(record, field_name):
                setattr(record, field_name, default_value)
        return super().format(record)


def configure_logging() -> None:
    """Configure application logging for startup and runtime diagnostics."""
    handler = logging.StreamHandler()
    handler.setFormatter(
        StructuredLogFormatter(
            "%(asctime)s %(levelname)s [%(name)s] %(message)s "
            "path=%(path)s method=%(method)s timestamp=%(timestamp)s "
            "exception_type=%(exception_type)s status_code=%(status_code)s "
            "error_code=%(error_code)s"
        )
    )
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        handlers=[handler],
        force=True,
    )
