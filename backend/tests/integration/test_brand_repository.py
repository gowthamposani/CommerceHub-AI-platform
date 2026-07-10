"""Brand repository integration tests."""

from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import PaginationParams
from app.models.brand import Brand
from app.repositories.brand import BrandRepository
from app.schemas.brand import BrandFilter


def build_brand(**overrides: object) -> Brand:
    """Build a valid brand ORM entity for repository tests."""
    suffix = uuid4().hex[:8]
    values: dict[str, object] = {
        "brand_name": f"Repository Brand {suffix}",
        "brand_slug": f"repository-brand-{suffix}",
        "description": "Repository integration test brand",
        "logo_url": "https://example.com/brand.png",
        "website": "https://example.com",
        "country_of_origin": "India",
        "founded_year": 2020,
        "status": "active",
        "is_active": True,
    }
    values.update(overrides)
    return Brand(**values)


@pytest.mark.anyio
async def test_brand_repository_rollback_removes_uncommitted_create(db_session: AsyncSession) -> None:
    """Uncommitted brand creation can be rolled back safely."""
    repository = BrandRepository(db_session)
    brand = await repository.create(build_brand(brand_name="Rollback Brand", brand_slug="rollback-brand"))
    brand_id = brand.id

    await db_session.rollback()

    assert await repository.get_active_by_id(brand_id) is None


@pytest.mark.anyio
async def test_brand_repository_soft_delete_persists_state(db_session: AsyncSession) -> None:
    """Soft delete persists lifecycle fields and hides brand from active reads."""
    repository = BrandRepository(db_session)
    brand = await repository.create(build_brand(brand_name="Delete Brand", brand_slug="delete-brand"))
    await db_session.commit()

    deleted_brand = await repository.soft_delete(brand)
    await db_session.commit()

    stored = await db_session.get(Brand, brand.id)
    assert stored is not None
    assert deleted_brand.is_deleted is True
    assert stored.is_deleted is True
    assert stored.deleted_at is not None
    assert stored.is_active is False
    assert stored.status == "deleted"
    assert await repository.get_active_by_id(brand.id) is None


@pytest.mark.anyio
async def test_brand_repository_filters_sorts_and_paginates(db_session: AsyncSession) -> None:
    """Repository list query supports filter, search, sort, and pagination."""
    repository = BrandRepository(db_session)
    await repository.create(
        build_brand(brand_name="India Repository Brand", brand_slug="india-repository-brand", country_of_origin="India")
    )
    await repository.create(
        build_brand(brand_name="Japan Repository Brand", brand_slug="japan-repository-brand", country_of_origin="Japan")
    )
    await db_session.commit()

    page = await repository.list_brands(
        PaginationParams(page=1, page_size=1),
        BrandFilter(country_of_origin="Japan"),
        search="Repository",
        sort_by="country_of_origin",
        sort_direction="asc",
    )

    assert page.meta.total_items == 1
    assert page.items[0].brand_name == "Japan Repository Brand"
