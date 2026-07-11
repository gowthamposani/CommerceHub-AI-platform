"""Seller repository for database access."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams, build_page
from app.models.seller import Seller
from app.repositories.base import BaseRepository
from app.schemas.seller import SellerFilter


class SellerRepository(BaseRepository[Seller]):
    """Repository for seller persistence operations."""

    model = Seller

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def create(self, seller: Seller) -> Seller:
        """Persist a seller."""
        return await self.add(seller)

    async def get_active_by_id(self, seller_id: UUID) -> Seller | None:
        """Get a non-deleted seller by ID."""
        result = await self.session.execute(select(Seller).where(Seller.id == seller_id, Seller.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: UUID) -> Seller | None:
        """Get a non-deleted seller by user ID."""
        result = await self.session.execute(
            select(Seller).where(Seller.user_id == user_id, Seller.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_gst(self, gst_number: str, exclude_id: UUID | None = None) -> Seller | None:
        """Get a seller by GST number."""
        statement = select(Seller).where(Seller.gst_number == gst_number, Seller.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Seller.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_pan(self, pan_number: str, exclude_id: UUID | None = None) -> Seller | None:
        """Get a seller by PAN number."""
        statement = select(Seller).where(Seller.pan_number == pan_number, Seller.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Seller.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_business_email(self, business_email: str, exclude_id: UUID | None = None) -> Seller | None:
        """Get a seller by business email."""
        statement = select(Seller).where(Seller.business_email == business_email, Seller.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Seller.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_sellers(
        self,
        params: PaginationParams,
        filters: SellerFilter,
        search: str | None = None,
        sort_by: str | None = None,
        sort_direction: str = "asc",
    ) -> Page[Seller]:
        """List sellers with search, filtering, sorting, and pagination."""
        statement = self._filtered_statement(filters, search)
        statement = self._apply_sort(statement, sort_by, sort_direction)

        count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
        total_items = await self.session.scalar(count_statement) or 0
        result = await self.session.execute(statement.offset(params.offset).limit(params.limit))
        return build_page(list(result.scalars().all()), total_items, params)

    async def update(self, seller: Seller) -> Seller:
        """Flush seller updates."""
        await self.session.flush()
        await self.session.refresh(seller)
        return seller

    async def soft_delete(self, seller: Seller) -> Seller:
        """Soft delete a seller."""
        seller.mark_deleted()
        seller.is_active = False
        seller.status = "deleted"
        return await self.update(seller)

    async def activate(self, seller: Seller) -> Seller:
        """Activate a seller."""
        seller.is_active = True
        seller.status = "active"
        return await self.update(seller)

    async def deactivate(self, seller: Seller) -> Seller:
        """Deactivate a seller."""
        seller.is_active = False
        seller.status = "inactive"
        return await self.update(seller)

    def _filtered_statement(self, filters: SellerFilter, search: str | None) -> Select[tuple[Seller]]:
        """Build seller list query."""
        statement = select(Seller).where(Seller.is_deleted.is_(False))
        if filters.status:
            statement = statement.where(Seller.status == filters.status.value)
        if filters.is_active is not None:
            statement = statement.where(Seller.is_active.is_(filters.is_active))
        if filters.is_verified is not None:
            statement = statement.where(Seller.is_verified.is_(filters.is_verified))
        if filters.business_type:
            statement = statement.where(Seller.business_type == filters.business_type.value)
        if filters.city:
            statement = statement.where(Seller.city.ilike(f"%{filters.city}%"))
        if filters.state:
            statement = statement.where(Seller.state.ilike(f"%{filters.state}%"))
        if filters.country:
            statement = statement.where(Seller.country.ilike(f"%{filters.country}%"))
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Seller.business_name.ilike(pattern),
                    Seller.legal_business_name.ilike(pattern),
                    Seller.business_email.ilike(pattern),
                    Seller.gst_number.ilike(pattern),
                    Seller.pan_number.ilike(pattern),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[Seller]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[Seller]]:
        """Apply safe sorting to seller list query."""
        allowed_sort_columns = {
            "business_name": Seller.business_name,
            "business_email": Seller.business_email,
            "status": Seller.status,
            "created_at": Seller.created_at,
            "updated_at": Seller.updated_at,
        }
        column = allowed_sort_columns.get(sort_by or "created_at", Seller.created_at)
        return statement.order_by(column.desc() if sort_direction == "desc" else column.asc())
