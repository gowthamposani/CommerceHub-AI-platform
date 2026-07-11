"""Redis integration package."""

from app.redis.health import check_redis

__all__ = ["check_redis"]
