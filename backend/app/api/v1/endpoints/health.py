"""Application health check endpoints."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import StandardResponse
from app.config.settings import Settings, get_settings
from app.database.health import check_database
from app.dependencies.database import get_db_session
from app.redis.health import check_redis
from app.utils.datetime import utc_now

router = APIRouter()


@router.get("/health", response_model=StandardResponse[dict[str, object]])
async def health(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> StandardResponse[dict[str, object]]:
    """Return basic application health."""
    return StandardResponse.success_response(
        message="Application is healthy",
        data={
            "status": "healthy",
            "environment": settings.environment,
            "version": settings.app_version,
            "timestamp": utc_now(),
        },
        request_id=getattr(request.state, "request_id", None),
    )


@router.get("/health/live", response_model=StandardResponse[dict[str, object]])
async def liveness(request: Request) -> StandardResponse[dict[str, object]]:
    """Return liveness status for orchestrators."""
    return StandardResponse.success_response(
        message="Application is live",
        data={"status": "live", "timestamp": utc_now()},
        request_id=getattr(request.state, "request_id", None),
    )


@router.get("/health/ready", response_model=StandardResponse[dict[str, object]])
async def readiness(
    request: Request,
    session: AsyncSession = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> StandardResponse[dict[str, object]]:
    """Return readiness status after validating required dependencies."""
    database_status = await check_database(session)
    redis_status = await check_redis(settings.redis_url)
    ready = bool(database_status["healthy"]) and bool(redis_status["healthy"])

    return StandardResponse.success_response(
        message="Application is ready" if ready else "Application is not ready",
        data={
            "status": "ready" if ready else "not_ready",
            "database": database_status,
            "redis": redis_status,
            "celery": {
                "configured": bool(settings.celery_broker_url and settings.celery_result_backend),
                "broker": "redis",
            },
            "application": {"healthy": True},
            "timestamp": utc_now(),
        },
        request_id=getattr(request.state, "request_id", None),
    )
