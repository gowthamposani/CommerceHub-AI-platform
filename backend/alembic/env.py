"""Alembic environment configuration."""

from __future__ import annotations

from logging.config import fileConfig
from pathlib import Path
import sys

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine.url import make_url
from sqlalchemy.exc import OperationalError

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.database.base import Base  # noqa: E402
import app.models  # noqa: F401,E402 - ensure model registration

config = context.config
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name and config.file_config.has_section("loggers"):
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _database_location() -> str:
    """Return a safe human-readable database location for error messages."""

    url = make_url(settings.database_url)
    host = url.host or "localhost"
    port = f":{url.port}" if url.port else ""
    database = f"/{url.database}" if url.database else ""
    return f"{host}{port}{database}"


def run_migrations_offline() -> None:
    """Run migrations without a database connection."""

    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section) or {},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    try:
        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                compare_type=True,
                compare_server_default=True,
            )

            with context.begin_transaction():
                context.run_migrations()
    except OperationalError as exc:
        raise SystemExit(
            f"Unable to connect to PostgreSQL at {_database_location()}. "
            "Start the database or update DATABASE_URL in backend/.env, then rerun "
            "`alembic upgrade head`."
        ) from exc


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
