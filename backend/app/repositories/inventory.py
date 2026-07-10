"""Inventory repository for database access."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import selectinload

from app.common.pagination import Page, PaginationParams, build_page
from app.models.brand import Brand
from app.models.category import Category
from app.models.inventory import Inventory, InventoryReservation, InventoryTransaction
from app.models.product import Product
from app.models.product_extension import ProductVariant
from app.models.seller import Seller
from app.repositories.base import BaseRepository
from app.schemas.inventory import InventoryFilter


class InventoryRepository(BaseRepository[Inventory]):
    """Repository for inventory persistence operations."""

    model = Inventory

    async def create(self, inventory: Inventory) -> Inventory:
        """Persist an inventory record."""
        return await self.add(inventory)

    async def get_active_by_id(self, inventory_id: UUID) -> Inventory | None:
        """Get a non-deleted inventory record by ID."""
        result = await self.session.execute(
            self._with_relationships().where(Inventory.id == inventory_id, Inventory.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_variant_id(self, variant_id: UUID, exclude_id: UUID | None = None) -> Inventory | None:
        """Get inventory by variant ID."""
        statement = select(Inventory).where(Inventory.variant_id == variant_id, Inventory.is_deleted.is_(False))
        if exclude_id:
            statement = statement.where(Inventory.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_variant_and_warehouse(
        self,
        variant_id: UUID,
        warehouse_id: UUID,
        exclude_id: UUID | None = None,
    ) -> Inventory | None:
        """Get inventory by variant and warehouse."""
        statement = select(Inventory).where(
            Inventory.variant_id == variant_id,
            Inventory.warehouse_id == warehouse_id,
            Inventory.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(Inventory.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_inventory(
        self,
        params: PaginationParams,
        filters: InventoryFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Inventory]:
        """List inventory with search, filters, sorting, and pagination."""
        statement = self._filtered_statement(filters, search)
        statement = self._apply_sort(statement, sort_by, sort_direction)
        total = await self.session.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
        result = await self.session.execute(
            statement.options(
                selectinload(Inventory.product).selectinload(Product.category),
                selectinload(Inventory.product).selectinload(Product.brand),
                selectinload(Inventory.product).selectinload(Product.seller),
                selectinload(Inventory.variant),
                selectinload(Inventory.warehouse),
            )
            .offset(params.offset)
            .limit(params.limit)
        )
        return build_page(list(result.scalars().unique().all()), total, params)

    async def update(self, inventory: Inventory) -> Inventory:
        """Flush inventory updates."""
        await self.session.flush()
        await self.session.refresh(inventory)
        return inventory

    async def soft_delete(self, inventory: Inventory) -> Inventory:
        """Soft delete inventory."""
        inventory.mark_deleted()
        inventory.status = "deleted"
        inventory.transfer_ready = False
        return await self.update(inventory)

    def _with_relationships(self) -> Select[tuple[Inventory]]:
        """Return inventory query with display relationships."""
        return select(Inventory).options(
            selectinload(Inventory.product).selectinload(Product.category),
            selectinload(Inventory.product).selectinload(Product.brand),
            selectinload(Inventory.product).selectinload(Product.seller),
            selectinload(Inventory.variant),
            selectinload(Inventory.warehouse),
        )

    def _filtered_statement(self, filters: InventoryFilter, search: str | None) -> Select[tuple[Inventory]]:
        """Build inventory list query."""
        statement = (
            select(Inventory)
            .join(Product, Inventory.product_id == Product.id)
            .join(ProductVariant, Inventory.variant_id == ProductVariant.id)
            .join(Category, Product.category_id == Category.id)
            .join(Brand, Product.brand_id == Brand.id)
            .join(Seller, Product.seller_id == Seller.id)
            .where(Inventory.is_deleted.is_(False))
        )
        if filters.status:
            statement = statement.where(Inventory.status == filters.status.value)
        if filters.low_stock is True:
            statement = statement.where(Inventory.status == "low_stock")
        if filters.out_of_stock is True:
            statement = statement.where(Inventory.status == "out_of_stock")
        if filters.category_id:
            statement = statement.where(Product.category_id == filters.category_id)
        if filters.brand_id:
            statement = statement.where(Product.brand_id == filters.brand_id)
        if filters.seller_id:
            statement = statement.where(Product.seller_id == filters.seller_id)
        if filters.warehouse_id:
            statement = statement.where(Inventory.warehouse_id == filters.warehouse_id)
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Product.product_name.ilike(pattern),
                    Inventory.sku.ilike(pattern),
                    ProductVariant.sku.ilike(pattern),
                    ProductVariant.barcode.ilike(pattern),
                    ProductVariant.variant_signature.ilike(pattern),
                    Category.category_name.ilike(pattern),
                    Brand.brand_name.ilike(pattern),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[Inventory]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[Inventory]]:
        """Apply inventory sorting."""
        columns = {
            "newest": Inventory.created_at,
            "oldest": Inventory.created_at,
            "created_at": Inventory.created_at,
            "available_quantity": Inventory.available_quantity,
            "reserved_quantity": Inventory.reserved_quantity,
            "status": Inventory.status,
            "sku": Inventory.sku,
        }
        normalized = sort_by or "newest"
        column = columns.get(normalized, Inventory.created_at)
        if normalized == "oldest" or sort_direction == "asc":
            return statement.order_by(column.asc())
        return statement.order_by(column.desc())


class InventoryTransactionRepository(BaseRepository[InventoryTransaction]):
    """Repository for immutable inventory transactions."""

    model = InventoryTransaction

    async def create(self, transaction: InventoryTransaction) -> InventoryTransaction:
        """Persist an inventory transaction."""
        return await self.add(transaction)

    async def list_history(self, inventory_id: UUID, params: PaginationParams) -> Page[InventoryTransaction]:
        """List transaction history."""
        statement = (
            select(InventoryTransaction)
            .where(InventoryTransaction.inventory_id == inventory_id)
            .order_by(InventoryTransaction.created_at.desc())
        )
        total = await self.session.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
        result = await self.session.execute(statement.offset(params.offset).limit(params.limit))
        return build_page(list(result.scalars().all()), total, params)


class InventoryReservationRepository(BaseRepository[InventoryReservation]):
    """Repository for inventory reservations."""

    model = InventoryReservation

    async def create(self, reservation: InventoryReservation) -> InventoryReservation:
        """Persist a reservation."""
        return await self.add(reservation)

    async def update(self, reservation: InventoryReservation) -> InventoryReservation:
        """Flush reservation updates."""
        await self.session.flush()
        await self.session.refresh(reservation)
        return reservation
