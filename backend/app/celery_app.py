"""Celery application factory for background workers."""

from celery import Celery

from app.config.settings import get_settings


def create_celery_app() -> Celery:
    """Create the Celery application without registering business tasks."""
    settings = get_settings()
    celery_app = Celery(
        "commercehub_ai",
        broker=settings.celery_broker_url,
        backend=settings.celery_result_backend,
        include=[],
    )
    celery_app.conf.update(
        task_default_queue=settings.celery_task_default_queue,
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        task_time_limit=settings.celery_task_time_limit_seconds,
        task_soft_time_limit=settings.celery_task_soft_time_limit_seconds,
        worker_send_task_events=True,
        task_send_sent_event=True,
    )
    return celery_app


celery_app = create_celery_app()
