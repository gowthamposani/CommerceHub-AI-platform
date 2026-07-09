"""Product repository for database access."""

from uuid import UUID

from sqlalchemy import Select, exists, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.pagination import Page, PaginationParams, build_page
from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product
from app.models.product_extension import ProductTag, ProductVariant
from app.models.seller import Seller
from app.repositories.base import BaseRepository
from app.schemas.product import ProductFilter


class ProductRepository(BaseRepository[Product]):
    """Repository for product persistence operations."""

    model = Product

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, product: Product) -> Product:
        """Persist a product."""
        return await self.add(product)

    async def get_active_by_id(self, product_id: UUID) -> Product | None:
        """Get a non-deleted product by ID."""
        result = await self.session.execute(
            self._with_relationships().where(Product.id == product_id, Product.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str, exclude_id: UUID | None = None) -> Product | None:
        """Get a non-deleted product by SKU."""
        statement = select(Product).where(Product.sku == sku.upper(), Product.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Product.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_barcode(self, barcode: str, exclude_id: UUID | None = None) -> Product | None:
        """Get a non-deleted product by barcode."""
        statement = select(Product).where(Product.barcode == barcode, Product.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Product.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_slug(self, product_slug: str, exclude_id: UUID | None = None) -> Product | None:
        """Get a non-deleted product by slug."""
        statement = select(Product).where(Product.product_slug == product_slug, Product.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Product.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_products(
        self,
        params: PaginationParams,
        filters: ProductFilter,
        search: str | None = None,
        sort_by: str | None = None,
        sort_direction: str = "desc",
    ) -> Page[Product]:
        """List products with search, filtering, sorting, and pagination."""
        statement = self._filtered_statement(filters, search)
        statement = self._apply_sort(statement, sort_by, sort_direction)

        count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
        total_items = await self.session.scalar(count_statement) or 0
        result = await self.session.execute(
            statement.options(selectinload(Product.seller), selectinload(Product.category), selectinload(Product.brand))
            .offset(params.offset)
            .limit(params.limit)
        )
        return build_page(list(result.scalars().unique().all()), total_items, params)

    async def update(self, product: Product) -> Product:
        """Flush product updates."""
        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def soft_delete(self, product: Product) -> Product:
        """Soft delete a product."""
        product.mark_deleted()
        product.is_active = False
        product.status = "deleted"
        return await self.update(product)

    async def publish(self, product: Product) -> Product:
        """Flush a published product."""
        return await self.update(product)

    async def unpublish(self, product: Product) -> Product:
        """Flush an unpublished product."""
        return await self.update(product)

    async def archive(self, product: Product) -> Product:
        """Flush an archived product."""
        return await self.update(product)

    def _with_relationships(self) -> Select[tuple[Product]]:
        """Return product query with display relationships eager-loaded."""
        return select(Product).options(
            selectinload(Product.seller),
            selectinload(Product.category),
            selectinload(Product.brand),
        )

    def _filtered_statement(self, filters: ProductFilter, search: str | None) -> Select[tuple[Product]]:
        """Build product list query."""
        statement = (
            select(Product)
            .join(Seller, Product.seller_id == Seller.id)
            .join(Category, Product.category_id == Category.id)
            .join(Brand, Product.brand_id == Brand.id)
            .where(Product.is_deleted.is_(False))
        )
        if filters.seller_id:
            statement = statement.where(Product.seller_id == filters.seller_id)
        if filters.category_id:
            statement = statement.where(Product.category_id == filters.category_id)
        if filters.brand_id:
            statement = statement.where(Product.brand_id == filters.brand_id)
        if filters.status:
            statement = statement.where(Product.status == filters.status.value)
        if filters.min_price is not None:
            statement = statement.where(Product.price >= filters.min_price)
        if filters.max_price is not None:
            statement = statement.where(Product.price <= filters.max_price)
        if filters.is_featured is not None:
            statement = statement.where(Product.is_featured.is_(filters.is_featured))
        if filters.is_published is not None:
            statement = statement.where(
                Product.published_at.is_not(None) if filters.is_published else Product.published_at.is_(None)
            )
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Product.product_name.ilike(pattern),
                    Product.sku.ilike(pattern),
                    Product.barcode.ilike(pattern),
                    Category.category_name.ilike(pattern),
                    Brand.brand_name.ilike(pattern),
                    Seller.business_name.ilike(pattern),
                    Product.status.ilike(pattern),
                    exists().where(
                        ProductVariant.product_id == Product.id,
                        ProductVariant.is_deleted.is_(False),
                        or_(
                            ProductVariant.sku.ilike(pattern),
                            ProductVariant.barcode.ilike(pattern),
                            ProductVariant.variant_signature.ilike(pattern),
                        ),
                    ),
                    exists().where(
                        ProductTag.product_id == Product.id,
                        ProductTag.is_deleted.is_(False),
                        ProductTag.tag_name.ilike(pattern),
                    ),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[Product]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[Product]]:
        """Apply safe sorting to product list query."""
        allowed_sort_columns = {
            "newest": Product.created_at,
            "oldest": Product.created_at,
            "created_at": Product.created_at,
            "price": Product.price,
            "name": Product.product_name,
            "product_name": Product.product_name,
            "popularity": Product.created_at,
            "status": Product.status,
        }
        normalized_sort = sort_by or "newest"
        column = allowed_sort_columns.get(normalized_sort, Product.created_at)
        if normalized_sort == "oldest":
            return statement.order_by(column.asc())
        if sort_direction == "asc":
            return statement.order_by(column.asc())
        return statement.order_by(column.desc())
