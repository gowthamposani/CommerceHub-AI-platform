"""Brand service layer."""

import re
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams
from app.exceptions.base import ApplicationError
from app.models.brand import Brand
from app.repositories.brand import BrandRepository
from app.schemas.brand import BrandCreate, BrandFilter, BrandUpdate

SLUG_SANITIZER = re.compile(r"[^a-z0-9]+")


class BrandService:
    """Business logic for Brand Management."""

    def __init__(self, session: AsyncSession, repository: BrandRepository | None = None) -> None:
        self.session = session
        self.repository = repository or BrandRepository(session)

    async def create_brand(self, payload: BrandCreate) -> Brand:
        """Create a brand after validating uniqueness."""
        brand_slug = payload.brand_slug or await self._generate_unique_slug(payload.brand_name)
        await self._validate_unique_fields(payload.brand_name, brand_slug)

        data = payload.model_dump()
        data["brand_slug"] = brand_slug
        data["logo_url"] = str(payload.logo_url) if payload.logo_url else None
        data["website"] = str(payload.website) if payload.website else None
        data["status"] = "active"
        data["is_active"] = True

        brand = Brand(**data)
        await self.repository.create(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def get_brand(self, brand_id: UUID) -> Brand:
        """Get a brand by ID or raise 404."""
        brand = await self.repository.get_active_by_id(brand_id)
        if brand is None:
            raise ApplicationError("Brand not found", status_code=status.HTTP_404_NOT_FOUND)
        return brand

    async def list_brands(
        self,
        params: PaginationParams,
        filters: BrandFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Brand]:
        """List brands with filters, search, sorting, and pagination."""
        return await self.repository.list_brands(params, filters, search, sort_by, sort_direction)

    async def update_brand(self, brand_id: UUID, payload: BrandUpdate) -> Brand:
        """Update brand details after uniqueness validation."""
        brand = await self.get_brand(brand_id)
        update_data = payload.model_dump(exclude_unset=True)

        next_name = update_data.get("brand_name")
        if isinstance(next_name, str):
            await self._validate_unique_name(next_name, exclude_id=brand_id)

        next_slug = update_data.get("brand_slug")
        if isinstance(next_slug, str):
            await self._validate_unique_slug(next_slug, exclude_id=brand_id)

        for key, value in update_data.items():
            if key in {"logo_url", "website"} and value is not None:
                value = str(value)
            setattr(brand, key, value)

        await self.repository.update(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def activate_brand(self, brand_id: UUID) -> Brand:
        """Activate a brand."""
        brand = await self.get_brand(brand_id)
        await self.repository.activate(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def deactivate_brand(self, brand_id: UUID) -> Brand:
        """Deactivate a brand."""
        brand = await self.get_brand(brand_id)
        await self.repository.deactivate(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def soft_delete_brand(self, brand_id: UUID) -> Brand:
        """Soft delete a brand."""
        brand = await self.get_brand(brand_id)
        await self.repository.soft_delete(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def _validate_unique_fields(self, brand_name: str, brand_slug: str) -> None:
        """Validate brand unique fields."""
        await self._validate_unique_name(brand_name)
        await self._validate_unique_slug(brand_slug)

    async def _validate_unique_name(self, brand_name: str, exclude_id: UUID | None = None) -> None:
        """Validate brand name uniqueness."""
        if await self.repository.get_by_name(brand_name, exclude_id=exclude_id):
            raise ApplicationError("Brand name already exists", status_code=status.HTTP_409_CONFLICT)

    async def _validate_unique_slug(self, brand_slug: str, exclude_id: UUID | None = None) -> None:
        """Validate brand slug uniqueness."""
        if await self.repository.get_by_slug(brand_slug, exclude_id=exclude_id):
            raise ApplicationError("Brand slug already exists", status_code=status.HTTP_409_CONFLICT)

    async def _generate_unique_slug(self, brand_name: str) -> str:
        """Generate a unique slug from brand name."""
        base_slug = SLUG_SANITIZER.sub("-", brand_name.strip().lower()).strip("-") or "brand"
        slug = base_slug
        counter = 2
        while await self.repository.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug
