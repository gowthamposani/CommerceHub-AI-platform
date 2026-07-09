"""Async SQLAlchemy engine, session factory, and session utilities."""

from collections.abc import AsyncGenerator, Awaitable, Callable
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import TypeVar

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.config.settings import get_settings

T = TypeVar("T")


def _engine_options() -> dict[str, object]:
    """Build engine options for the configured database backend."""
    settings = get_settings()
    options: dict[str, object] = {"echo": settings.database_echo}
    if not settings.database_url.startswith("sqlite"):
        options.update(
            {
                "pool_size": settings.database_pool_size,
                "max_overflow": settings.database_max_overflow,
                "pool_timeout": settings.database_pool_timeout,
                "pool_recycle": settings.database_pool_recycle,
                "pool_pre_ping": True,
            }
        )
    return options


@lru_cache
def get_engine() -> AsyncEngine:
    """Return the cached async SQLAlchemy engine."""
    settings = get_settings()
    return create_async_engine(settings.database_url, **_engine_options())


@lru_cache
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return the cached async session factory."""
    return async_sessionmaker(
        bind=get_engine(),
        autoflush=False,
        expire_on_commit=False,
        class_=AsyncSession,
    )


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session."""
    async with get_session_factory()() as session:
        yield session


class DatabaseSessionManager:
    """Reusable async database session manager."""

    def __init__(self, session_factory: async_sessionmaker[AsyncSession] | None = None) -> None:
        self._session_factory = session_factory

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """Yield a managed session."""
        session_factory = self._session_factory or get_session_factory()
        async with session_factory() as session:
            try:
                yield session
            finally:
                await session.close()

    @asynccontextmanager
    async def transaction(self) -> AsyncGenerator[AsyncSession, None]:
        """Yield a session inside a transaction."""
        session_factory = self._session_factory or get_session_factory()
        async with session_factory() as session:
            async with session.begin():
                yield session


async def commit(session: AsyncSession) -> None:
    """Commit the current transaction."""
    await session.commit()


async def rollback(session: AsyncSession) -> None:
    """Rollback the current transaction."""
    await session.rollback()


async def run_in_transaction(session: AsyncSession, func: Callable[[AsyncSession], Awaitable[T]]) -> T:
    """Run an async callable inside a transaction."""
    async with session.begin():
        return await func(session)
