"""Project configuration."""

from functools import lru_cache
from json import JSONDecodeError, loads
from typing import Annotated, Any, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CommerceHub AI Platform"
    app_version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/commercehub"
    )
    jwt_secret_key: str = Field(default="change-me-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    token_issuer: Optional[str] = "commercehub-ai"
    token_audience: Optional[str] = "commercehub-web"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"]
    )
    sqlalchemy_echo: bool = False

    @field_validator("debug", "sqlalchemy_echo", mode="before")
    @classmethod
    def parse_bool_flags(cls, value: Any) -> bool:
        """Accept common boolean flags and treat release-style shell values as false."""

        if isinstance(value, bool):
            return value
        if value is None:
            return False
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "y", "t", "debug"}:
                return True
            if normalized in {"0", "false", "no", "off", "n", "f", "release", "production", "prod"}:
                return False
            return False
        return bool(value)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str]:
        """Allow comma-separated or list-based CORS origins."""

        if value is None:
            return []
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("[") and stripped.endswith("]"):
                try:
                    parsed = loads(stripped)
                except JSONDecodeError:
                    parsed = None
                if isinstance(parsed, list):
                    return [str(origin).strip() for origin in parsed if str(origin).strip()]
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return list(value)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached settings object."""

    return Settings()


settings = get_settings()
