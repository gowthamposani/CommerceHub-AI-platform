"""Application exceptions."""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers required for stable startup."""

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.exception(
            "Unhandled application exception.",
            extra={"path": request.url.path},
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Internal server error.",
            },
        )
