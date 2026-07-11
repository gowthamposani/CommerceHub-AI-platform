"""Product database contract tests."""

from sqlalchemy import inspect

from app.database.base import Base
from app.models.product import Product


def test_product_table_registered_with_metadata() -> None:
    """Product table is registered on SQLAlchemy metadata."""
    assert "products" in Base.metadata.tables
    assert Product.__tablename__ == "products"


def test_product_table_constraints_and_indexes() -> None:
    """Product table exposes required constraints, foreign keys, and indexes."""
    table = Product.__table__
    named_constraints = {constraint.name for constraint in table.constraints if constraint.name}
    indexes = {index.name for index in table.indexes}
    columns = {column.name for column in table.columns}
    foreign_key_targets = {fk.target_fullname for fk in table.foreign_keys}

    assert {
        "id",
        "seller_id",
        "category_id",
        "brand_id",
        "product_name",
        "product_slug",
        "sku",
        "barcode",
        "price",
        "status",
        "created_at",
        "updated_at",
        "deleted_at",
        "is_deleted",
    }.issubset(columns)
    assert "sellers.id" in foreign_key_targets
    assert "categories.id" in foreign_key_targets
    assert "brands.id" in foreign_key_targets
    assert "uq_products_sku" in named_constraints
    assert "uq_products_barcode" in named_constraints
    assert "uq_products_product_slug" in named_constraints
    assert "ck_products_price_non_negative" in named_constraints
    assert "ck_products_discount_not_greater_than_price" in named_constraints
    assert "ck_products_tax_percentage_range" in named_constraints
    assert "ix_products_product_name" in indexes
    assert "ix_products_seller_id" in indexes
    assert "ix_products_category_id" in indexes
    assert "ix_products_brand_id" in indexes
    assert "ix_products_status" in indexes
    assert "ix_products_created_at" in indexes


def test_product_relationships_and_soft_delete_fields() -> None:
    """Product model supports relationships and soft delete fields."""
    mapper = inspect(Product)
    column_names = {column.key for column in mapper.columns}
    relationship_names = {relationship.key for relationship in mapper.relationships}

    assert "deleted_at" in column_names
    assert "is_deleted" in column_names
    assert {"seller", "category", "brand"}.issubset(relationship_names)
