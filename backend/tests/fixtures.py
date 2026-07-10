"""Reusable enterprise pytest fixtures for backend tests."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any
from unittest.mock import MagicMock

import pytest
from backend.app.main import app as fastapi_app
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture()
def app_instance() -> FastAPI:
    """Return the FastAPI application instance under test."""
    return fastapi_app


@pytest.fixture()
def dependency_overrides(app_instance: FastAPI) -> Generator[dict[Any, Any], None, None]:
    """Provide isolated FastAPI dependency overrides for a test."""
    original_overrides = dict(app_instance.dependency_overrides)
    app_instance.dependency_overrides.clear()

    try:
        yield app_instance.dependency_overrides
    finally:
        app_instance.dependency_overrides.clear()
        app_instance.dependency_overrides.update(original_overrides)


@pytest.fixture()
def api_client(
    app_instance: FastAPI,
    dependency_overrides: dict[Any, Any],
) -> Generator[TestClient, None, None]:
    """Create a FastAPI TestClient with clean dependency overrides."""
    with TestClient(app_instance) as client:
        yield client


@pytest.fixture()
def mock_db_session() -> MagicMock:
    """Return a mock database session for repository and service tests."""
    session = MagicMock(name="MockDatabaseSession")
    session.commit = MagicMock(name="commit")
    session.rollback = MagicMock(name="rollback")
    session.close = MagicMock(name="close")
    return session
