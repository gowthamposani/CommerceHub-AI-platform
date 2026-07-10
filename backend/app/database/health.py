"""Database health utilities."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def check_database(session: AsyncSession) -> dict[str, object]:
    """Check database connectivity with a lightweight query."""
    try:
        await session.execute(text("SELECT 1"))
        return {"healthy": True, "message": "Database connection successful"}
    except Exception as exc:
        return {"healthy": False, "message": str(exc)}
