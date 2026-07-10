"""Seller service layer."""

from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams
from app.exceptions.base import ApplicationError
from app.models.seller import Seller
from app.repositories.seller import SellerRepository
from app.schemas.seller import SellerCreate, SellerFilter, SellerUpdate


class SellerService:
    """Business logic for Seller Management."""

    def __init__(self, session: AsyncSession, repository: SellerRepository | None = None) -> None:
        self.session = session
        self.repository = repository or SellerRepository(session)

    async def create_seller(self, payload: SellerCreate) -> Seller:
        """Create a seller after validating uniqueness."""
        await self._validate_unique_fields(
            user_id=payload.user_id,
            gst_number=payload.gst_number,
            pan_number=payload.pan_number,
            business_email=str(payload.business_email),
        )
        data = payload.model_dump()
        data["business_email"] = str(payload.business_email)
        data["website"] = str(payload.website) if payload.website else None
        data["logo_url"] = str(payload.logo_url) if payload.logo_url else None
        data["business_type"] = payload.business_type.value
        data["status"] = "pending"

        seller = Seller(**data)
        await self.repository.create(seller)
        await self.session.commit()
        await self.session.refresh(seller)
        return seller

    async def get_seller(self, seller_id: UUID) -> Seller:
        """Get a seller by ID or raise 404."""
        seller = await self.repository.get_active_by_id(seller_id)
        if seller is None:
            raise ApplicationError("Seller not found", status_code=status.HTTP_404_NOT_FOUND)
        return seller

    async def get_seller_by_user_id(self, user_id: UUID) -> Seller:
        """Get a seller by user ID or raise 404."""
        seller = await self.repository.get_by_user_id(user_id)
        if seller is None:
            raise ApplicationError("Seller not found", status_code=status.HTTP_404_NOT_FOUND)
        return seller

    async def list_sellers(
        self,
        params: PaginationParams,
        filters: SellerFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Seller]:
        """List sellers with filters, search, sorting, and pagination."""
        return await self.repository.list_sellers(params, filters, search, sort_by, sort_direction)

    async def update_seller(self, seller_id: UUID, payload: SellerUpdate) -> Seller:
        """Update seller details after uniqueness validation."""
        seller = await self.get_seller(seller_id)
        update_data = payload.model_dump(exclude_unset=True)

        await self._validate_update_uniqueness(seller_id, update_data)

        for key, value in update_data.items():
            if key in {"website", "logo_url"} and value is not None:
                value = str(value)
            if key == "business_email" and value is not None:
                value = str(value)
            if key == "business_type" and value is not None:
                value = value.value
            setattr(seller, key, value)

        await self.repository.update(seller)
        await self.session.commit()
        await self.session.refresh(seller)
        return seller

    async def activate_seller(self, seller_id: UUID) -> Seller:
        """Activate a seller."""
        seller = await self.get_seller(seller_id)
        await self.repository.activate(seller)
        await self.session.commit()
        await self.session.refresh(seller)
        return seller

    async def deactivate_seller(self, seller_id: UUID) -> Seller:
        """Deactivate a seller."""
        seller = await self.get_seller(seller_id)
        await self.repository.deactivate(seller)
        await self.session.commit()
        await self.session.refresh(seller)
        return seller

    async def soft_delete_seller(self, seller_id: UUID) -> Seller:
        """Soft delete a seller."""
        seller = await self.get_seller(seller_id)
        await self.repository.soft_delete(seller)
        await self.session.commit()
        await self.session.refresh(seller)
        return seller

    async def _validate_unique_fields(
        self,
        user_id: UUID,
        gst_number: str,
        pan_number: str,
        business_email: str,
    ) -> None:
        """Validate seller unique fields."""
        if await self.repository.get_by_user_id(user_id):
            raise ApplicationError("Seller already exists for this user", status_code=status.HTTP_409_CONFLICT)
        if await self.repository.get_by_gst(gst_number):
            raise ApplicationError("GST number already exists", status_code=status.HTTP_409_CONFLICT)
        if await self.repository.get_by_pan(pan_number):
            raise ApplicationError("PAN number already exists", status_code=status.HTTP_409_CONFLICT)
        if await self.repository.get_by_business_email(business_email):
            raise ApplicationError("Business email already exists", status_code=status.HTTP_409_CONFLICT)

    async def _validate_update_uniqueness(self, seller_id: UUID, update_data: dict[str, object]) -> None:
        """Validate unique fields during seller update."""
        gst_number = update_data.get("gst_number")
        if isinstance(gst_number, str) and await self.repository.get_by_gst(gst_number, exclude_id=seller_id):
            raise ApplicationError("GST number already exists", status_code=status.HTTP_409_CONFLICT)

        pan_number = update_data.get("pan_number")
        if isinstance(pan_number, str) and await self.repository.get_by_pan(pan_number, exclude_id=seller_id):
            raise ApplicationError("PAN number already exists", status_code=status.HTTP_409_CONFLICT)

        business_email = update_data.get("business_email")
        if business_email and await self.repository.get_by_business_email(str(business_email), exclude_id=seller_id):
            raise ApplicationError("Business email already exists", status_code=status.HTTP_409_CONFLICT)
