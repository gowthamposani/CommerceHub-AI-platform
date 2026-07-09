"""Integration contract tests for the backend foundation."""

from app.celery_app import celery_app
from app.config.settings import get_settings
from app.main import create_app


def test_settings_accepts_comma_separated_env_lists(monkeypatch) -> None:
    """Settings should support comma-separated values for list fields from environment variables."""
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret")
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080")
    monkeypatch.setenv("ALLOWED_HOSTS", "localhost,127.0.0.1")

    get_settings.cache_clear()
    settings = get_settings()

    assert settings.allowed_origins == ["http://localhost:3000", "http://localhost:8080"]
    assert settings.allowed_hosts == ["localhost", "127.0.0.1"]

    get_settings.cache_clear()


def test_application_configuration_loads() -> None:
    """Settings expose application integration values."""
    settings = get_settings()

    assert settings.app_name == "CommerceHub AI"
    assert settings.api_v1_prefix == "/api/v1"
    assert settings.redis_url
    assert settings.celery_broker_url


def test_fastapi_app_registers_openapi() -> None:
    """FastAPI app exposes OpenAPI metadata."""
    app = create_app()

    assert app.title == "CommerceHub AI"
    assert app.openapi_url == "/openapi.json"


def test_celery_app_configured() -> None:
    """Celery app is configured without business tasks."""
    assert celery_app.main == "commercehub_ai"
    assert celery_app.conf.task_default_queue == "commercehub"
