"""Brand repository for database access."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams, build_page
from app.models.brand import Brand
from app.repositories.base import BaseRepository
from app.schemas.brand import BrandFilter


class BrandRepository(BaseRepository[Brand]):
    """Repository for brand persistence operations."""

    model = Brand

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, brand: Brand) -> Brand:
        """Persist a brand."""
        return await self.add(brand)

    async def get_active_by_id(self, brand_id: UUID) -> Brand | None:
        """Get a non-deleted brand by ID."""
        result = await self.session.execute(select(Brand).where(Brand.id == brand_id, Brand.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def get_by_name(self, brand_name: str, exclude_id: UUID | None = None) -> Brand | None:
        """Get a non-deleted brand by case-insensitive name."""
        statement = select(Brand).where(
            func.lower(Brand.brand_name) == brand_name.lower(),
            Brand.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(Brand.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, brand_slug: str, exclude_id: UUID | None = None) -> Brand | None:
        """Get a non-deleted brand by slug."""
        statement = select(Brand).where(Brand.brand_slug == brand_slug, Brand.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Brand.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_brands(
        self,
        params: PaginationParams,
        filters: BrandFilter,
        search: str | None = None,
        sort_by: str | None = None,
        sort_direction: str = "asc",
    ) -> Page[Brand]:
        """List brands with search, filtering, sorting, and pagination."""
        statement = self._filtered_statement(filters, search)
        statement = self._apply_sort(statement, sort_by, sort_direction)

        count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
        total_items = await self.session.scalar(count_statement) or 0
        result = await self.session.execute(statement.offset(params.offset).limit(params.limit))
        return build_page(list(result.scalars().all()), total_items, params)

    async def update(self, brand: Brand) -> Brand:
        """Flush brand updates."""
        await self.session.flush()
        await self.session.refresh(brand)
        return brand

    async def soft_delete(self, brand: Brand) -> Brand:
        """Soft delete a brand."""
        brand.mark_deleted()
        brand.is_active = False
        brand.status = "deleted"
        return await self.update(brand)

    async def activate(self, brand: Brand) -> Brand:
        """Activate a brand."""
        brand.is_active = True
        brand.status = "active"
        return await self.update(brand)

    async def deactivate(self, brand: Brand) -> Brand:
        """Deactivate a brand."""
        brand.is_active = False
        brand.status = "inactive"
        return await self.update(brand)

    def _filtered_statement(self, filters: BrandFilter, search: str | None) -> Select[tuple[Brand]]:
        """Build brand list query."""
        statement = select(Brand).where(Brand.is_deleted.is_(False))
        if filters.status:
            statement = statement.where(Brand.status == filters.status.value)
        if filters.is_active is not None:
            statement = statement.where(Brand.is_active.is_(filters.is_active))
        if filters.country_of_origin:
            statement = statement.where(Brand.country_of_origin.ilike(f"%{filters.country_of_origin}%"))
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Brand.brand_name.ilike(pattern),
                    Brand.brand_slug.ilike(pattern),
                    Brand.description.ilike(pattern),
                    Brand.country_of_origin.ilike(pattern),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[Brand]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[Brand]]:
        """Apply safe sorting to brand list query."""
        allowed_sort_columns = {
            "brand_name": Brand.brand_name,
            "brand_slug": Brand.brand_slug,
            "status": Brand.status,
            "created_at": Brand.created_at,
            "updated_at": Brand.updated_at,
            "country_of_origin": Brand.country_of_origin,
            "founded_year": Brand.founded_year,
        }
        column = allowed_sort_columns.get(sort_by or "created_at", Brand.created_at)
        return statement.order_by(column.desc() if sort_direction == "desc" else column.asc())
