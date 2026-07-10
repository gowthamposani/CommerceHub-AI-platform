"""Warehouse repository for database access."""

from uuid import UUID

from sqlalchemy import Select, case, distinct, func, or_, select, update
from sqlalchemy.orm import selectinload

from app.common.pagination import Page, PaginationParams, build_page
from app.models.inventory import Inventory, InventoryTransaction
from app.models.seller import Seller
from app.models.warehouse import Warehouse
from app.repositories.base import BaseRepository
from app.schemas.warehouse import WarehouseFilter


class WarehouseRepository(BaseRepository[Warehouse]):
    """Repository for warehouse persistence operations."""

    model = Warehouse

    async def create(self, warehouse: Warehouse) -> Warehouse:
        """Persist a warehouse."""
        return await self.add(warehouse)

    async def get_active_by_id(self, warehouse_id: UUID) -> Warehouse | None:
        """Get non-deleted warehouse by ID."""
        result = await self.session.execute(
            select(Warehouse)
            .options(selectinload(Warehouse.seller))
            .where(Warehouse.id == warehouse_id, Warehouse.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, warehouse_code: str, exclude_id: UUID | None = None) -> Warehouse | None:
        """Get non-deleted warehouse by code."""
        statement = select(Warehouse).where(
            Warehouse.warehouse_code == warehouse_code.upper(),
            Warehouse.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(Warehouse.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_default_for_seller(self, seller_id: UUID, exclude_id: UUID | None = None) -> Warehouse | None:
        """Get seller default warehouse."""
        statement = select(Warehouse).where(
            Warehouse.seller_id == seller_id,
            Warehouse.is_default.is_(True),
            Warehouse.is_deleted.is_(False),
        )
        if exclude_id:
            statement = statement.where(Warehouse.id != exclude_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def clear_default_for_seller(self, seller_id: UUID, exclude_id: UUID | None = None) -> None:
        """Unset default flag for seller warehouses."""
        statement = (
            update(Warehouse)
            .where(Warehouse.seller_id == seller_id, Warehouse.is_deleted.is_(False))
            .values(is_default=False)
        )
        if exclude_id:
            statement = statement.where(Warehouse.id != exclude_id)
        await self.session.execute(statement)
        await self.session.flush()

    async def list_warehouses(
        self,
        params: PaginationParams,
        filters: WarehouseFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Warehouse]:
        """List warehouses with filtering, searching, sorting, and pagination."""
        statement = self._filtered_statement(filters, search)
        statement = self._apply_sort(statement, sort_by, sort_direction)
        total = await self.session.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
        result = await self.session.execute(
            statement.options(selectinload(Warehouse.seller)).offset(params.offset).limit(params.limit)
        )
        return build_page(list(result.scalars().unique().all()), total, params)

    async def update(self, warehouse: Warehouse) -> Warehouse:
        """Flush warehouse updates."""
        await self.session.flush()
        await self.session.refresh(warehouse)
        return warehouse

    async def soft_delete(self, warehouse: Warehouse) -> Warehouse:
        """Soft delete warehouse."""
        warehouse.mark_deleted()
        warehouse.status = "deleted"
        warehouse.is_default = False
        return await self.update(warehouse)

    async def count_blocking_inventory(self, warehouse_id: UUID) -> int:
        """Count active inventory records that block warehouse deletion."""
        return (
            await self.session.scalar(
                select(func.count()).where(
                    Inventory.warehouse_id == warehouse_id,
                    Inventory.is_deleted.is_(False),
                    Inventory.transfer_ready.is_(False),
                )
            )
            or 0
        )

    async def inventory_summary(self, warehouse_id: UUID) -> dict[str, int]:
        """Return inventory summary for a warehouse."""
        result = await self.session.execute(
            select(
                func.count(Inventory.id),
                func.count(distinct(Inventory.product_id)),
                func.count(distinct(Inventory.variant_id)),
                func.coalesce(func.sum(Inventory.available_quantity), 0),
                func.coalesce(func.sum(Inventory.reserved_quantity), 0),
                func.coalesce(func.sum(Inventory.damaged_quantity), 0),
                func.coalesce(func.sum(case((Inventory.status == "low_stock", 1), else_=0)), 0),
                func.coalesce(func.sum(case((Inventory.status == "out_of_stock", 1), else_=0)), 0),
                func.coalesce(func.sum(Inventory.maximum_stock), 0),
            ).where(Inventory.warehouse_id == warehouse_id, Inventory.is_deleted.is_(False))
        )
        row = result.one()
        return {
            "inventory_records": int(row[0] or 0),
            "unique_products": int(row[1] or 0),
            "unique_variants": int(row[2] or 0),
            "total_available_quantity": int(row[3] or 0),
            "total_reserved_quantity": int(row[4] or 0),
            "total_damaged_quantity": int(row[5] or 0),
            "low_stock_records": int(row[6] or 0),
            "out_of_stock_records": int(row[7] or 0),
            "capacity_units": int(row[8] or 0),
        }

    async def statistics(self, seller_id: UUID | None = None) -> dict[str, int]:
        """Return warehouse statistics, optionally scoped to seller."""
        warehouse_statement = select(
            func.count(Warehouse.id),
            func.coalesce(func.sum(case((Warehouse.status == "active", 1), else_=0)), 0),
            func.coalesce(func.sum(case((Warehouse.status == "inactive", 1), else_=0)), 0),
            func.coalesce(func.sum(case((Warehouse.is_default.is_(True), 1), else_=0)), 0),
        ).where(Warehouse.is_deleted.is_(False))
        inventory_statement = select(
            func.count(Inventory.id),
            func.coalesce(func.sum(Inventory.available_quantity), 0),
            func.coalesce(func.sum(Inventory.reserved_quantity), 0),
            func.coalesce(func.sum(Inventory.damaged_quantity), 0),
        ).where(Inventory.is_deleted.is_(False))
        if seller_id:
            warehouse_statement = warehouse_statement.where(Warehouse.seller_id == seller_id)
            inventory_statement = inventory_statement.join(Warehouse, Inventory.warehouse_id == Warehouse.id).where(
                Warehouse.seller_id == seller_id,
                Warehouse.is_deleted.is_(False),
            )

        warehouse_row = (await self.session.execute(warehouse_statement)).one()
        inventory_row = (await self.session.execute(inventory_statement)).one()
        return {
            "total_warehouses": int(warehouse_row[0] or 0),
            "active_warehouses": int(warehouse_row[1] or 0),
            "inactive_warehouses": int(warehouse_row[2] or 0),
            "default_warehouses": int(warehouse_row[3] or 0),
            "inventory_records": int(inventory_row[0] or 0),
            "total_available_quantity": int(inventory_row[1] or 0),
            "total_reserved_quantity": int(inventory_row[2] or 0),
            "total_damaged_quantity": int(inventory_row[3] or 0),
        }

    async def activity_transactions(self, warehouse_id: UUID, limit: int = 50) -> list[InventoryTransaction]:
        """Return recent inventory transactions for warehouse activity."""
        result = await self.session.execute(
            select(InventoryTransaction)
            .join(Inventory, InventoryTransaction.inventory_id == Inventory.id)
            .where(Inventory.warehouse_id == warehouse_id, Inventory.is_deleted.is_(False))
            .order_by(InventoryTransaction.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    def _filtered_statement(self, filters: WarehouseFilter, search: str | None) -> Select[tuple[Warehouse]]:
        """Build warehouse list query."""
        statement = (
            select(Warehouse)
            .join(Seller, Warehouse.seller_id == Seller.id)
            .where(Warehouse.is_deleted.is_(False))
        )
        if filters.seller_id:
            statement = statement.where(Warehouse.seller_id == filters.seller_id)
        if filters.status:
            statement = statement.where(Warehouse.status == filters.status.value)
        if filters.warehouse_type:
            statement = statement.where(Warehouse.warehouse_type == filters.warehouse_type.value)
        if filters.city:
            statement = statement.where(Warehouse.city.ilike(f"%{filters.city}%"))
        if filters.state:
            statement = statement.where(Warehouse.state.ilike(f"%{filters.state}%"))
        if filters.country:
            statement = statement.where(Warehouse.country.ilike(f"%{filters.country}%"))
        if filters.is_default is not None:
            statement = statement.where(Warehouse.is_default.is_(filters.is_default))
        if search:
            pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Warehouse.warehouse_code.ilike(pattern),
                    Warehouse.warehouse_name.ilike(pattern),
                    Warehouse.contact_person.ilike(pattern),
                    Warehouse.city.ilike(pattern),
                    Warehouse.state.ilike(pattern),
                    Seller.business_name.ilike(pattern),
                )
            )
        return statement

    def _apply_sort(
        self,
        statement: Select[tuple[Warehouse]],
        sort_by: str | None,
        sort_direction: str,
    ) -> Select[tuple[Warehouse]]:
        """Apply safe warehouse sorting."""
        columns = {
            "warehouse_name": Warehouse.warehouse_name,
            "warehouse_code": Warehouse.warehouse_code,
            "city": Warehouse.city,
            "status": Warehouse.status,
            "created_at": Warehouse.created_at,
            "updated_at": Warehouse.updated_at,
            "newest": Warehouse.created_at,
            "oldest": Warehouse.created_at,
        }
        normalized = sort_by or "newest"
        column = columns.get(normalized, Warehouse.created_at)
        if normalized == "oldest" or sort_direction == "asc":
            return statement.order_by(column.asc())
        return statement.order_by(column.desc())
