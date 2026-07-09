"""Pytest fixtures for backend API tests."""

from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/commercehub_test",
)

os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "test-secret-key")
os.environ["JWT_ALGORITHM"] = os.getenv("JWT_ALGORITHM", "HS256")
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")
os.environ["TOKEN_ISSUER"] = os.getenv("TOKEN_ISSUER", "test-commercehub")
os.environ["TOKEN_AUDIENCE"] = os.getenv("TOKEN_AUDIENCE", "test-commercehub-web")
os.environ["DEBUG"] = "false"
os.environ["SQLALCHEMY_ECHO"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.database.base import Base
from app.database.session import engine
from app.main import app


@pytest.fixture()
def clean_database() -> None:
    """Rebuild the test database schema around each test."""

    engine.dispose()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def client(clean_database: None) -> TestClient:
    """Return a FastAPI test client backed by the isolated test database."""

    with TestClient(app) as test_client:
        yield test_client
