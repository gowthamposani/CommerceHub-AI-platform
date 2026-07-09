"""Redis health checks."""

import asyncio

from app.redis.client import get_redis_client


async def check_redis(url: str) -> dict[str, object]:
    """Check Redis connectivity using PING."""
    client = get_redis_client(url)
    try:
        await asyncio.wait_for(client.ping(), timeout=2.0)
        return {"healthy": True, "configured": True, "message": "Redis connection successful"}
    except Exception as exc:
        return {"healthy": False, "configured": bool(url), "message": str(exc)}
    finally:
        await client.aclose()

