"""Integration contract tests for the backend foundation."""

from app.celery_app import celery_app
from app.config.settings import get_settings
from app.main import create_app


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
