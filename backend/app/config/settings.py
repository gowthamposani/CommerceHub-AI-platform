"""Pydantic settings and environment validation."""

import json
from functools import lru_cache
from typing import Any, Literal

from pydantic import Field, SecretStr, ValidationInfo, field_validator
from pydantic_settings import BaseSettings, EnvSettingsSource, SettingsConfigDict


class CSVEnvSettingsSource(EnvSettingsSource):
    """Parse comma-separated values for list fields without requiring JSON syntax."""

    def prepare_field_value(self, field_name: str, field: Any, value: Any, value_is_complex: bool) -> Any:
        if field_name in {"allowed_origins", "allowed_hosts"} and isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("[") and stripped.endswith("]"):
                try:
                    return json.loads(stripped)
                except json.JSONDecodeError:
                    pass
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return super().prepare_field_value(field_name, field, value, value_is_complex)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: Any,
        env_settings: Any,
        dotenv_settings: Any,
        file_secret_settings: Any,
    ) -> tuple[Any, ...]:
        """Use a custom env source so comma-separated lists parse correctly."""
        return (init_settings, CSVEnvSettingsSource(settings_cls), dotenv_settings, file_secret_settings)

    app_name: str = "CommerceHub AI"
    app_version: str = "0.1.0"
    app_description: str = "Enterprise multi-vendor e-commerce platform"
    environment: Literal["development", "testing", "production"] = "development"
    debug: bool = False
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    api_v1_prefix: str = "/api/v1"
    docs_url: str | None = "/docs"
    redoc_url: str | None = "/redoc"
    openapi_url: str | None = "/openapi.json"
    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ]
    )
    allowed_hosts: list[str] = Field(default_factory=lambda: ["localhost", "127.0.0.1", "backend", "testserver"])

    database_url: str = "postgresql+asyncpg://commercehub:commercehub@localhost:5432/commercehub"
    database_echo: bool = False
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30
    database_pool_recycle: int = 1800

    redis_url: str = "redis://localhost:6379/0"
    redis_health_timeout_seconds: float = 2.0

    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    celery_task_default_queue: str = "commercehub"
    celery_task_time_limit_seconds: int = 300
    celery_task_soft_time_limit_seconds: int = 240

    jwt_secret_key: SecretStr = SecretStr("change-me-in-environment")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    log_level: str = "INFO"
    log_json: bool = True
    log_file_enabled: bool = True
    log_file_path: str = "logs/app.log"
    log_max_bytes: int = 10_485_760
    log_backup_count: int = 5

    request_timeout_seconds: int = 30
    cors_enabled: bool = True
    gzip_enabled: bool = True
    gzip_minimum_size: int = 1000
    trusted_host_enabled: bool = True
    security_headers_enabled: bool = True

    docker_image: str = "commercehub-ai-backend"

    media_storage_path: str = "media"
    media_url_prefix: str = "/media"
    product_image_max_bytes: int = 10_485_760

    ai_provider: str = "MOCK"
    openai_api_key: SecretStr | None = None
    gemini_api_key: SecretStr | None = None

    @field_validator("allowed_origins", "allowed_hosts", mode="before")
    @classmethod
    def split_csv(cls, value: object) -> object:
        """Support comma-separated lists from environment variables."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug_flag(cls, value: object) -> object:
        """Support common environment labels accidentally passed as DEBUG."""
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "prod", "production"}:
                return False
            if normalized in {"dev", "development"}:
                return True
        return value

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_secret(cls, value: SecretStr, info: ValidationInfo) -> SecretStr:
        """Require explicit secrets outside local development and testing."""
        environment = info.data.get("environment")
        if environment == "production" and value.get_secret_value() == "change-me-in-environment":
            raise ValueError("JWT_SECRET_KEY must be set in production")
        return value

    @property
    def is_development(self) -> bool:
        """Return whether the app is running in development."""
        return self.environment == "development"

    @property
    def is_testing(self) -> bool:
        """Return whether the app is running in testing."""
        return self.environment == "testing"

    @property
    def is_production(self) -> bool:
        """Return whether the app is running in production."""
        return self.environment == "production"


class DevelopmentSettings(Settings):
    """Development configuration."""

    environment: Literal["development"] = "development"
    debug: bool = True
    database_echo: bool = False


class TestingSettings(Settings):
    """Testing configuration."""

    environment: Literal["testing"] = "testing"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///:memory:"
    log_file_enabled: bool = False


class ProductionSettings(Settings):
    """Production configuration."""

    environment: Literal["production"] = "production"
    debug: bool = False
    docs_url: str | None = None
    redoc_url: str | None = None


@lru_cache
def get_settings() -> Settings:
    """Return cached settings for dependency injection."""
    return Settings()
