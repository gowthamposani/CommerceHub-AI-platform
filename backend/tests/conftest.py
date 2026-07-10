"""Pytest fixtures for backend API tests."""

# ruff: noqa: E402

from __future__ import annotations

import os
import sys
from decimal import Decimal
from datetime import timedelta
from pathlib import Path
from typing import Generator
from uuid import uuid4

from sqlalchemy import Column, Integer, MetaData, Numeric, String, Table, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import sessionmaker

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

from app.core.dependencies import get_db
from app.core.security import create_jwt_token
from app.database.base import Base
from app.database.session import engine
from app.main import app
from app.models.address import Address  # noqa: F401
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.wishlist import Wishlist  # noqa: F401


products_metadata = MetaData()
products_table = Table(
    "products",
    products_metadata,
    Column("id", PGUUID(as_uuid=True), primary_key=True),
    Column("title", String(255), nullable=False),
    Column("price", Numeric(12, 2), nullable=False),
    Column("stock", Integer, nullable=False),
    Column("status", String(50), nullable=False),
)

DEFAULT_CUSTOMER_EMAIL = "manasa@example.com"
DEFAULT_CUSTOMER_PASSWORD = "Pass12345"
DEFAULT_CUSTOMER_FIRST_NAME = "manasa"
DEFAULT_CUSTOMER_LAST_NAME = "manasa"

DEFAULT_SELLER_EMAIL = "seller@example.com"
DEFAULT_SELLER_PASSWORD = "Pass12345"
DEFAULT_SELLER_FIRST_NAME = "seller"
DEFAULT_SELLER_LAST_NAME = "vendor"


def _registration_payload(
    *,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    role: str,
) -> dict[str, str]:
    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password,
        "role": role,
    }


def _login_payload(*, email: str, password: str) -> dict[str, str]:
    return {"email": email, "password": password}


@pytest.fixture()
def db_connection() -> Generator:
    """Provide a PostgreSQL connection wrapped in a rollback-only transaction."""

    connection = engine.connect()
    transaction = connection.begin()
    Base.metadata.create_all(bind=connection)
    products_metadata.create_all(bind=connection)

    try:
        yield connection
    finally:
        transaction.rollback()
        connection.close()


@pytest.fixture()
def clean_database(db_connection):
    """Backward-compatible alias for the transactional database fixture."""

    yield db_connection


@pytest.fixture()
def client(db_connection) -> Generator[TestClient, None, None]:
    """Return a FastAPI client wired to the rollback-only test transaction."""

    testing_session_factory = sessionmaker(
        bind=db_connection,
        autoflush=False,
        autocommit=False,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )

    def override_get_db():
        db = testing_session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def product_catalog(db_connection) -> dict[str, dict[str, object]]:
    """Seed a small product catalog for cart, wishlist, and order tests."""

    products = {
        "tee": {
            "id": uuid4(),
            "title": "Classic Cotton Tee",
            "price": Decimal("19.99"),
            "stock": 10,
            "status": "active",
        },
        "tote": {
            "id": uuid4(),
            "title": "Canvas Tote Bag",
            "price": Decimal("24.50"),
            "stock": 5,
            "status": "active",
        },
    }

    db_connection.execute(products_table.insert(), list(products.values()))
    return products


@pytest.fixture()
def customer_session(client) -> dict[str, object]:
    """Register and authenticate a customer account."""

    register_response = client.post(
        "/api/v1/auth/register",
        json=_registration_payload(
            first_name=DEFAULT_CUSTOMER_FIRST_NAME,
            last_name=DEFAULT_CUSTOMER_LAST_NAME,
            email=DEFAULT_CUSTOMER_EMAIL,
            password=DEFAULT_CUSTOMER_PASSWORD,
            role="customer",
        ),
    )
    assert register_response.status_code == 201, register_response.text

    login_response = client.post(
        "/api/v1/auth/login",
        json=_login_payload(email=DEFAULT_CUSTOMER_EMAIL, password=DEFAULT_CUSTOMER_PASSWORD),
    )
    assert login_response.status_code == 200, login_response.text
    return login_response.json()["data"]


@pytest.fixture()
def customer_headers(customer_session: dict[str, object]) -> dict[str, str]:
    """Return bearer headers for the authenticated customer."""

    tokens = customer_session["tokens"]  # type: ignore[index]
    return {"Authorization": f"Bearer {tokens['access_token']}"}  # type: ignore[index]


@pytest.fixture()
def seller_session(client, db_connection) -> dict[str, object]:
    """Register, approve, and authenticate a seller account."""

    register_response = client.post(
        "/api/v1/auth/register",
        json=_registration_payload(
            first_name=DEFAULT_SELLER_FIRST_NAME,
            last_name=DEFAULT_SELLER_LAST_NAME,
            email=DEFAULT_SELLER_EMAIL,
            password=DEFAULT_SELLER_PASSWORD,
            role="seller",
        ),
    )
    assert register_response.status_code == 201, register_response.text
    seller = register_response.json()["data"]

    db_connection.execute(
        text("UPDATE users SET status = 'active' WHERE id = :user_id"),
        {"user_id": seller["id"]},
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json=_login_payload(email=DEFAULT_SELLER_EMAIL, password=DEFAULT_SELLER_PASSWORD),
    )
    assert login_response.status_code == 200, login_response.text
    return login_response.json()["data"]


@pytest.fixture()
def seller_headers(seller_session: dict[str, object]) -> dict[str, str]:
    """Return bearer headers for an authenticated seller."""

    tokens = seller_session["tokens"]  # type: ignore[index]
    return {"Authorization": f"Bearer {tokens['access_token']}"}  # type: ignore[index]


@pytest.fixture()
def inactive_seller_token(client) -> str:
    """Return a valid access token for a seller account that is still pending approval."""

    register_response = client.post(
        "/api/v1/auth/register",
        json=_registration_payload(
            first_name=DEFAULT_SELLER_FIRST_NAME,
            last_name=DEFAULT_SELLER_LAST_NAME,
            email=f"pending-{DEFAULT_SELLER_EMAIL}",
            password=DEFAULT_SELLER_PASSWORD,
            role="seller",
        ),
    )
    assert register_response.status_code == 201, register_response.text
    seller = register_response.json()["data"]

    token, _, _ = create_jwt_token(
        subject=str(seller["id"]),
        token_type="access",
        expires_delta=timedelta(minutes=60),
        secret_key=os.environ["JWT_SECRET_KEY"],
        algorithm=os.environ["JWT_ALGORITHM"],
        issuer=os.environ["TOKEN_ISSUER"],
        audience=os.environ["TOKEN_AUDIENCE"],
        extra_claims={
            "email": seller["email"],
            "role": seller["role"]["name"],
        },
    )
    return token
