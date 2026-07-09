"""Database session configuration."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import settings


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db_session() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy session without creating tables or models."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
