"""Redis client factory."""

from app.config.settings import get_settings
from redis.asyncio import Redis


def get_redis_client(url: str | None = None) -> Redis:
    """Create a Redis client from the configured URL."""
    settings = get_settings()
    return Redis.from_url(url or settings.redis_url, decode_responses=True)
