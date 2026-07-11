"""Product Management API endpoints."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import SortDirection
from app.common.pagination import PaginationParams
from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.dependencies.request import get_pagination, get_search
from app.schemas.product import (
    ProductCreate,
    ProductDetails,
    ProductFilter,
    ProductListResponse,
    ProductResponse,
    ProductStatus,
    ProductUpdate,
    PublishProductRequest,
)
from app.schemas.product_extension import (
    ProductAttributeCreate,
    ProductAttributeListResponse,
    ProductAttributeResponse,
    ProductAttributeUpdate,
    ProductPreviewExtendedResponse,
    ProductSeoMetadataResponse,
    ProductSeoMetadataUpsert,
    ProductSpecificationCreate,
    ProductSpecificationListResponse,
    ProductSpecificationResponse,
    ProductSpecificationUpdate,
    ProductTagCreate,
    ProductTagListResponse,
    ProductTagResponse,
    ProductVariantCreate,
    ProductVariantListResponse,
    ProductVariantResponse,
    ProductVariantStatus,
    ProductVariantUpdate,
)
from app.schemas.product_image import ProductImageListResponse, ProductImageResponse
from app.services.product import ProductService
from app.services.product_extension import ProductExtensionService
from app.services.product_image import ProductImageService

router = APIRouter(prefix="/products", tags=["products"])


def get_product_service(session: AsyncSession = Depends(get_db_session)) -> ProductService:
    """Provide product service dependency."""
    return ProductService(session)


def get_product_image_service(session: AsyncSession = Depends(get_db_session)) -> ProductImageService:
    """Provide product image service dependency."""
    return ProductImageService(session)


def get_product_extension_service(session: AsyncSession = Depends(get_db_session)) -> ProductExtensionService:
    """Provide product extension service dependency."""
    return ProductExtensionService(session)


def product_details(product: object) -> ProductDetails:
    """Build a product response with related display labels."""
    payload = ProductResponse.model_validate(product).model_dump()
    return ProductDetails(
        **payload,
        seller_name=getattr(getattr(product, "seller", None), "business_name", None),
        category_name=getattr(getattr(product, "category", None), "category_name", None),
        brand_name=getattr(getattr(product, "brand", None), "brand_name", None),
    )


@router.post(
    "",
    response_model=StandardResponse[ProductDetails],
    status_code=status.HTTP_201_CREATED,
    summary="Create product",
    description="Create a product listing for an active seller with category and brand relationships.",
)
async def create_product(
    payload: ProductCreate,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Create a product."""
    product = await service.create_product(payload)
    return StandardResponse.success_response(
        message="Product created successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "",
    response_model=StandardResponse[ProductListResponse],
    summary="List products",
    description="List products with pagination, search, filtering, and sorting.",
)
async def list_products(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    seller_id: UUID | None = Query(default=None),
    category_id: UUID | None = Query(default=None),
    brand_id: UUID | None = Query(default=None),
    status_filter: ProductStatus | None = Query(default=None, alias="status"),
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    is_featured: bool | None = Query(default=None),
    is_published: bool | None = Query(default=None),
    sort_by: str | None = Query(default="newest"),
    sort_direction: SortDirection = Query(default=SortDirection.DESC),
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductListResponse]:
    """List products."""
    filters = ProductFilter(
        seller_id=seller_id,
        category_id=category_id,
        brand_id=brand_id,
        status=status_filter,
        min_price=min_price,
        max_price=max_price,
        is_featured=is_featured,
        is_published=is_published,
    )
    page = await service.list_products(pagination, filters, search, sort_by, sort_direction.value)
    payload = ProductListResponse(items=[product_details(product) for product in page.items], meta=page.meta)
    return StandardResponse.success_response(
        message="Products retrieved successfully",
        data=payload,
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}",
    response_model=StandardResponse[ProductDetails],
    summary="Get product",
    description="Retrieve a product by product ID.",
)
async def get_product(
    product_id: UUID,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Get a product."""
    product = await service.get_product(product_id)
    return StandardResponse.success_response(
        message="Product retrieved successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/preview",
    response_model=StandardResponse[ProductDetails],
    summary="Preview product",
    description="Retrieve product preview details without changing product status.",
)
async def preview_product(
    product_id: UUID,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Preview a product."""
    product = await service.preview_product(product_id)
    return StandardResponse.success_response(
        message="Product preview retrieved successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{product_id}",
    response_model=StandardResponse[ProductDetails],
    summary="Update product",
    description="Update editable product details, pricing, classification, and listing metadata.",
)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Update a product."""
    product = await service.update_product(product_id, payload)
    return StandardResponse.success_response(
        message="Product updated successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/{product_id}",
    response_model=StandardResponse[ProductResponse],
    summary="Soft delete product",
    description="Soft delete a product without physically removing it from the database.",
)
async def delete_product(
    product_id: UUID,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductResponse]:
    """Soft delete a product."""
    product = await service.soft_delete_product(product_id)
    return StandardResponse.success_response(
        message="Product deleted successfully",
        data=ProductResponse.model_validate(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{product_id}/publish",
    response_model=StandardResponse[ProductDetails],
    summary="Publish product",
    description="Publish an editable product and set catalog visibility.",
)
async def publish_product(
    product_id: UUID,
    payload: PublishProductRequest,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Publish a product."""
    product = await service.publish_product(product_id, payload)
    return StandardResponse.success_response(
        message="Product published successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{product_id}/unpublish",
    response_model=StandardResponse[ProductDetails],
    summary="Unpublish product",
    description="Unpublish a product and return it to private visibility.",
)
async def unpublish_product(
    product_id: UUID,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Unpublish a product."""
    product = await service.unpublish_product(product_id)
    return StandardResponse.success_response(
        message="Product unpublished successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/{product_id}/archive",
    response_model=StandardResponse[ProductDetails],
    summary="Archive product",
    description="Archive a product and prevent it from being published again.",
)
async def archive_product(
    product_id: UUID,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Archive a product."""
    product = await service.archive_product(product_id)
    return StandardResponse.success_response(
        message="Product archived successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{product_id}/duplicate",
    response_model=StandardResponse[ProductDetails],
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate product",
    description="Duplicate a product into a new draft listing with unique SKU and slug.",
)
async def duplicate_product(
    product_id: UUID,
    request: Request,
    service: ProductService = Depends(get_product_service),
) -> StandardResponse[ProductDetails]:
    """Duplicate a product."""
    product = await service.duplicate_product(product_id)
    return StandardResponse.success_response(
        message="Product duplicated successfully",
        data=product_details(product),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{product_id}/images",
    response_model=StandardResponse[ProductImageResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload product image",
    description="Upload a JPEG, PNG, or WEBP product image up to 10 MB.",
)
async def upload_product_image(
    product_id: UUID,
    request: Request,
    file: UploadFile = File(...),
    alt_text: str | None = Form(default=None),
    display_order: int | None = Form(default=None, ge=0),
    is_primary: bool = Form(default=False),
    service: ProductImageService = Depends(get_product_image_service),
) -> StandardResponse[ProductImageResponse]:
    """Upload a product image."""
    image = await service.upload_image(product_id, file, alt_text, display_order, is_primary)
    return StandardResponse.success_response(
        message="Product image uploaded successfully",
        data=ProductImageResponse.model_validate(image),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/images",
    response_model=StandardResponse[ProductImageListResponse],
    summary="List product images",
    description="List a product gallery ordered by display order.",
)
async def list_product_images(
    product_id: UUID,
    request: Request,
    service: ProductImageService = Depends(get_product_image_service),
) -> StandardResponse[ProductImageListResponse]:
    """List product images."""
    images = await service.list_images(product_id)
    return StandardResponse.success_response(
        message="Product images retrieved successfully",
        data=ProductImageListResponse(items=[ProductImageResponse.model_validate(image) for image in images]),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/images/{image_id}",
    response_model=StandardResponse[ProductImageResponse],
    summary="Update product image",
    description="Replace product image binary and/or update alt text and display order.",
)
async def update_product_image(
    image_id: UUID,
    request: Request,
    file: UploadFile | None = File(default=None),
    alt_text: str | None = Form(default=None),
    display_order: int | None = Form(default=None, ge=0),
    service: ProductImageService = Depends(get_product_image_service),
) -> StandardResponse[ProductImageResponse]:
    """Update or replace a product image."""
    image = await service.update_image(image_id, file, alt_text, display_order)
    return StandardResponse.success_response(
        message="Product image updated successfully",
        data=ProductImageResponse.model_validate(image),
        request_id=getattr(request.state, "request_id", None),
    )


@router.patch(
    "/images/{image_id}/primary",
    response_model=StandardResponse[ProductImageResponse],
    summary="Mark primary product image",
    description="Mark one product image as the primary gallery image.",
)
async def mark_primary_product_image(
    image_id: UUID,
    request: Request,
    service: ProductImageService = Depends(get_product_image_service),
) -> StandardResponse[ProductImageResponse]:
    """Mark product image as primary."""
    image = await service.mark_primary(image_id)
    return StandardResponse.success_response(
        message="Product image marked primary successfully",
        data=ProductImageResponse.model_validate(image),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/images/{image_id}",
    response_model=StandardResponse[ProductImageResponse],
    summary="Delete product image",
    description="Soft delete a product image.",
)
async def delete_product_image(
    image_id: UUID,
    request: Request,
    service: ProductImageService = Depends(get_product_image_service),
) -> StandardResponse[ProductImageResponse]:
    """Delete product image."""
    image = await service.delete_image(image_id)
    return StandardResponse.success_response(
        message="Product image deleted successfully",
        data=ProductImageResponse.model_validate(image),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{product_id}/variants",
    response_model=StandardResponse[ProductVariantResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create product variant",
    description="Create a sellable product variant with a unique SKU, barcode, and attribute combination.",
)
async def create_product_variant(
    product_id: UUID,
    payload: ProductVariantCreate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductVariantResponse]:
    """Create a product variant."""
    variant = await service.create_variant(product_id, payload)
    return StandardResponse.success_response(
        message="Product variant created successfully",
        data=ProductVariantResponse.model_validate(variant),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/variants",
    response_model=StandardResponse[ProductVariantListResponse],
    summary="List product variants",
    description="List product variants with pagination, search, filtering, and sorting.",
)
async def list_product_variants(
    product_id: UUID,
    request: Request,
    pagination: PaginationParams = Depends(get_pagination),
    search: str | None = Depends(get_search),
    status_filter: ProductVariantStatus | None = Query(default=None, alias="status"),
    sort_by: str | None = Query(default="newest"),
    sort_direction: SortDirection = Query(default=SortDirection.DESC),
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductVariantListResponse]:
    """List product variants."""
    page = await service.list_variants(
        product_id,
        pagination,
        search,
        status_filter.value if status_filter else None,
        sort_by,
        sort_direction.value,
    )
    return StandardResponse.success_response(
        message="Product variants retrieved successfully",
        data=ProductVariantListResponse(
            items=[ProductVariantResponse.model_validate(variant) for variant in page.items],
            meta=page.meta,
        ),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/variants/{variant_id}",
    response_model=StandardResponse[ProductVariantResponse],
    summary="Update product variant",
    description="Update variant pricing, SKU, barcode, dimensions, status, or attribute combination.",
)
async def update_product_variant(
    variant_id: UUID,
    payload: ProductVariantUpdate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductVariantResponse]:
    """Update a product variant."""
    variant = await service.update_variant(variant_id, payload)
    return StandardResponse.success_response(
        message="Product variant updated successfully",
        data=ProductVariantResponse.model_validate(variant),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/variants/{variant_id}",
    response_model=StandardResponse[ProductVariantResponse],
    summary="Delete product variant",
    description="Soft delete a product variant.",
)
async def delete_product_variant(
    variant_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductVariantResponse]:
    """Soft delete a product variant."""
    variant = await service.delete_variant(variant_id)
    return StandardResponse.success_response(
        message="Product variant deleted successfully",
        data=ProductVariantResponse.model_validate(variant),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{product_id}/attributes",
    response_model=StandardResponse[ProductAttributeResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create product attribute",
    description="Create a configurable product attribute and its allowed values.",
)
async def create_product_attribute(
    product_id: UUID,
    payload: ProductAttributeCreate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductAttributeResponse]:
    """Create product attribute."""
    attribute = await service.create_attribute(product_id, payload)
    return StandardResponse.success_response(
        message="Product attribute created successfully",
        data=ProductAttributeResponse.model_validate(attribute),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/attributes",
    response_model=StandardResponse[ProductAttributeListResponse],
    summary="List product attributes",
    description="List configurable product attributes and allowed values.",
)
async def list_product_attributes(
    product_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductAttributeListResponse]:
    """List product attributes."""
    attributes = await service.list_attributes(product_id)
    return StandardResponse.success_response(
        message="Product attributes retrieved successfully",
        data=ProductAttributeListResponse(
            items=[ProductAttributeResponse.model_validate(attribute) for attribute in attributes],
        ),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/attributes/{attribute_id}",
    response_model=StandardResponse[ProductAttributeResponse],
    summary="Update product attribute",
    description="Update a configurable product attribute and replace allowed values.",
)
async def update_product_attribute(
    attribute_id: UUID,
    payload: ProductAttributeUpdate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductAttributeResponse]:
    """Update product attribute."""
    attribute = await service.update_attribute(attribute_id, payload)
    return StandardResponse.success_response(
        message="Product attribute updated successfully",
        data=ProductAttributeResponse.model_validate(attribute),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/attributes/{attribute_id}",
    response_model=StandardResponse[ProductAttributeResponse],
    summary="Delete product attribute",
    description="Soft delete a configurable product attribute.",
)
async def delete_product_attribute(
    attribute_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductAttributeResponse]:
    """Delete product attribute."""
    attribute = await service.delete_attribute(attribute_id)
    return StandardResponse.success_response(
        message="Product attribute deleted successfully",
        data=ProductAttributeResponse.model_validate(attribute),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{product_id}/tags",
    response_model=StandardResponse[ProductTagResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create product tag",
    description="Create a merchandising/search tag for a product.",
)
async def create_product_tag(
    product_id: UUID,
    payload: ProductTagCreate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductTagResponse]:
    """Create product tag."""
    tag = await service.create_tag(product_id, payload)
    return StandardResponse.success_response(
        message="Product tag created successfully",
        data=ProductTagResponse.model_validate(tag),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/tags",
    response_model=StandardResponse[ProductTagListResponse],
    summary="List product tags",
    description="List product merchandising/search tags.",
)
async def list_product_tags(
    product_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductTagListResponse]:
    """List product tags."""
    tags = await service.list_tags(product_id)
    return StandardResponse.success_response(
        message="Product tags retrieved successfully",
        data=ProductTagListResponse(items=[ProductTagResponse.model_validate(tag) for tag in tags]),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/tags/{tag_id}",
    response_model=StandardResponse[ProductTagResponse],
    summary="Delete product tag",
    description="Soft delete a product tag.",
)
async def delete_product_tag(
    tag_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductTagResponse]:
    """Delete product tag."""
    tag = await service.delete_tag(tag_id)
    return StandardResponse.success_response(
        message="Product tag deleted successfully",
        data=ProductTagResponse.model_validate(tag),
        request_id=getattr(request.state, "request_id", None),
    )


@router.post(
    "/{product_id}/specifications",
    response_model=StandardResponse[ProductSpecificationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create product specification",
    description="Create a product specification row.",
)
async def create_product_specification(
    product_id: UUID,
    payload: ProductSpecificationCreate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductSpecificationResponse]:
    """Create product specification."""
    specification = await service.create_specification(product_id, payload)
    return StandardResponse.success_response(
        message="Product specification created successfully",
        data=ProductSpecificationResponse.model_validate(specification),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/specifications",
    response_model=StandardResponse[ProductSpecificationListResponse],
    summary="List product specifications",
    description="List product specifications ordered by display order.",
)
async def list_product_specifications(
    product_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductSpecificationListResponse]:
    """List product specifications."""
    specifications = await service.list_specifications(product_id)
    return StandardResponse.success_response(
        message="Product specifications retrieved successfully",
        data=ProductSpecificationListResponse(
            items=[ProductSpecificationResponse.model_validate(spec) for spec in specifications],
        ),
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/specifications/{specification_id}",
    response_model=StandardResponse[ProductSpecificationResponse],
    summary="Update product specification",
    description="Update product specification details.",
)
async def update_product_specification(
    specification_id: UUID,
    payload: ProductSpecificationUpdate,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductSpecificationResponse]:
    """Update product specification."""
    specification = await service.update_specification(specification_id, payload)
    return StandardResponse.success_response(
        message="Product specification updated successfully",
        data=ProductSpecificationResponse.model_validate(specification),
        request_id=getattr(request.state, "request_id", None),
    )


@router.delete(
    "/specifications/{specification_id}",
    response_model=StandardResponse[ProductSpecificationResponse],
    summary="Delete product specification",
    description="Soft delete a product specification.",
)
async def delete_product_specification(
    specification_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductSpecificationResponse]:
    """Delete product specification."""
    specification = await service.delete_specification(specification_id)
    return StandardResponse.success_response(
        message="Product specification deleted successfully",
        data=ProductSpecificationResponse.model_validate(specification),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/seo",
    response_model=StandardResponse[ProductSeoMetadataResponse | None],
    summary="Get product SEO metadata",
    description="Retrieve SEO and social metadata for a product.",
)
async def get_product_seo(
    product_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductSeoMetadataResponse | None]:
    """Get product SEO metadata."""
    metadata = await service.get_seo(product_id)
    return StandardResponse.success_response(
        message="Product SEO metadata retrieved successfully",
        data=ProductSeoMetadataResponse.model_validate(metadata) if metadata else None,
        request_id=getattr(request.state, "request_id", None),
    )


@router.put(
    "/{product_id}/seo",
    response_model=StandardResponse[ProductSeoMetadataResponse],
    summary="Upsert product SEO metadata",
    description="Create or update SEO and social metadata for a product.",
)
async def upsert_product_seo(
    product_id: UUID,
    payload: ProductSeoMetadataUpsert,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductSeoMetadataResponse]:
    """Upsert product SEO metadata."""
    metadata = await service.upsert_seo(product_id, payload)
    return StandardResponse.success_response(
        message="Product SEO metadata saved successfully",
        data=ProductSeoMetadataResponse.model_validate(metadata),
        request_id=getattr(request.state, "request_id", None),
    )


@router.get(
    "/{product_id}/extension-preview",
    response_model=StandardResponse[ProductPreviewExtendedResponse],
    summary="Preview product extensions",
    description="Retrieve variants, attributes, tags, specifications, and SEO metadata for product preview.",
)
async def preview_product_extensions(
    product_id: UUID,
    request: Request,
    service: ProductExtensionService = Depends(get_product_extension_service),
) -> StandardResponse[ProductPreviewExtendedResponse]:
    """Preview product extension metadata."""
    preview = await service.preview_extensions(product_id)
    return StandardResponse.success_response(
        message="Product extension preview retrieved successfully",
        data=ProductPreviewExtendedResponse(
            variants=[ProductVariantResponse.model_validate(variant) for variant in preview["variants"]],
            attributes=[ProductAttributeResponse.model_validate(attribute) for attribute in preview["attributes"]],
            tags=[ProductTagResponse.model_validate(tag) for tag in preview["tags"]],
            specifications=[
                ProductSpecificationResponse.model_validate(specification)
                for specification in preview["specifications"]
            ],
            seo=ProductSeoMetadataResponse.model_validate(preview["seo"]) if preview["seo"] else None,
        ),
        request_id=getattr(request.state, "request_id", None),
    )
