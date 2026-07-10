"""Seller database contract tests."""

from sqlalchemy import inspect

from app.database.base import Base
from app.models.seller import Seller


def test_seller_table_registered_with_metadata() -> None:
    """Seller table is registered on SQLAlchemy metadata."""
    assert "sellers" in Base.metadata.tables
    assert Seller.__tablename__ == "sellers"


def test_seller_table_constraints_and_indexes() -> None:
    """Seller table exposes required constraints and indexes."""
    table = Seller.__table__
    unique_constraints = {constraint.name for constraint in table.constraints if constraint.name}
    indexes = {index.name for index in table.indexes}
    columns = {column.name for column in table.columns}

    assert {"id", "user_id", "created_at", "updated_at", "deleted_at", "is_deleted"}.issubset(columns)
    assert "uq_sellers_gst_number" in unique_constraints
    assert "uq_sellers_pan_number" in unique_constraints
    assert "uq_sellers_business_email" in unique_constraints
    assert "ix_sellers_business_name" in indexes
    assert "ix_sellers_gst_number" in indexes
    assert "ix_sellers_pan_number" in indexes
    assert "ix_sellers_business_email" in indexes
    assert "ix_sellers_status" in indexes


def test_seller_soft_delete_fields() -> None:
    """Seller model supports soft delete fields."""
    mapper = inspect(Seller)
    column_names = {column.key for column in mapper.columns}

    assert "deleted_at" in column_names
    assert "is_deleted" in column_names

