"""Service layer for product variants and product merchandising metadata."""

from typing import Any
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams
from app.exceptions.base import ApplicationError
from app.models.product_extension import (
    ProductAttribute,
    ProductAttributeValue,
    ProductSeoMetadata,
    ProductSpecification,
    ProductTag,
    ProductVariant,
)
from app.repositories.product import ProductRepository
from app.repositories.product_extension import (
    ProductAttributeRepository,
    ProductSeoRepository,
    ProductSpecificationRepository,
    ProductTagRepository,
    ProductVariantRepository,
)
from app.schemas.product import ProductStatus
from app.schemas.product_extension import (
    AttributeSelection,
    ProductAttributeCreate,
    ProductAttributeUpdate,
    ProductSeoMetadataUpsert,
    ProductSpecificationCreate,
    ProductSpecificationUpdate,
    ProductTagCreate,
    ProductVariantCreate,
    ProductVariantUpdate,
)


class ProductExtensionService:
    """Business logic for variants, attributes, tags, specifications, and SEO."""

    def __init__(
        self,
        session: AsyncSession,
        product_repository: ProductRepository | None = None,
        variant_repository: ProductVariantRepository | None = None,
        attribute_repository: ProductAttributeRepository | None = None,
        tag_repository: ProductTagRepository | None = None,
        specification_repository: ProductSpecificationRepository | None = None,
        seo_repository: ProductSeoRepository | None = None,
    ) -> None:
        self.session = session
        self.product_repository = product_repository or ProductRepository(session)
        self.variant_repository = variant_repository or ProductVariantRepository(session)
        self.attribute_repository = attribute_repository or ProductAttributeRepository(session)
        self.tag_repository = tag_repository or ProductTagRepository(session)
        self.specification_repository = specification_repository or ProductSpecificationRepository(session)
        self.seo_repository = seo_repository or ProductSeoRepository(session)

    async def create_variant(self, product_id: UUID, payload: ProductVariantCreate) -> ProductVariant:
        """Create a product variant."""
        await self._require_editable_product(product_id)
        await self._validate_unique_sku(payload.sku)
        if payload.barcode:
            await self._validate_unique_barcode(payload.barcode)

        signature = await self._build_variant_signature(product_id, payload.attributes)
        if await self.variant_repository.get_by_signature(product_id, signature):
            raise ApplicationError("Product variant combination already exists", status_code=status.HTTP_409_CONFLICT)

        variant = ProductVariant(
            product_id=product_id,
            sku=payload.sku,
            barcode=payload.barcode,
            price=payload.price,
            discount_price=payload.discount_price,
            cost_price=payload.cost_price,
            weight=payload.weight,
            length=payload.length,
            width=payload.width,
            height=payload.height,
            status=payload.status.value,
            is_active=payload.is_active,
            variant_signature=signature,
        )
        await self.variant_repository.create(variant)
        await self.session.flush()
        await self.variant_repository.replace_attribute_values(
            variant,
            await self._build_variant_values(product_id, variant.id, payload.attributes),
        )
        await self.session.commit()
        return await self._require_variant(variant.id)

    async def list_variants(
        self,
        product_id: UUID,
        params: PaginationParams,
        search: str | None,
        status_filter: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[ProductVariant]:
        """List product variants."""
        await self._require_product(product_id)
        return await self.variant_repository.list_variants(
            product_id,
            params,
            search,
            status_filter,
            sort_by,
            sort_direction,
        )

    async def update_variant(self, variant_id: UUID, payload: ProductVariantUpdate) -> ProductVariant:
        """Update a product variant."""
        variant = await self._require_variant(variant_id)
        await self._require_editable_product(variant.product_id)
        update_data = payload.model_dump(exclude_unset=True)

        if isinstance(update_data.get("sku"), str):
            await self._validate_unique_sku(update_data["sku"], exclude_variant_id=variant.id)
        if isinstance(update_data.get("barcode"), str):
            await self._validate_unique_barcode(update_data["barcode"], exclude_variant_id=variant.id)
        self._validate_effective_discount(variant, update_data)

        attributes = update_data.pop("attributes", None)
        for key, value in update_data.items():
            if key == "status" and value is not None:
                value = value.value
            setattr(variant, key, value)

        if attributes is not None:
            signature = await self._build_variant_signature(variant.product_id, attributes)
            if await self.variant_repository.get_by_signature(variant.product_id, signature, exclude_id=variant.id):
                raise ApplicationError(
                    "Product variant combination already exists",
                    status_code=status.HTTP_409_CONFLICT,
                )
            variant.variant_signature = signature
            await self.variant_repository.replace_attribute_values(
                variant,
                await self._build_variant_values(variant.product_id, variant.id, attributes),
            )

        await self.variant_repository.update(variant)
        await self.session.commit()
        return await self._require_variant(variant.id)

    async def delete_variant(self, variant_id: UUID) -> ProductVariant:
        """Soft delete a variant."""
        variant = await self._require_variant(variant_id)
        await self._require_editable_product(variant.product_id)
        await self.variant_repository.soft_delete(variant)
        await self.session.commit()
        return variant

    async def create_attribute(self, product_id: UUID, payload: ProductAttributeCreate) -> ProductAttribute:
        """Create a product attribute and allowed values."""
        await self._require_editable_product(product_id)
        if await self.attribute_repository.get_by_name(product_id, payload.attribute_name):
            raise ApplicationError("Product attribute already exists", status_code=status.HTTP_409_CONFLICT)
        attribute = ProductAttribute(
            product_id=product_id,
            attribute_name=payload.attribute_name,
            display_order=payload.display_order,
            is_variant_defining=payload.is_variant_defining,
        )
        await self.attribute_repository.create(attribute)
        await self.session.flush()
        await self.attribute_repository.replace_values(
            attribute,
            self._build_allowed_values(product_id, attribute.id, payload.values),
        )
        await self.session.commit()
        return await self._require_attribute(attribute.id)

    async def list_attributes(self, product_id: UUID) -> list[ProductAttribute]:
        """List product attributes."""
        await self._require_product(product_id)
        return await self.attribute_repository.list_attributes(product_id)

    async def update_attribute(self, attribute_id: UUID, payload: ProductAttributeUpdate) -> ProductAttribute:
        """Update a product attribute."""
        attribute = await self._require_attribute(attribute_id)
        await self._require_editable_product(attribute.product_id)
        update_data = payload.model_dump(exclude_unset=True)
        if isinstance(update_data.get("attribute_name"), str):
            existing = await self.attribute_repository.get_by_name(
                attribute.product_id,
                update_data["attribute_name"],
                exclude_id=attribute.id,
            )
            if existing:
                raise ApplicationError("Product attribute already exists", status_code=status.HTTP_409_CONFLICT)

        values = update_data.pop("values", None)
        for key, value in update_data.items():
            setattr(attribute, key, value)
        if values is not None:
            await self.attribute_repository.replace_values(
                attribute,
                self._build_allowed_values(attribute.product_id, attribute.id, values),
            )
        await self.attribute_repository.update(attribute)
        await self.session.commit()
        return await self._require_attribute(attribute.id)

    async def delete_attribute(self, attribute_id: UUID) -> ProductAttribute:
        """Soft delete a product attribute."""
        attribute = await self._require_attribute(attribute_id)
        await self._require_editable_product(attribute.product_id)
        await self.attribute_repository.soft_delete(attribute)
        await self.session.commit()
        return attribute

    async def create_tag(self, product_id: UUID, payload: ProductTagCreate) -> ProductTag:
        """Create a product tag."""
        await self._require_editable_product(product_id)
        if await self.tag_repository.get_by_name(product_id, payload.tag_name):
            raise ApplicationError("Product tag already exists", status_code=status.HTTP_409_CONFLICT)
        tag = ProductTag(product_id=product_id, tag_name=payload.tag_name)
        await self.tag_repository.add(tag)
        await self.session.commit()
        await self.session.refresh(tag)
        return tag

    async def list_tags(self, product_id: UUID) -> list[ProductTag]:
        """List product tags."""
        await self._require_product(product_id)
        return await self.tag_repository.list_tags(product_id)

    async def delete_tag(self, tag_id: UUID) -> ProductTag:
        """Soft delete a product tag."""
        tag = await self.tag_repository.get_active_by_id(tag_id)
        if tag is None:
            raise ApplicationError("Product tag not found", status_code=status.HTTP_404_NOT_FOUND)
        await self._require_editable_product(tag.product_id)
        tag.mark_deleted()
        await self.tag_repository.update(tag)
        await self.session.commit()
        return tag

    async def create_specification(
        self,
        product_id: UUID,
        payload: ProductSpecificationCreate,
    ) -> ProductSpecification:
        """Create a product specification."""
        await self._require_editable_product(product_id)
        if await self.specification_repository.get_by_name(product_id, payload.specification_name):
            raise ApplicationError("Product specification already exists", status_code=status.HTTP_409_CONFLICT)
        specification = ProductSpecification(product_id=product_id, **payload.model_dump())
        await self.specification_repository.add(specification)
        await self.session.commit()
        await self.session.refresh(specification)
        return specification

    async def list_specifications(self, product_id: UUID) -> list[ProductSpecification]:
        """List product specifications."""
        await self._require_product(product_id)
        return await self.specification_repository.list_specifications(product_id)

    async def update_specification(
        self,
        specification_id: UUID,
        payload: ProductSpecificationUpdate,
    ) -> ProductSpecification:
        """Update product specification."""
        specification = await self.specification_repository.get_active_by_id(specification_id)
        if specification is None:
            raise ApplicationError("Product specification not found", status_code=status.HTTP_404_NOT_FOUND)
        await self._require_editable_product(specification.product_id)
        update_data = payload.model_dump(exclude_unset=True)
        if isinstance(update_data.get("specification_name"), str):
            existing = await self.specification_repository.get_by_name(
                specification.product_id,
                update_data["specification_name"],
                exclude_id=specification.id,
            )
            if existing:
                raise ApplicationError("Product specification already exists", status_code=status.HTTP_409_CONFLICT)
        for key, value in update_data.items():
            setattr(specification, key, value)
        await self.specification_repository.update(specification)
        await self.session.commit()
        return specification

    async def delete_specification(self, specification_id: UUID) -> ProductSpecification:
        """Soft delete a product specification."""
        specification = await self.specification_repository.get_active_by_id(specification_id)
        if specification is None:
            raise ApplicationError("Product specification not found", status_code=status.HTTP_404_NOT_FOUND)
        await self._require_editable_product(specification.product_id)
        specification.mark_deleted()
        await self.specification_repository.update(specification)
        await self.session.commit()
        return specification

    async def get_seo(self, product_id: UUID) -> ProductSeoMetadata | None:
        """Get product SEO metadata."""
        await self._require_product(product_id)
        return await self.seo_repository.get_by_product_id(product_id)

    async def upsert_seo(self, product_id: UUID, payload: ProductSeoMetadataUpsert) -> ProductSeoMetadata:
        """Create or update SEO metadata."""
        await self._require_editable_product(product_id)
        data = payload.model_dump()
        if data.get("canonical_url") is not None:
            data["canonical_url"] = str(data["canonical_url"])
        friendly_url = data.get("friendly_url")
        if friendly_url and await self.seo_repository.get_by_friendly_url(friendly_url, exclude_product_id=product_id):
            raise ApplicationError("Friendly URL already exists", status_code=status.HTTP_409_CONFLICT)

        metadata = await self.seo_repository.get_by_product_id(product_id)
        if metadata is None:
            metadata = ProductSeoMetadata(product_id=product_id, **data)
            await self.seo_repository.add(metadata)
        else:
            for key, value in data.items():
                setattr(metadata, key, value)
            await self.seo_repository.update(metadata)
        await self.session.commit()
        await self.session.refresh(metadata)
        return metadata

    async def preview_extensions(self, product_id: UUID) -> dict[str, Any]:
        """Return all extension metadata for product preview."""
        await self._require_product(product_id)
        variants_page = await self.variant_repository.list_variants(
            product_id,
            PaginationParams(page=1, page_size=100),
            search=None,
            status_filter=None,
            sort_by="sku",
            sort_direction="asc",
        )
        return {
            "variants": variants_page.items,
            "attributes": await self.attribute_repository.list_attributes(product_id),
            "tags": await self.tag_repository.list_tags(product_id),
            "specifications": await self.specification_repository.list_specifications(product_id),
            "seo": await self.seo_repository.get_by_product_id(product_id),
        }

    async def _require_product(self, product_id: UUID) -> None:
        """Require an existing product."""
        product = await self.product_repository.get_active_by_id(product_id)
        if product is None:
            raise ApplicationError("Product not found", status_code=status.HTTP_404_NOT_FOUND)

    async def _require_editable_product(self, product_id: UUID) -> None:
        """Require an editable product."""
        product = await self.product_repository.get_active_by_id(product_id)
        if product is None:
            raise ApplicationError("Product not found", status_code=status.HTTP_404_NOT_FOUND)
        if product.is_deleted or product.status == ProductStatus.DELETED.value:
            raise ApplicationError("Deleted products cannot be edited", status_code=status.HTTP_400_BAD_REQUEST)
        if product.status == ProductStatus.ARCHIVED.value:
            raise ApplicationError("Archived products cannot be edited", status_code=status.HTTP_400_BAD_REQUEST)

    async def _require_variant(self, variant_id: UUID) -> ProductVariant:
        """Require an existing variant."""
        variant = await self.variant_repository.get_active_by_id(variant_id)
        if variant is None:
            raise ApplicationError("Product variant not found", status_code=status.HTTP_404_NOT_FOUND)
        return variant

    async def _require_attribute(self, attribute_id: UUID) -> ProductAttribute:
        """Require an existing attribute."""
        attribute = await self.attribute_repository.get_active_by_id(attribute_id)
        if attribute is None:
            raise ApplicationError("Product attribute not found", status_code=status.HTTP_404_NOT_FOUND)
        return attribute

    async def _validate_unique_sku(self, sku: str, exclude_variant_id: UUID | None = None) -> None:
        """Validate SKU uniqueness across products and variants."""
        if await self.product_repository.get_by_sku(sku):
            raise ApplicationError("SKU already exists", status_code=status.HTTP_409_CONFLICT)
        if await self.variant_repository.get_by_sku(sku, exclude_id=exclude_variant_id):
            raise ApplicationError("SKU already exists", status_code=status.HTTP_409_CONFLICT)

    async def _validate_unique_barcode(self, barcode: str, exclude_variant_id: UUID | None = None) -> None:
        """Validate barcode uniqueness across products and variants."""
        if await self.product_repository.get_by_barcode(barcode):
            raise ApplicationError("Barcode already exists", status_code=status.HTTP_409_CONFLICT)
        if await self.variant_repository.get_by_barcode(barcode, exclude_id=exclude_variant_id):
            raise ApplicationError("Barcode already exists", status_code=status.HTTP_409_CONFLICT)

    async def _build_variant_signature(self, product_id: UUID, selections: list[AttributeSelection]) -> str:
        """Create deterministic variant signature from attribute selections."""
        if not selections:
            return "default"
        pieces: list[str] = []
        for selection in selections:
            attribute = await self._require_attribute(selection.attribute_id)
            if attribute.product_id != product_id:
                raise ApplicationError(
                    "Variant attribute does not belong to product",
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
            pieces.append(f"{attribute.attribute_name.strip().lower()}={selection.value.strip().lower()}")
        return "|".join(sorted(pieces))

    async def _build_variant_values(
        self,
        product_id: UUID,
        variant_id: UUID,
        selections: list[AttributeSelection],
    ) -> list[ProductAttributeValue]:
        """Build variant attribute value rows."""
        values: list[ProductAttributeValue] = []
        for index, selection in enumerate(selections):
            await self._require_attribute(selection.attribute_id)
            values.append(
                ProductAttributeValue(
                    product_id=product_id,
                    attribute_id=selection.attribute_id,
                    variant_id=variant_id,
                    value=selection.value,
                    display_order=index,
                )
            )
        return values

    def _build_allowed_values(
        self,
        product_id: UUID,
        attribute_id: UUID,
        values: list[str],
    ) -> list[ProductAttributeValue]:
        """Build allowed attribute value rows."""
        return [
            ProductAttributeValue(
                product_id=product_id,
                attribute_id=attribute_id,
                value=value,
                display_order=index,
            )
            for index, value in enumerate(values)
        ]

    def _validate_effective_discount(self, variant: ProductVariant, update_data: dict[str, Any]) -> None:
        """Validate discount against effective price."""
        next_price = update_data.get("price", variant.price)
        next_discount = update_data.get("discount_price", variant.discount_price)
        if next_discount is not None and next_discount > next_price:
            raise ApplicationError(
                "Discount price cannot be greater than price",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
