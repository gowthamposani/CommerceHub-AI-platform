"""Category database contract tests."""

from sqlalchemy import inspect

from app.database.base import Base
from app.models.category import Category


def test_category_table_registered_with_metadata() -> None:
    """Category table is registered on SQLAlchemy metadata."""
    assert "categories" in Base.metadata.tables
    assert Category.__tablename__ == "categories"


def test_category_table_constraints_indexes_and_relationships() -> None:
    """Category table exposes required constraints, indexes, and self-reference."""
    table = Category.__table__
    unique_constraints = {constraint.name for constraint in table.constraints if constraint.name}
    indexes = {index.name for index in table.indexes}
    columns = {column.name for column in table.columns}
    foreign_keys = {fk.parent.name: fk.column.table.name for fk in table.foreign_keys}

    assert {"id", "parent_category_id", "created_at", "updated_at", "deleted_at", "is_deleted"}.issubset(columns)
    assert foreign_keys["parent_category_id"] == "categories"
    assert "uq_categories_category_name" in unique_constraints
    assert "uq_categories_category_slug" in unique_constraints
    assert "ck_categories_display_order_non_negative" in unique_constraints
    assert "ix_categories_category_name" in indexes
    assert "ix_categories_category_slug" in indexes
    assert "ix_categories_parent_category_id" in indexes
    assert "ix_categories_status" in indexes


def test_category_soft_delete_fields() -> None:
    """Category model supports soft delete fields."""
    mapper = inspect(Category)
    column_names = {column.key for column in mapper.columns}

    assert "deleted_at" in column_names
    assert "is_deleted" in column_names
