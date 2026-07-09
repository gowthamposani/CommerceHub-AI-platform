"""CommerceHub AI FastAPI application entrypoint."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.router import api_router
from app.config.settings import get_settings
from app.exceptions.handlers import register_exception_handlers
from app.logging_config import configure_logging, shutdown_logger, startup_logger
from app.middleware.registry import register_middleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan for startup and shutdown hooks."""
    settings = get_settings()
    configure_logging(settings)
    startup_logger.info("application startup", extra={"environment": settings.environment})
    yield
    shutdown_logger.info("application shutdown")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Enterprise multi-vendor e-commerce backend foundation.",
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
        openapi_url=settings.openapi_url,
        lifespan=lifespan,
    )

    register_middleware(app, settings)
    register_exception_handlers(app)
    app.include_router(health_router, tags=["health"])
    app.include_router(api_router)
    Path(settings.media_storage_path).mkdir(parents=True, exist_ok=True)
    app.mount(settings.media_url_prefix, StaticFiles(directory=settings.media_storage_path), name="media")

    return app


app = create_app()
