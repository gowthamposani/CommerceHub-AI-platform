"""Centralized FastAPI exception handlers."""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import DatabaseError, IntegrityError, OperationalError

from app.common.errors import ErrorDetail, ErrorResponse
from app.exceptions.base import ApplicationError
from app.utils.datetime import utc_now_iso


def _request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def _error_payload(request: Request, message: str, errors: list[ErrorDetail] | None = None) -> dict[str, object]:
    return ErrorResponse(
        message=message,
        errors=errors or [],
        timestamp=utc_now_iso(),
        requestId=_request_id(request),
    ).model_dump()


async def application_error_handler(request: Request, exc: ApplicationError) -> JSONResponse:
    """Handle application exceptions."""
    errors = [ErrorDetail(**error) for error in exc.errors]
    return JSONResponse(status_code=exc.status_code, content=_error_payload(request, exc.message, errors))


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    return JSONResponse(status_code=exc.status_code, content=_error_payload(request, str(exc.detail)))


async def validation_exception_handler(request: Request, exc: RequestValidationError | ValidationError) -> JSONResponse:
    """Handle request and Pydantic validation exceptions."""
    errors = [
        ErrorDetail(
            field=".".join(str(part) for part in error.get("loc", [])),
            message=error.get("msg", "Invalid value"),
        )
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_error_payload(request, "Validation failed", errors),
    )


async def database_exception_handler(request: Request, exc: DatabaseError) -> JSONResponse:
    """Handle generic SQLAlchemy database exceptions."""
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=_error_payload(request, "Database operation failed"),
    )


async def integrity_exception_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    """Handle SQL integrity exceptions."""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=_error_payload(request, "Database integrity constraint violated"),
    )


async def operational_exception_handler(request: Request, exc: OperationalError) -> JSONResponse:
    """Handle SQL operational exceptions."""
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=_error_payload(request, "Database is unavailable"),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_payload(request, "Internal server error"),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register centralized exception handlers on a FastAPI app."""
    app.add_exception_handler(ApplicationError, application_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_exception_handler)
    app.add_exception_handler(OperationalError, operational_exception_handler)
    app.add_exception_handler(DatabaseError, database_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
