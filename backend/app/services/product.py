"""Product service layer."""

import re
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams
from app.exceptions.base import ApplicationError
from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product
from app.models.seller import Seller
from app.repositories.brand import BrandRepository
from app.repositories.category import CategoryRepository
from app.repositories.product import ProductRepository
from app.repositories.seller import SellerRepository
from app.schemas.product import (
    ProductCreate,
    ProductFilter,
    ProductStatus,
    ProductUpdate,
    ProductVisibility,
    PublishProductRequest,
)

SLUG_SANITIZER = re.compile(r"[^a-z0-9]+")


class ProductService:
    """Business logic for Product Management."""

    def __init__(
        self,
        session: AsyncSession,
        repository: ProductRepository | None = None,
        seller_repository: SellerRepository | None = None,
        category_repository: CategoryRepository | None = None,
        brand_repository: BrandRepository | None = None,
    ) -> None:
        self.session = session
        self.repository = repository or ProductRepository(session)
        self.seller_repository = seller_repository or SellerRepository(session)
        self.category_repository = category_repository or CategoryRepository(session)
        self.brand_repository = brand_repository or BrandRepository(session)

    async def create_product(self, payload: ProductCreate) -> Product:
        """Create a product after validating relationships and unique fields."""
        await self._require_active_seller(payload.seller_id)
        await self._require_category(payload.category_id)
        await self._require_brand(payload.brand_id)
        product_slug = payload.product_slug or await self._generate_unique_slug(payload.product_name)
        await self._validate_unique_fields(payload.sku, payload.barcode, product_slug)

        data = payload.model_dump()
        data["product_slug"] = product_slug
        data["visibility"] = payload.visibility.value
        data["status"] = ProductStatus.DRAFT.value
        data["is_active"] = True

        product = Product(**data)
        await self.repository.create(product)
        await self.session.commit()
        await self.session.refresh(product)
        return await self.get_product(product.id)

    async def get_product(self, product_id: UUID) -> Product:
        """Get a product by ID or raise 404."""
        product = await self.repository.get_active_by_id(product_id)
        if product is None:
            raise ApplicationError("Product not found", status_code=status.HTTP_404_NOT_FOUND)
        return product

    async def preview_product(self, product_id: UUID) -> Product:
        """Return a product preview payload."""
        return await self.get_product(product_id)

    async def list_products(
        self,
        params: PaginationParams,
        filters: ProductFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Product]:
        """List products with filters, search, sorting, and pagination."""
        return await self.repository.list_products(params, filters, search, sort_by, sort_direction)

    async def update_product(self, product_id: UUID, payload: ProductUpdate) -> Product:
        """Update product details after business validation."""
        product = await self.get_product(product_id)
        self._ensure_editable(product)
        update_data = payload.model_dump(exclude_unset=True)

        if "seller_id" in update_data and update_data["seller_id"] is not None:
            await self._require_active_seller(update_data["seller_id"])
        if "category_id" in update_data and update_data["category_id"] is not None:
            await self._require_category(update_data["category_id"])
        if "brand_id" in update_data and update_data["brand_id"] is not None:
            await self._require_brand(update_data["brand_id"])

        if isinstance(update_data.get("sku"), str):
            await self._validate_unique_sku(update_data["sku"], exclude_id=product_id)
        if isinstance(update_data.get("barcode"), str):
            await self._validate_unique_barcode(update_data["barcode"], exclude_id=product_id)
        if isinstance(update_data.get("product_slug"), str):
            await self._validate_unique_slug(update_data["product_slug"], exclude_id=product_id)

        self._validate_effective_discount(product, update_data)
        for key, value in update_data.items():
            if key == "visibility" and isinstance(value, ProductVisibility):
                value = value.value
            setattr(product, key, value)

        await self.repository.update(product)
        await self.session.commit()
        await self.session.refresh(product)
        return await self.get_product(product.id)

    async def soft_delete_product(self, product_id: UUID) -> Product:
        """Soft delete a product."""
        product = await self.get_product(product_id)
        await self.repository.soft_delete(product)
        await self.session.commit()
        await self.session.refresh(product)
        return product

    async def publish_product(self, product_id: UUID, payload: PublishProductRequest) -> Product:
        """Publish a product unless archived or deleted."""
        product = await self.get_product(product_id)
        if product.status == ProductStatus.ARCHIVED.value:
            raise ApplicationError("Archived products cannot be published", status_code=status.HTTP_400_BAD_REQUEST)
        if product.is_deleted:
            raise ApplicationError("Deleted products cannot be published", status_code=status.HTTP_400_BAD_REQUEST)
        product.status = ProductStatus.PUBLISHED.value
        product.visibility = payload.visibility.value
        product.is_active = True
        product.published_at = datetime.now(UTC)
        await self.repository.publish(product)
        await self.session.commit()
        await self.session.refresh(product)
        return await self.get_product(product.id)

    async def unpublish_product(self, product_id: UUID) -> Product:
        """Unpublish a product."""
        product = await self.get_product(product_id)
        if product.status == ProductStatus.ARCHIVED.value:
            raise ApplicationError("Archived products cannot be unpublished", status_code=status.HTTP_400_BAD_REQUEST)
        product.status = ProductStatus.UNPUBLISHED.value
        product.visibility = ProductVisibility.PRIVATE.value
        product.published_at = None
        await self.repository.unpublish(product)
        await self.session.commit()
        await self.session.refresh(product)
        return await self.get_product(product.id)

    async def archive_product(self, product_id: UUID) -> Product:
        """Archive a product."""
        product = await self.get_product(product_id)
        product.status = ProductStatus.ARCHIVED.value
        product.visibility = ProductVisibility.HIDDEN.value
        product.is_active = False
        product.published_at = None
        await self.repository.archive(product)
        await self.session.commit()
        await self.session.refresh(product)
        return await self.get_product(product.id)

    async def duplicate_product(self, product_id: UUID) -> Product:
        """Duplicate a product as a new draft listing."""
        product = await self.get_product(product_id)
        await self._require_active_seller(product.seller_id)
        duplicate_name = f"{product.product_name} Copy"
        duplicate_slug = await self._generate_unique_slug(duplicate_name)
        duplicate_sku = await self._generate_unique_sku(product.sku)
        duplicate_barcode = await self._generate_unique_barcode(product.barcode)

        clone = Product(
            seller_id=product.seller_id,
            category_id=product.category_id,
            brand_id=product.brand_id,
            product_name=duplicate_name,
            product_slug=duplicate_slug,
            short_description=product.short_description,
            long_description=product.long_description,
            sku=duplicate_sku,
            barcode=duplicate_barcode,
            price=product.price,
            discount_price=product.discount_price,
            cost_price=product.cost_price,
            currency=product.currency,
            tax_percentage=product.tax_percentage,
            weight=product.weight,
            length=product.length,
            width=product.width,
            height=product.height,
            status=ProductStatus.DRAFT.value,
            visibility=ProductVisibility.PRIVATE.value,
            is_featured=False,
            is_active=True,
        )
        await self.repository.create(clone)
        await self.session.commit()
        await self.session.refresh(clone)
        return await self.get_product(clone.id)

    async def _require_active_seller(self, seller_id: UUID) -> Seller:
        """Return an active seller or raise."""
        seller = await self.seller_repository.get_active_by_id(seller_id)
        if seller is None:
            raise ApplicationError("Seller not found", status_code=status.HTTP_404_NOT_FOUND)
        if not seller.is_active or seller.status != "active":
            raise ApplicationError("Only active sellers can manage products", status_code=status.HTTP_400_BAD_REQUEST)
        return seller

    async def _require_category(self, category_id: UUID) -> Category:
        """Return a category or raise."""
        category = await self.category_repository.get_active_by_id(category_id)
        if category is None:
            raise ApplicationError("Category not found", status_code=status.HTTP_404_NOT_FOUND)
        return category

    async def _require_brand(self, brand_id: UUID) -> Brand:
        """Return a brand or raise."""
        brand = await self.brand_repository.get_active_by_id(brand_id)
        if brand is None:
            raise ApplicationError("Brand not found", status_code=status.HTTP_404_NOT_FOUND)
        return brand

    async def _validate_unique_fields(self, sku: str, barcode: str | None, product_slug: str) -> None:
        """Validate product unique fields."""
        await self._validate_unique_sku(sku)
        if barcode:
            await self._validate_unique_barcode(barcode)
        await self._validate_unique_slug(product_slug)

    async def _validate_unique_sku(self, sku: str, exclude_id: UUID | None = None) -> None:
        """Validate SKU uniqueness."""
        if await self.repository.get_by_sku(sku, exclude_id=exclude_id):
            raise ApplicationError("Product SKU already exists", status_code=status.HTTP_409_CONFLICT)

    async def _validate_unique_barcode(self, barcode: str, exclude_id: UUID | None = None) -> None:
        """Validate barcode uniqueness."""
        if await self.repository.get_by_barcode(barcode, exclude_id=exclude_id):
            raise ApplicationError("Product barcode already exists", status_code=status.HTTP_409_CONFLICT)

    async def _validate_unique_slug(self, product_slug: str, exclude_id: UUID | None = None) -> None:
        """Validate slug uniqueness."""
        if await self.repository.get_by_slug(product_slug, exclude_id=exclude_id):
            raise ApplicationError("Product slug already exists", status_code=status.HTTP_409_CONFLICT)

    async def _generate_unique_slug(self, product_name: str) -> str:
        """Generate a unique slug from product name."""
        base_slug = SLUG_SANITIZER.sub("-", product_name.strip().lower()).strip("-") or "product"
        slug = base_slug
        counter = 2
        while await self.repository.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    async def _generate_unique_sku(self, sku: str) -> str:
        """Generate a unique duplicate SKU."""
        base_sku = f"{sku}-COPY"
        next_sku = base_sku
        counter = 2
        while await self.repository.get_by_sku(next_sku):
            next_sku = f"{base_sku}-{counter}"
            counter += 1
        return next_sku

    async def _generate_unique_barcode(self, barcode: str | None) -> str | None:
        """Generate a unique duplicate barcode when the source has one."""
        if barcode is None:
            return None
        base_barcode = f"{barcode}-COPY"
        next_barcode = base_barcode
        counter = 2
        while await self.repository.get_by_barcode(next_barcode):
            next_barcode = f"{base_barcode}-{counter}"
            counter += 1
        return next_barcode

    def _ensure_editable(self, product: Product) -> None:
        """Ensure product can be edited."""
        if product.is_deleted or product.status == ProductStatus.DELETED.value:
            raise ApplicationError("Deleted products cannot be edited", status_code=status.HTTP_400_BAD_REQUEST)
        if product.status == ProductStatus.ARCHIVED.value:
            raise ApplicationError("Archived products cannot be edited", status_code=status.HTTP_400_BAD_REQUEST)

    def _validate_effective_discount(self, product: Product, update_data: dict[str, Any]) -> None:
        """Validate discount price against the effective price after update."""
        next_price = update_data.get("price", product.price)
        next_discount = update_data.get("discount_price", product.discount_price)
        if next_discount is not None and next_discount > next_price:
            raise ApplicationError(
                "Discount price cannot be greater than price",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
