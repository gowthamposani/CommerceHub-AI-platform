"""Application exceptions and exception handlers."""

from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error that maps to a JSON API response."""

    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str, *, data: Any | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.data = data if data is not None else {}


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class AuthenticationError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED


class AuthorizationError(AppError):
    status_code = status.HTTP_403_FORBIDDEN


def _error_payload(message: str, data: Any | None = None) -> dict[str, Any]:
    return {"success": False, "message": message, "data": data if data is not None else {}}


def _validation_message(errors: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for error in errors:
        location = ".".join(str(part) for part in error.get("loc", ()))
        detail = error.get("msg", "Invalid value")
        parts.append(f"{location}: {detail}" if location else detail)
    return "; ".join(parts) if parts else "Validation error"


def _validation_details(errors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return JSON-serializable validation details."""

    sanitized: list[dict[str, Any]] = []
    for error in errors:
        sanitized.append(
            {
                "loc": error.get("loc", ()),
                "msg": error.get("msg", "Invalid value"),
                "type": error.get("type", "validation_error"),
                "input": jsonable_encoder(error.get("input")),
            }
        )
    return sanitized


def register_exception_handlers(app: FastAPI) -> None:
    """Register consistent JSON handlers for application and validation errors."""

    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:  # noqa: ARG001
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_payload(exc.message, exc.data),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:  # noqa: ARG001
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content=_error_payload(
                "Validation error",
                {
                    "detail": _validation_details(exc.errors()),
                    "message": _validation_message(exc.errors()),
                },
            ),
        )

    @app.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:  # noqa: ARG001
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_payload(str(exc.detail)),
        )


__all__ = [
    "AppError",
    "AuthenticationError",
    "AuthorizationError",
    "ConflictError",
    "NotFoundError",
    "register_exception_handlers",
]
