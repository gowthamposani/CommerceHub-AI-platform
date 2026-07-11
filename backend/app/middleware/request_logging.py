"""Enterprise request and response logging middleware."""

from __future__ import annotations

import logging
import time
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger(__name__)

REQUEST_ID_HEADER = "X-Request-ID"


class RequestResponseLoggingMiddleware(BaseHTTPMiddleware):
    """Log inbound requests and outbound responses with a correlation ID."""

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """Log request lifecycle metadata and attach request ID response header."""
        request_id = request.headers.get(REQUEST_ID_HEADER, str(uuid4()))
        started_at = time.perf_counter()
        timestamp = datetime.now(UTC).isoformat()
        client_host = request.client.host if request.client else "unknown"

        log_context = {
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "client_ip": client_host,
            "timestamp": timestamp,
            "status_code": "-",
            "processing_time_ms": "-",
        }

        logger.info("Incoming HTTP request.", extra=log_context)

        try:
            response = await call_next(request)
        except Exception:
            processing_time_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.exception(
                "HTTP request failed before response.",
                extra={
                    **log_context,
                    "status_code": 500,
                    "processing_time_ms": processing_time_ms,
                },
            )
            raise

        processing_time_ms = round((time.perf_counter() - started_at) * 1000, 2)
        response.headers[REQUEST_ID_HEADER] = request_id

        logger.info(
            "Outgoing HTTP response.",
            extra={
                **log_context,
                "status_code": response.status_code,
                "processing_time_ms": processing_time_ms,
            },
        )
        return response
