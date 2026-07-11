"""Product image repository for database access."""

from uuid import UUID

from sqlalchemy import Select, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product_image import ProductImage
from app.repositories.base import BaseRepository


class ProductImageRepository(BaseRepository[ProductImage]):
    """Repository for product image persistence operations."""

    model = ProductImage

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, image: ProductImage) -> ProductImage:
        """Persist a product image."""
        return await self.add(image)

    async def get_active_by_id(self, image_id: UUID) -> ProductImage | None:
        """Get a non-deleted image by ID."""
        result = await self.session.execute(
            select(ProductImage).where(ProductImage.id == image_id, ProductImage.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_hash(
        self,
        product_id: UUID,
        image_hash: str,
        exclude_id: UUID | None = None,
    ) -> ProductImage | None:
        """Get a non-deleted image by product and hash."""
        statement = select(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.image_hash == image_hash,
            ProductImage.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductImage.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_product(self, product_id: UUID) -> list[ProductImage]:
        """List non-deleted images for a product."""
        result = await self.session.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id, ProductImage.is_deleted.is_(False))
            .order_by(ProductImage.display_order.asc(), ProductImage.created_at.asc())
        )
        return list(result.scalars().all())

    async def next_display_order(self, product_id: UUID) -> int:
        """Return the next display order for a product."""
        max_order = await self.session.scalar(
            select(func.max(ProductImage.display_order)).where(
                ProductImage.product_id == product_id,
                ProductImage.is_deleted.is_(False),
            )
        )
        return int(max_order or 0) + 1

    async def has_images(self, product_id: UUID) -> bool:
        """Return whether a product has active images."""
        count = await self.session.scalar(
            select(func.count())
            .select_from(ProductImage)
            .where(
                ProductImage.product_id == product_id,
                ProductImage.is_deleted.is_(False),
            )
        )
        return bool(count)

    async def clear_primary(self, product_id: UUID, exclude_id: UUID | None = None) -> None:
        """Clear primary flag for a product's other images."""
        statement = update(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(ProductImage.id != exclude_id)
        await self.session.execute(statement.values(is_primary=False))

    async def update(self, image: ProductImage) -> ProductImage:
        """Flush image updates."""
        await self.session.flush()
        await self.session.refresh(image)
        return image

    async def soft_delete(self, image: ProductImage) -> ProductImage:
        """Soft delete an image."""
        image.mark_deleted()
        image.is_primary = False
        return await self.update(image)

    def base_product_query(self, product_id: UUID) -> Select[tuple[ProductImage]]:
        """Return base product image query."""
        return select(ProductImage).where(ProductImage.product_id == product_id, ProductImage.is_deleted.is_(False))
