"""Category repository for database access."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams, build_page
from app.models.category import Category
from app.repositories.base import BaseRepository
from app.schemas.category import CategoryFilter


class CategoryRepository(BaseRepository[Category]):
    """Repository for category persistence operations."""

    model = Category

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, category: Category) -> Category:
        """Persist a category."""
        return await self.add(category)

    async def get_active_by_id(self, category_id: UUID) -> Category | None:
        """Get a non-deleted category by ID."""
        result = await self.session.execute(
            select(Category).where(Category.id == category_id, Category.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, category_name: str, exclude_id: UUID | None = None) -> Category | None:
        """Get a non-deleted category by case-insensitive name."""
        statement = select(Category).where(
            func.lower(Category.category_name) == category_name.lower(),
            Category.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(Category.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, category_slug: str, exclude_id: UUID | None = None) -> Category | None:
        """Get a non-deleted category by slug."""
        statement = select(Category).where(Category.category_slug == category_slug, Category.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Category.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_categories(
        self,
        params: PaginationParams,
        filters: CategoryFilter,
        search: str | None = None,
        sort_by: str | None = None,
        sort_direction: str = "asc",
    ) -> Page[Category]:
        """List categories with search, filtering, sorting, and pagination."""
        statement = self._filtered_statement(filters, search)
        statement = self._apply_sort(statement, sort_by, sort_direction)

        count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
        total_items = await self.session.scalar(count_statement) or 0
        result = await self.session.execute(statement.offset(params.offset).limit(params.limit))
        return build_page(list(result.scalars().unique().all()), total_items, params)

    async def get_parent_categories(self) -> list[Category]:
        """Return top-level active categories."""
        result = await self.session.execute(
            select(Category)
            .where(Category.parent_category_id.is_(None), Category.is_deleted.is_(False))
            .order_by(Category.display_order.asc(), Category.category_name.asc())
        )
        return list(result.scalars().unique().all())

    async def get_child_categories(self, parent_category_id: UUID) -> list[Category]:
        """Return active children for a parent category."""
        result = await self.session.execute(
            select(Category)
            .where(Category.parent_category_id == parent_category_id, Category.is_deleted.is_(False))
            .order_by(Category.display_order.asc(), Category.category_name.asc())
        )
        return list(result.scalars().unique().all())

    async def list_all_active(self) -> list[Category]:
        """Return all non-deleted categories for tree building."""
        result = await self.session.execute(
            select(Category)
            .where(Category.is_deleted.is_(False))
            .order_by(Category.display_order.asc(), Category.category_name.asc())
        )
        return list(result.scalars().unique().all())

    async def has_active_children(self, category_id: UUID) -> bool:
        """Return whether a category has non-deleted children."""
        count = await self.session.scalar(
            select(func.count())
            .select_from(Category)
            .where(Category.parent_category_id == category_id, Category.is_deleted.is_(False))
        )
        return bool(count)

    async def update(self, category: Category) -> Category:
        """Flush category updates."""
        await self.session.flush()
        await self.session.refresh(category)
        return category

    async def soft_delete(self, category: Category) -> Category:
        """Soft delete a category."""
        category.mark_deleted()
        category.is_active = False
        category.status = "deleted"
        return await self.update(category)

    async def activate(self, category: Category) -> Category:
        """Activate a category."""
        category.is_active = True
        category.status = "active"
        return await self.update(category)

    async def deactivate(self, category: Category) -> Category:
        """Deactivate a category."""
        category.is_active = False
        category.status = "inactive"
        return await self.update(category)

    def _filtered_statement(self, filters: CategoryFilter, search: str | None) -> Select[tuple[Category]]:
        """Build category list query."""
        statement = select(Category).where(Category.is_deleted.is_(False))
        if filters.parent_category_id:
            statement = statement.where(Category.parent_category_id == filters.parent_category_id)
        if filters.status:
            statement = statement.where(Category.status == filters.status.value)
        if filters.is_active is not None:
            statement = statement.where(Category.is_active.is_(filters.is_active))
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Category.category_name.ilike(pattern),
                    Category.category_slug.ilike(pattern),
                    Category.description.ilike(pattern),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[Category]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[Category]]:
        """Apply safe sorting to category list query."""
        allowed_sort_columns = {
            "category_name": Category.category_name,
            "category_slug": Category.category_slug,
            "display_order": Category.display_order,
            "status": Category.status,
            "created_at": Category.created_at,
            "updated_at": Category.updated_at,
        }
        column = allowed_sort_columns.get(sort_by or "display_order", Category.display_order)
        return statement.order_by(column.desc() if sort_direction == "desc" else column.asc())
