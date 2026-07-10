"""Enterprise logging configuration."""

import json
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any

from app.config.settings import Settings
from app.utils.datetime import utc_now_iso


class JsonFormatter(logging.Formatter):
    """Format log records as structured JSON."""

    def format(self, record: logging.LogRecord) -> str:
        """Format a log record."""
        payload: dict[str, Any] = {
            "timestamp": utc_now_iso(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            payload["request_id"] = record.request_id
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(settings: Settings) -> None:
    """Configure console and optional rotating file logging."""
    handlers: list[logging.Handler] = [logging.StreamHandler()]
    formatter: logging.Formatter = (
        JsonFormatter() if settings.log_json else logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    )

    for handler in handlers:
        handler.setFormatter(formatter)

    if settings.log_file_enabled:
        log_path = Path(settings.log_file_path)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = RotatingFileHandler(
            log_path,
            maxBytes=settings.log_max_bytes,
            backupCount=settings.log_backup_count,
        )
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)

    logging.basicConfig(level=settings.log_level, handlers=handlers, force=True)


application_logger = logging.getLogger("commercehub.application")
request_logger = logging.getLogger("commercehub.request")
error_logger = logging.getLogger("commercehub.error")
database_logger = logging.getLogger("commercehub.database")
startup_logger = logging.getLogger("commercehub.startup")
shutdown_logger = logging.getLogger("commercehub.shutdown")
