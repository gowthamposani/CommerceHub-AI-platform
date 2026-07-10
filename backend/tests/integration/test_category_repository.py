"""Category repository integration tests."""

from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.category import CategoryRepository


def build_category(**overrides: object) -> Category:
    """Build a valid category ORM entity for repository tests."""
    suffix = uuid4().hex[:8]
    values: dict[str, object] = {
        "category_name": f"Repository Category {suffix}",
        "category_slug": f"repository-category-{suffix}",
        "description": "Repository integration test category",
        "image_url": "https://example.com/category.png",
        "display_order": 10,
        "is_active": True,
        "status": "active",
    }
    values.update(overrides)
    return Category(**values)


@pytest.mark.anyio
async def test_category_repository_rollback_removes_uncommitted_create(db_session: AsyncSession) -> None:
    """Uncommitted category creation can be rolled back safely."""
    repository = CategoryRepository(db_session)
    category = await repository.create(build_category(category_name="Rollback Category", category_slug="rollback-category"))
    category_id = category.id

    await db_session.rollback()

    assert await repository.get_active_by_id(category_id) is None


@pytest.mark.anyio
async def test_category_repository_soft_delete_persists_state(db_session: AsyncSession) -> None:
    """Soft delete persists lifecycle fields and hides category from active reads."""
    repository = CategoryRepository(db_session)
    category = await repository.create(build_category(category_name="Delete Category", category_slug="delete-category"))
    await db_session.commit()

    deleted_category = await repository.soft_delete(category)
    await db_session.commit()

    stored = await db_session.get(Category, category.id)
    assert stored is not None
    assert deleted_category.is_deleted is True
    assert stored.is_deleted is True
    assert stored.deleted_at is not None
    assert stored.is_active is False
    assert stored.status == "deleted"
    assert await repository.get_active_by_id(category.id) is None


@pytest.mark.anyio
async def test_category_repository_child_lookup(db_session: AsyncSession) -> None:
    """Repository can retrieve parent and child categories."""
    repository = CategoryRepository(db_session)
    parent = await repository.create(build_category(category_name="Parent Repository", category_slug="parent-repository"))
    child = await repository.create(
        build_category(
            category_name="Child Repository",
            category_slug="child-repository",
            parent_category_id=parent.id,
        )
    )
    await db_session.commit()

    parents = await repository.get_parent_categories()
    children = await repository.get_child_categories(parent.id)

    assert parent.id in {item.id for item in parents}
    assert [item.id for item in children] == [child.id]
