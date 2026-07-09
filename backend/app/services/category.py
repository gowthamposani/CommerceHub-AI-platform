"""Category service layer."""

import re
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams
from app.exceptions.base import ApplicationError
from app.models.category import Category
from app.repositories.category import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryFilter,
    CategoryResponse,
    CategoryTreeResponse,
    CategoryUpdate,
)

SLUG_SANITIZER = re.compile(r"[^a-z0-9]+")


class CategoryService:
    """Business logic for Category Management."""

    def __init__(self, session: AsyncSession, repository: CategoryRepository | None = None) -> None:
        self.session = session
        self.repository = repository or CategoryRepository(session)

    async def create_category(self, payload: CategoryCreate) -> Category:
        """Create a category after validating uniqueness and parent existence."""
        category_slug = payload.category_slug or await self._generate_unique_slug(payload.category_name)
        await self._validate_unique_fields(payload.category_name, category_slug)
        if payload.parent_category_id:
            await self._require_parent(payload.parent_category_id)

        data = payload.model_dump()
        data["category_slug"] = category_slug
        data["image_url"] = str(payload.image_url) if payload.image_url else None
        data["status"] = "active"
        data["is_active"] = True

        category = Category(**data)
        await self.repository.create(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def get_category(self, category_id: UUID) -> Category:
        """Get a category by ID or raise 404."""
        category = await self.repository.get_active_by_id(category_id)
        if category is None:
            raise ApplicationError("Category not found", status_code=status.HTTP_404_NOT_FOUND)
        return category

    async def list_categories(
        self,
        params: PaginationParams,
        filters: CategoryFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Category]:
        """List categories with filters, search, sorting, and pagination."""
        return await self.repository.list_categories(params, filters, search, sort_by, sort_direction)

    async def get_category_tree(self) -> list[CategoryTreeResponse]:
        """Build a hierarchical tree of non-deleted categories."""
        categories = await self.repository.list_all_active()
        children_by_parent: dict[UUID | None, list[Category]] = {}
        for category in categories:
            children_by_parent.setdefault(category.parent_category_id, []).append(category)

        def build_node(category: Category) -> CategoryTreeResponse:
            category_data = CategoryResponse.model_validate(category).model_dump()
            return CategoryTreeResponse(
                **category_data,
                children=[build_node(child) for child in children_by_parent.get(category.id, [])],
            )

        return [build_node(category) for category in children_by_parent.get(None, [])]

    async def update_category(self, category_id: UUID, payload: CategoryUpdate) -> Category:
        """Update category details after hierarchy and uniqueness validation."""
        category = await self.get_category(category_id)
        update_data = payload.model_dump(exclude_unset=True)

        next_name = update_data.get("category_name")
        if isinstance(next_name, str):
            await self._validate_unique_name(next_name, exclude_id=category_id)

        next_slug = update_data.get("category_slug")
        if isinstance(next_slug, str):
            await self._validate_unique_slug(next_slug, exclude_id=category_id)

        if "parent_category_id" in update_data:
            parent_category_id = update_data["parent_category_id"]
            if parent_category_id is not None:
                await self._validate_parent_update(category_id, parent_category_id)

        for key, value in update_data.items():
            if key == "image_url" and value is not None:
                value = str(value)
            setattr(category, key, value)

        await self.repository.update(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def activate_category(self, category_id: UUID) -> Category:
        """Activate a category."""
        category = await self.get_category(category_id)
        if category.parent_category_id:
            parent = await self.get_category(category.parent_category_id)
            if not parent.is_active:
                raise ApplicationError(
                    "Cannot activate a category with an inactive parent",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        await self.repository.activate(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def deactivate_category(self, category_id: UUID) -> Category:
        """Deactivate a category."""
        category = await self.get_category(category_id)
        await self.repository.deactivate(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def soft_delete_category(self, category_id: UUID) -> Category:
        """Soft delete a category when it has no active child categories."""
        category = await self.get_category(category_id)
        if await self.repository.has_active_children(category_id):
            raise ApplicationError(
                "Cannot delete a category with child categories",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        await self.repository.soft_delete(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def _validate_unique_fields(self, category_name: str, category_slug: str) -> None:
        """Validate category unique fields."""
        await self._validate_unique_name(category_name)
        await self._validate_unique_slug(category_slug)

    async def _validate_unique_name(self, category_name: str, exclude_id: UUID | None = None) -> None:
        """Validate category name uniqueness."""
        if await self.repository.get_by_name(category_name, exclude_id=exclude_id):
            raise ApplicationError("Category name already exists", status_code=status.HTTP_409_CONFLICT)

    async def _validate_unique_slug(self, category_slug: str, exclude_id: UUID | None = None) -> None:
        """Validate category slug uniqueness."""
        if await self.repository.get_by_slug(category_slug, exclude_id=exclude_id):
            raise ApplicationError("Category slug already exists", status_code=status.HTTP_409_CONFLICT)

    async def _require_parent(self, parent_category_id: UUID) -> Category:
        """Return parent category or raise 404."""
        parent = await self.repository.get_active_by_id(parent_category_id)
        if parent is None:
            raise ApplicationError("Parent category not found", status_code=status.HTTP_404_NOT_FOUND)
        return parent

    async def _validate_parent_update(self, category_id: UUID, parent_category_id: UUID) -> None:
        """Validate parent assignment and prevent circular hierarchy."""
        if parent_category_id == category_id:
            raise ApplicationError("Category cannot be its own parent", status_code=status.HTTP_400_BAD_REQUEST)
        parent = await self._require_parent(parent_category_id)
        visited = {category_id}
        while parent.parent_category_id is not None:
            if parent.parent_category_id in visited:
                raise ApplicationError(
                    "Circular category hierarchy is not allowed",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            visited.add(parent.parent_category_id)
            parent = await self._require_parent(parent.parent_category_id)

    async def _generate_unique_slug(self, category_name: str) -> str:
        """Generate a unique slug from category name."""
        base_slug = SLUG_SANITIZER.sub("-", category_name.strip().lower()).strip("-") or "category"
        slug = base_slug
        counter = 2
        while await self.repository.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug
