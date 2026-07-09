"""Logging configuration."""

from __future__ import annotations

import logging
import os


def configure_logging() -> None:
    """Configure application logging for startup and runtime diagnostics."""
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
