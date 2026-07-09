"""FastAPI application startup configuration."""

from __future__ import annotations

from fastapi import FastAPI

from backend.app.api.admin.routes import router as admin_router
from backend.app.api.ai.routes import router as ai_router
from backend.app.core.config import settings
from backend.app.core.exceptions import register_exception_handlers
from backend.app.core.logging import configure_logging


configure_logging()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

register_exception_handlers(app)

app.include_router(admin_router)
app.include_router(ai_router)


@app.get(
    "/health",
    tags=["Health"],
    summary="Application health check",
)
def health() -> dict[str, str]:
    """Return API health status."""
    return {"status": "healthy"}
