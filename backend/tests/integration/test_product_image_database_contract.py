"""Product image database contract tests."""

from sqlalchemy import inspect

from app.database.base import Base
from app.models.product_image import ProductImage


def test_product_image_table_registered_with_metadata() -> None:
    """Product image table is registered on SQLAlchemy metadata."""
    assert "product_images" in Base.metadata.tables
    assert ProductImage.__tablename__ == "product_images"


def test_product_image_table_constraints_and_indexes() -> None:
    """Product image table exposes required constraints, foreign keys, and indexes."""
    table = ProductImage.__table__
    named_constraints = {constraint.name for constraint in table.constraints if constraint.name}
    indexes = {index.name for index in table.indexes}
    columns = {column.name for column in table.columns}
    foreign_key_targets = {fk.target_fullname for fk in table.foreign_keys}

    assert {
        "id",
        "product_id",
        "image_url",
        "display_order",
        "alt_text",
        "is_primary",
        "created_at",
        "updated_at",
        "deleted_at",
        "is_deleted",
    }.issubset(columns)
    assert "products.id" in foreign_key_targets
    assert "uq_product_images_product_hash" in named_constraints
    assert "ck_product_images_display_order_non_negative" in named_constraints
    assert "ck_product_images_max_file_size" in named_constraints
    assert "ix_product_images_product_id" in indexes
    assert "ix_product_images_display_order" in indexes
    assert "ix_product_images_is_primary" in indexes


def test_product_image_relationship_and_soft_delete_fields() -> None:
    """Product image model supports product relationship and soft delete fields."""
    mapper = inspect(ProductImage)
    column_names = {column.key for column in mapper.columns}
    relationship_names = {relationship.key for relationship in mapper.relationships}

    assert "deleted_at" in column_names
    assert "is_deleted" in column_names
    assert "product" in relationship_names
