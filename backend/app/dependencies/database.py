"""Database dependency providers."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_async_session


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a request-scoped async database session."""
    async for session in get_async_session():
        yield session
