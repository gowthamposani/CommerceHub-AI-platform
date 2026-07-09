"""Application exceptions."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


logger = logging.getLogger(__name__)


def _request_metadata(request: Request, exc: Exception) -> dict[str, str]:
    """Build structured metadata for exception logs and responses."""
    return {
        "path": request.url.path,
        "method": request.method,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "exception_type": exc.__class__.__name__,
    }


def _error_response(
    *,
    message: str,
    error_code: str,
    details: dict[str, Any] | list[Any] | None = None,
) -> dict[str, Any]:
    """Build the standard API error response envelope."""
    return {
        "success": False,
        "message": message,
        "error_code": error_code,
        "details": details or {},
    }


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers required for enterprise API responses."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        metadata = _request_metadata(request=request, exc=exc)
        logger.warning(
            "HTTP exception handled.",
            extra={
                **metadata,
                "status_code": exc.status_code,
                "error_code": "HTTP_EXCEPTION",
            },
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_response(
                message=str(exc.detail),
                error_code="HTTP_EXCEPTION",
                details={"status_code": exc.status_code},
            ),
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        metadata = _request_metadata(request=request, exc=exc)
        validation_errors = exc.errors()
        logger.warning(
            "Request validation exception handled.",
            extra={
                **metadata,
                "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "error_code": "VALIDATION_ERROR",
            },
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_error_response(
                message="Request validation failed.",
                error_code="VALIDATION_ERROR",
                details={"errors": validation_errors},
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        metadata = _request_metadata(request=request, exc=exc)
        logger.exception(
            "Unhandled application exception.",
            extra={
                **metadata,
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "error_code": "INTERNAL_SERVER_ERROR",
            },
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_response(
                message="Internal server error.",
                error_code="INTERNAL_SERVER_ERROR",
                details={},
            ),
        )
