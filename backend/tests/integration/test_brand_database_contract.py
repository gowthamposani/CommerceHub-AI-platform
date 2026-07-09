"""Brand database contract tests."""

from sqlalchemy import inspect

from app.database.base import Base
from app.models.brand import Brand


def test_brand_table_registered_with_metadata() -> None:
    """Brand table is registered on SQLAlchemy metadata."""
    assert "brands" in Base.metadata.tables
    assert Brand.__tablename__ == "brands"


def test_brand_table_constraints_and_indexes() -> None:
    """Brand table exposes required constraints and indexes."""
    table = Brand.__table__
    named_constraints = {constraint.name for constraint in table.constraints if constraint.name}
    indexes = {index.name for index in table.indexes}
    columns = {column.name for column in table.columns}

    assert {"id", "brand_name", "brand_slug", "created_at", "updated_at", "deleted_at", "is_deleted"}.issubset(columns)
    assert "uq_brands_brand_name" in named_constraints
    assert "uq_brands_brand_slug" in named_constraints
    assert "ck_brands_founded_year_min" in named_constraints
    assert "ix_brands_brand_name" in indexes
    assert "ix_brands_status" in indexes
    assert "ix_brands_created_at" in indexes


def test_brand_soft_delete_fields() -> None:
    """Brand model supports soft delete fields."""
    mapper = inspect(Brand)
    column_names = {column.key for column in mapper.columns}

    assert "deleted_at" in column_names
    assert "is_deleted" in column_names
