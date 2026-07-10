"""Repositories for product variants and merchandising metadata."""

from uuid import UUID

from sqlalchemy import Select, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.pagination import Page, PaginationParams, build_page
from app.models.product_extension import (
    ProductAttribute,
    ProductAttributeValue,
    ProductSeoMetadata,
    ProductSpecification,
    ProductTag,
    ProductVariant,
)
from app.repositories.base import BaseRepository


class ProductVariantRepository(BaseRepository[ProductVariant]):
    """Database operations for product variants."""

    model = ProductVariant

    async def create(self, variant: ProductVariant) -> ProductVariant:
        """Persist a variant."""
        return await self.add(variant)

    async def get_active_by_id(self, variant_id: UUID) -> ProductVariant | None:
        """Get active variant by ID."""
        result = await self.session.execute(
            select(ProductVariant)
            .options(selectinload(ProductVariant.attribute_values))
            .where(ProductVariant.id == variant_id, ProductVariant.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def list_variants(
        self,
        product_id: UUID,
        params: PaginationParams,
        search: str | None,
        status_filter: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[ProductVariant]:
        """List variants for a product."""
        statement = self._filtered_statement(product_id, search, status_filter)
        statement = self._apply_sort(statement, sort_by, sort_direction)
        total = await self.session.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
        result = await self.session.execute(
            statement.options(selectinload(ProductVariant.attribute_values)).offset(params.offset).limit(params.limit)
        )
        return build_page(list(result.scalars().unique().all()), total, params)

    async def get_by_sku(self, sku: str, exclude_id: UUID | None = None) -> ProductVariant | None:
        """Get variant by SKU."""
        statement = select(ProductVariant).where(
            ProductVariant.sku == sku.upper(),
            ProductVariant.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductVariant.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_barcode(self, barcode: str, exclude_id: UUID | None = None) -> ProductVariant | None:
        """Get variant by barcode."""
        statement = select(ProductVariant).where(
            ProductVariant.barcode == barcode,
            ProductVariant.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductVariant.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_signature(
        self,
        product_id: UUID,
        signature: str,
        exclude_id: UUID | None = None,
    ) -> ProductVariant | None:
        """Get variant by normalized attribute signature."""
        statement = select(ProductVariant).where(
            ProductVariant.product_id == product_id,
            ProductVariant.variant_signature == signature,
            ProductVariant.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductVariant.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def replace_attribute_values(
        self,
        variant: ProductVariant,
        values: list[ProductAttributeValue],
    ) -> None:
        """Replace variant attribute selections."""
        await self.session.execute(delete(ProductAttributeValue).where(ProductAttributeValue.variant_id == variant.id))
        for value in values:
            self.session.add(value)
        await self.session.flush()

    async def update(self, variant: ProductVariant) -> ProductVariant:
        """Flush variant changes."""
        await self.session.flush()
        await self.session.refresh(variant)
        return variant

    async def soft_delete(self, variant: ProductVariant) -> ProductVariant:
        """Soft delete variant."""
        variant.mark_deleted()
        variant.is_active = False
        variant.status = "archived"
        return await self.update(variant)

    def _filtered_statement(
        self,
        product_id: UUID,
        search: str | None,
        status_filter: str | None,
    ) -> Select[tuple[ProductVariant]]:
        """Build variant list query."""
        statement = select(ProductVariant).where(
            ProductVariant.product_id == product_id,
            ProductVariant.is_deleted.is_(False),
        )
        if status_filter:
            statement = statement.where(ProductVariant.status == status_filter)
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    ProductVariant.sku.ilike(pattern),
                    ProductVariant.barcode.ilike(pattern),
                    ProductVariant.variant_signature.ilike(pattern),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[ProductVariant]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[ProductVariant]]:
        """Apply variant sorting."""
        columns = {
            "sku": ProductVariant.sku,
            "price": ProductVariant.price,
            "status": ProductVariant.status,
            "created_at": ProductVariant.created_at,
            "newest": ProductVariant.created_at,
            "oldest": ProductVariant.created_at,
        }
        normalized = sort_by or "newest"
        column = columns.get(normalized, ProductVariant.created_at)
        if normalized == "oldest" or sort_direction == "asc":
            return statement.order_by(column.asc())
        return statement.order_by(column.desc())


class ProductAttributeRepository(BaseRepository[ProductAttribute]):
    """Database operations for product attributes."""

    model = ProductAttribute

    async def create(self, attribute: ProductAttribute) -> ProductAttribute:
        """Persist an attribute."""
        return await self.add(attribute)

    async def get_active_by_id(self, attribute_id: UUID) -> ProductAttribute | None:
        """Get attribute by ID."""
        result = await self.session.execute(
            select(ProductAttribute)
            .options(selectinload(ProductAttribute.values))
            .where(ProductAttribute.id == attribute_id, ProductAttribute.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        product_id: UUID,
        attribute_name: str,
        exclude_id: UUID | None = None,
    ) -> ProductAttribute | None:
        """Get attribute by product/name."""
        statement = select(ProductAttribute).where(
            ProductAttribute.product_id == product_id,
            func.lower(ProductAttribute.attribute_name) == attribute_name.lower(),
            ProductAttribute.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductAttribute.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_attributes(self, product_id: UUID) -> list[ProductAttribute]:
        """List attributes for a product."""
        result = await self.session.execute(
            select(ProductAttribute)
            .options(selectinload(ProductAttribute.values))
            .where(ProductAttribute.product_id == product_id, ProductAttribute.is_deleted.is_(False))
            .order_by(ProductAttribute.display_order.asc(), ProductAttribute.attribute_name.asc())
        )
        return list(result.scalars().unique().all())

    async def replace_values(self, attribute: ProductAttribute, values: list[ProductAttributeValue]) -> None:
        """Replace allowed values for an attribute."""
        await self.session.execute(
            delete(ProductAttributeValue).where(
                ProductAttributeValue.attribute_id == attribute.id,
                ProductAttributeValue.variant_id.is_(None),
            )
        )
        for value in values:
            self.session.add(value)
        await self.session.flush()

    async def update(self, attribute: ProductAttribute) -> ProductAttribute:
        """Flush attribute changes."""
        await self.session.flush()
        await self.session.refresh(attribute)
        return attribute

    async def soft_delete(self, attribute: ProductAttribute) -> ProductAttribute:
        """Soft delete attribute."""
        attribute.mark_deleted()
        return await self.update(attribute)


class ProductTagRepository(BaseRepository[ProductTag]):
    """Database operations for product tags."""

    model = ProductTag

    async def list_tags(self, product_id: UUID) -> list[ProductTag]:
        """List product tags."""
        result = await self.session.execute(
            select(ProductTag)
            .where(ProductTag.product_id == product_id, ProductTag.is_deleted.is_(False))
            .order_by(ProductTag.tag_name.asc())
        )
        return list(result.scalars().all())

    async def get_by_name(self, product_id: UUID, tag_name: str) -> ProductTag | None:
        """Get tag by name."""
        result = await self.session.execute(
            select(ProductTag).where(
                ProductTag.product_id == product_id,
                func.lower(ProductTag.tag_name) == tag_name.lower(),
                ProductTag.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def get_active_by_id(self, tag_id: UUID) -> ProductTag | None:
        """Get tag by ID."""
        result = await self.session.execute(
            select(ProductTag).where(
                ProductTag.id == tag_id,
                ProductTag.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def update(self, tag: ProductTag) -> ProductTag:
        """Flush tag changes."""
        await self.session.flush()
        await self.session.refresh(tag)
        return tag


class ProductSpecificationRepository(BaseRepository[ProductSpecification]):
    """Database operations for product specifications."""

    model = ProductSpecification

    async def list_specifications(self, product_id: UUID) -> list[ProductSpecification]:
        """List product specifications."""
        result = await self.session.execute(
            select(ProductSpecification)
            .where(ProductSpecification.product_id == product_id, ProductSpecification.is_deleted.is_(False))
            .order_by(ProductSpecification.display_order.asc(), ProductSpecification.specification_name.asc())
        )
        return list(result.scalars().all())

    async def get_by_name(
        self,
        product_id: UUID,
        specification_name: str,
        exclude_id: UUID | None = None,
    ) -> ProductSpecification | None:
        """Get specification by name."""
        statement = select(ProductSpecification).where(
            ProductSpecification.product_id == product_id,
            func.lower(ProductSpecification.specification_name) == specification_name.lower(),
            ProductSpecification.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductSpecification.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_active_by_id(self, specification_id: UUID) -> ProductSpecification | None:
        """Get specification by ID."""
        result = await self.session.execute(
            select(ProductSpecification).where(
                ProductSpecification.id == specification_id,
                ProductSpecification.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def update(self, specification: ProductSpecification) -> ProductSpecification:
        """Flush specification changes."""
        await self.session.flush()
        await self.session.refresh(specification)
        return specification


class ProductSeoRepository(BaseRepository[ProductSeoMetadata]):
    """Database operations for SEO metadata."""

    model = ProductSeoMetadata

    async def get_by_product_id(self, product_id: UUID) -> ProductSeoMetadata | None:
        """Get SEO metadata by product."""
        result = await self.session.execute(
            select(ProductSeoMetadata).where(
                ProductSeoMetadata.product_id == product_id,
                ProductSeoMetadata.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_friendly_url(
        self,
        friendly_url: str,
        exclude_product_id: UUID | None = None,
    ) -> ProductSeoMetadata | None:
        """Get SEO metadata by friendly URL."""
        statement = select(ProductSeoMetadata).where(
            ProductSeoMetadata.friendly_url == friendly_url,
            ProductSeoMetadata.is_deleted.is_(False),
        )
        if exclude_product_id:
            statement = statement.where(ProductSeoMetadata.product_id != exclude_product_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def update(self, metadata: ProductSeoMetadata) -> ProductSeoMetadata:
        """Flush SEO metadata changes."""
        await self.session.flush()
        await self.session.refresh(metadata)
        return metadata
