"""Product image service layer."""

from hashlib import sha256
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings, get_settings
from app.exceptions.base import ApplicationError
from app.models.product_image import ProductImage
from app.repositories.product import ProductRepository
from app.repositories.product_image import ProductImageRepository

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class ProductImageService:
    """Business logic for product image management."""

    def __init__(
        self,
        session: AsyncSession,
        repository: ProductImageRepository | None = None,
        product_repository: ProductRepository | None = None,
        settings: Settings | None = None,
    ) -> None:
        self.session = session
        self.repository = repository or ProductImageRepository(session)
        self.product_repository = product_repository or ProductRepository(session)
        self.settings = settings or get_settings()

    async def upload_image(
        self,
        product_id: UUID,
        file: UploadFile,
        alt_text: str | None = None,
        display_order: int | None = None,
        is_primary: bool = False,
    ) -> ProductImage:
        """Upload and persist a product image."""
        await self._require_product(product_id)
        content, image_hash, extension = await self._validate_file(file)
        if await self.repository.get_by_hash(product_id, image_hash):
            raise ApplicationError(
                "Duplicate product image upload rejected",
                status_code=status.HTTP_409_CONFLICT,
            )

        should_be_primary = is_primary or not await self.repository.has_images(product_id)
        if should_be_primary:
            await self.repository.clear_primary(product_id)

        file_name = f"{uuid4().hex}{extension}"
        image_url = self._write_file(product_id, file_name, content)
        image = ProductImage(
            product_id=product_id,
            image_url=image_url,
            display_order=(
                display_order if display_order is not None else await self.repository.next_display_order(product_id)
            ),
            alt_text=alt_text,
            is_primary=should_be_primary,
            image_hash=image_hash,
            file_name=file.filename or file_name,
            mime_type=file.content_type or "",
            file_size=len(content),
        )
        await self.repository.create(image)
        await self.session.commit()
        await self.session.refresh(image)
        return image

    async def list_images(self, product_id: UUID) -> list[ProductImage]:
        """List product images."""
        await self._require_product(product_id)
        return await self.repository.list_by_product(product_id)

    async def update_image(
        self,
        image_id: UUID,
        file: UploadFile | None = None,
        alt_text: str | None = None,
        display_order: int | None = None,
    ) -> ProductImage:
        """Replace image binary and/or update metadata."""
        image = await self._require_image(image_id)
        if file is not None:
            content, image_hash, extension = await self._validate_file(file)
            if await self.repository.get_by_hash(image.product_id, image_hash, exclude_id=image.id):
                raise ApplicationError("Duplicate product image upload rejected", status_code=status.HTTP_409_CONFLICT)
            file_name = f"{uuid4().hex}{extension}"
            image.image_url = self._write_file(image.product_id, file_name, content)
            image.image_hash = image_hash
            image.file_name = file.filename or file_name
            image.mime_type = file.content_type or ""
            image.file_size = len(content)
        if alt_text is not None:
            image.alt_text = alt_text
        if display_order is not None:
            image.display_order = display_order

        await self.repository.update(image)
        await self.session.commit()
        await self.session.refresh(image)
        return image

    async def mark_primary(self, image_id: UUID) -> ProductImage:
        """Mark a product image as primary."""
        image = await self._require_image(image_id)
        await self.repository.clear_primary(image.product_id, exclude_id=image.id)
        image.is_primary = True
        await self.repository.update(image)
        await self.session.commit()
        await self.session.refresh(image)
        return image

    async def delete_image(self, image_id: UUID) -> ProductImage:
        """Soft delete a product image."""
        image = await self._require_image(image_id)
        was_primary = image.is_primary
        await self.repository.soft_delete(image)
        if was_primary:
            remaining = await self.repository.list_by_product(image.product_id)
            if remaining:
                remaining[0].is_primary = True
                await self.repository.update(remaining[0])
        await self.session.commit()
        await self.session.refresh(image)
        return image

    async def _require_product(self, product_id: UUID) -> None:
        """Ensure the product exists and is not deleted."""
        product = await self.product_repository.get_active_by_id(product_id)
        if product is None:
            raise ApplicationError("Product not found", status_code=status.HTTP_404_NOT_FOUND)

    async def _require_image(self, image_id: UUID) -> ProductImage:
        """Return an active image or raise 404."""
        image = await self.repository.get_active_by_id(image_id)
        if image is None:
            raise ApplicationError("Product image not found", status_code=status.HTTP_404_NOT_FOUND)
        return image

    async def _validate_file(self, file: UploadFile) -> tuple[bytes, str, str]:
        """Validate upload type, size, and return content with hash."""
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise ApplicationError(
                "Only JPEG, PNG, and WEBP images are supported",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        content = await file.read()
        if not content:
            raise ApplicationError(
                "Image file cannot be empty",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        if len(content) > self.settings.product_image_max_bytes:
            raise ApplicationError(
                "Image file must be 10 MB or smaller",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        return content, sha256(content).hexdigest(), ALLOWED_IMAGE_TYPES[file.content_type]

    def _write_file(self, product_id: UUID, file_name: str, content: bytes) -> str:
        """Persist image content and return its public URL."""
        product_dir = Path(self.settings.media_storage_path) / "products" / str(product_id)
        product_dir.mkdir(parents=True, exist_ok=True)
        target = product_dir / file_name
        target.write_bytes(content)
        return f"{self.settings.media_url_prefix}/products/{product_id}/{file_name}"
