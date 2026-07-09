"""Project configuration."""

from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True, slots=True)
class Settings:
    """Runtime settings loaded from environment variables."""

    app_name: str = os.getenv("APP_NAME", "CommerceHub AI")
    environment: str = os.getenv("APP_ENV", "development")
    api_v1_prefix: str = os.getenv("API_V1_PREFIX", "/api/v1")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://commercehub:commercehub@localhost:5432/commercehub_ai",
    )


settings = Settings()
