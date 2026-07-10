"""Read-only repository for Seller Dashboard aggregations."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Select, case, distinct, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import PaginationParams, build_page
from app.models.category import Category
from app.models.inventory import Inventory, InventoryTransaction
from app.models.product import Product
from app.models.seller import Seller
from app.models.warehouse import Warehouse
from app.schemas.seller_dashboard import (
    DashboardActivity,
    DashboardAlert,
    DashboardChartPoint,
    DashboardRankedItem,
    DashboardSearchResponse,
    DashboardSearchResult,
    DashboardTrendPoint,
    InventoryMetrics,
    ProductMetrics,
    WarehouseMetrics,
)


class SellerDashboardRepository:
    """Database access for seller dashboard read models."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_seller(self, seller_id: UUID) -> Seller | None:
        """Return an active seller profile."""
        result = await self.session.execute(
            select(Seller).where(Seller.id == seller_id, Seller.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def product_metrics(self, seller_id: UUID, start_at: datetime, end_at: datetime) -> ProductMetrics:
        """Aggregate product metrics for a seller."""
        row = (
            await self.session.execute(
                select(
                    func.count(Product.id),
                    func.coalesce(func.sum(case((Product.status == "published", 1), else_=0)), 0),
                    func.coalesce(func.sum(case((Product.status == "draft", 1), else_=0)), 0),
                    func.coalesce(
                        func.sum(case((or_(Product.status == "archived", Product.is_active.is_(False)), 1), else_=0)),
                        0,
                    ),
                ).where(Product.seller_id == seller_id, Product.is_deleted.is_(False))
            )
        ).one()
        stock_row = (
            await self.session.execute(
                select(
                    func.count(distinct(case((Inventory.status == "out_of_stock", Inventory.product_id)))),
                    func.count(distinct(case((Inventory.status == "low_stock", Inventory.product_id)))),
                )
                .join(Product, Inventory.product_id == Product.id)
                .where(Product.seller_id == seller_id, Product.is_deleted.is_(False), Inventory.is_deleted.is_(False))
            )
        ).one()
        return ProductMetrics(
            total_products=int(row[0] or 0),
            active_products=int(row[1] or 0),
            draft_products=int(row[2] or 0),
            disabled_products=int(row[3] or 0),
            out_of_stock_products=int(stock_row[0] or 0),
            low_stock_products=int(stock_row[1] or 0),
            best_selling_products=await self.top_products(seller_id, limit=5),
            newly_added_products=await self.new_products(seller_id, start_at, end_at, limit=5),
        )

    async def inventory_metrics(self, seller_id: UUID) -> InventoryMetrics:
        """Aggregate inventory balances and valuation for a seller."""
        row = (
            await self.session.execute(
                select(
                    func.coalesce(func.sum(Inventory.available_quantity), 0),
                    func.coalesce(func.sum(Inventory.reserved_quantity), 0),
                    func.coalesce(func.sum(Inventory.damaged_quantity), 0),
                    func.coalesce(func.sum(Inventory.available_quantity * Product.price), 0),
                )
                .join(Product, Inventory.product_id == Product.id)
                .where(Product.seller_id == seller_id, Product.is_deleted.is_(False), Inventory.is_deleted.is_(False))
            )
        ).one()
        available = int(row[0] or 0)
        reserved = int(row[1] or 0)
        damaged = int(row[2] or 0)
        return InventoryMetrics(
            total_inventory=available + reserved + damaged,
            reserved_inventory=reserved,
            available_inventory=available,
            damaged_inventory=damaged,
            inventory_value=Decimal(row[3] or 0),
            stock_alerts=await self.stock_alerts(seller_id, limit=10),
        )

    async def warehouse_metrics(self, seller_id: UUID) -> WarehouseMetrics:
        """Aggregate warehouse metrics for a seller."""
        row = (
            await self.session.execute(
                select(
                    func.count(Warehouse.id),
                    func.coalesce(func.sum(case((Warehouse.status == "active", 1), else_=0)), 0),
                    func.coalesce(func.sum(case((Warehouse.status != "active", 1), else_=0)), 0),
                ).where(Warehouse.seller_id == seller_id, Warehouse.is_deleted.is_(False))
            )
        ).one()
        capacity = await self.warehouse_capacity_points(seller_id)
        total_capacity = sum(int(point.metadata.get("capacity_units", 0)) for point in capacity)
        used_capacity = sum(int(point.value) for point in capacity)
        utilization = Decimal("0.00")
        if total_capacity > 0:
            utilization = (Decimal(used_capacity) / Decimal(total_capacity) * Decimal("100")).quantize(
                Decimal("0.01")
            )
        return WarehouseMetrics(
            total_warehouses=int(row[0] or 0),
            active_warehouses=int(row[1] or 0),
            disabled_warehouses=int(row[2] or 0),
            capacity_utilization=utilization,
            inventory_distribution=await self.inventory_distribution(seller_id),
            warehouse_performance=await self.warehouse_performance(seller_id),
        )

    async def stock_alerts(self, seller_id: UUID, limit: int) -> list[DashboardAlert]:
        """Return low-stock and out-of-stock inventory alerts."""
        result = await self.session.execute(
            select(Inventory, Product.product_name)
            .join(Product, Inventory.product_id == Product.id)
            .where(
                Product.seller_id == seller_id,
                Product.is_deleted.is_(False),
                Inventory.is_deleted.is_(False),
                Inventory.status.in_(("low_stock", "out_of_stock")),
            )
            .order_by(Inventory.updated_at.desc())
            .limit(limit)
        )
        alerts: list[DashboardAlert] = []
        for inventory, product_name in result.all():
            severity = "critical" if inventory.status == "out_of_stock" else "warning"
            alerts.append(
                DashboardAlert(
                    id=f"inventory-{inventory.id}",
                    type=inventory.status,
                    severity=severity,
                    title="Stock alert",
                    message=f"{product_name} has {inventory.available_quantity} available units.",
                    entity_id=inventory.id,
                    entity_type="inventory",
                    created_at=inventory.updated_at,
                )
            )
        return alerts

    async def warehouse_capacity_alerts(self, seller_id: UUID, limit: int) -> list[DashboardAlert]:
        """Return warehouse capacity alerts."""
        points = await self.warehouse_capacity_points(seller_id)
        alerts: list[DashboardAlert] = []
        for point in points[:limit]:
            capacity_units = int(point.metadata.get("capacity_units", 0))
            if capacity_units <= 0:
                continue
            utilization = Decimal(point.value) / Decimal(capacity_units) * Decimal("100")
            if utilization >= Decimal("90"):
                alerts.append(
                    DashboardAlert(
                        id=f"warehouse-capacity-{point.metadata['warehouse_id']}",
                        type="warehouse_capacity",
                        severity="critical" if utilization >= Decimal("100") else "warning",
                        title="Warehouse capacity alert",
                        message=f"{point.label} is {utilization.quantize(Decimal('0.01'))}% utilized.",
                        entity_id=UUID(str(point.metadata["warehouse_id"])),
                        entity_type="warehouse",
                        created_at=datetime.now().astimezone(),
                    )
                )
        return alerts

    async def top_products(self, seller_id: UUID, limit: int) -> list[DashboardRankedItem]:
        """Return product ranking by inventory movement volume."""
        result = await self.session.execute(
            select(Product.id, Product.product_name, func.coalesce(func.sum(InventoryTransaction.quantity), 0))
            .join(Inventory, Inventory.product_id == Product.id, isouter=True)
            .join(InventoryTransaction, InventoryTransaction.inventory_id == Inventory.id, isouter=True)
            .where(Product.seller_id == seller_id, Product.is_deleted.is_(False))
            .group_by(Product.id, Product.product_name)
            .order_by(func.coalesce(func.sum(InventoryTransaction.quantity), 0).desc(), Product.created_at.desc())
            .limit(limit)
        )
        return [
            DashboardRankedItem(id=row[0], label=row[1], value=int(row[2] or 0), metadata={"metric": "stock_movement"})
            for row in result.all()
        ]

    async def new_products(
        self,
        seller_id: UUID,
        start_at: datetime,
        end_at: datetime,
        limit: int,
    ) -> list[DashboardRankedItem]:
        """Return newly created products in the dashboard window."""
        result = await self.session.execute(
            select(Product.id, Product.product_name, Product.status)
            .where(
                Product.seller_id == seller_id,
                Product.is_deleted.is_(False),
                Product.created_at >= start_at,
                Product.created_at <= end_at,
            )
            .order_by(Product.created_at.desc())
            .limit(limit)
        )
        return [
            DashboardRankedItem(id=row[0], label=row[1], value=row[2], metadata={"metric": "new_product"})
            for row in result.all()
        ]

    async def inventory_distribution(self, seller_id: UUID) -> list[DashboardChartPoint]:
        """Return inventory quantity distribution by warehouse."""
        result = await self.session.execute(
            select(
                Warehouse.warehouse_name,
                func.coalesce(func.sum(Inventory.available_quantity + Inventory.reserved_quantity), 0),
                Warehouse.id,
            )
            .join(Inventory, Inventory.warehouse_id == Warehouse.id, isouter=True)
            .where(Warehouse.seller_id == seller_id, Warehouse.is_deleted.is_(False))
            .group_by(Warehouse.id, Warehouse.warehouse_name)
            .order_by(Warehouse.warehouse_name.asc())
        )
        return [
            DashboardChartPoint(label=row[0], value=int(row[1] or 0), metadata={"warehouse_id": str(row[2])})
            for row in result.all()
        ]

    async def warehouse_capacity_points(self, seller_id: UUID) -> list[DashboardChartPoint]:
        """Return warehouse capacity usage points."""
        result = await self.session.execute(
            select(
                Warehouse.id,
                Warehouse.warehouse_name,
                func.coalesce(func.sum(Inventory.available_quantity + Inventory.reserved_quantity), 0),
                func.coalesce(func.sum(Inventory.maximum_stock), 0),
            )
            .join(Inventory, Inventory.warehouse_id == Warehouse.id, isouter=True)
            .where(Warehouse.seller_id == seller_id, Warehouse.is_deleted.is_(False))
            .group_by(Warehouse.id, Warehouse.warehouse_name)
            .order_by(Warehouse.warehouse_name.asc())
        )
        return [
            DashboardChartPoint(
                label=row[1],
                value=int(row[2] or 0),
                metadata={"warehouse_id": str(row[0]), "capacity_units": int(row[3] or 0)},
            )
            for row in result.all()
        ]

    async def warehouse_performance(self, seller_id: UUID) -> list[DashboardRankedItem]:
        """Return warehouses ranked by inventory movements."""
        result = await self.session.execute(
            select(Warehouse.id, Warehouse.warehouse_name, func.coalesce(func.sum(InventoryTransaction.quantity), 0))
            .join(Inventory, Inventory.warehouse_id == Warehouse.id, isouter=True)
            .join(InventoryTransaction, InventoryTransaction.inventory_id == Inventory.id, isouter=True)
            .where(Warehouse.seller_id == seller_id, Warehouse.is_deleted.is_(False))
            .group_by(Warehouse.id, Warehouse.warehouse_name)
            .order_by(func.coalesce(func.sum(InventoryTransaction.quantity), 0).desc())
            .limit(5)
        )
        return [
            DashboardRankedItem(id=row[0], label=row[1], value=int(row[2] or 0), metadata={"metric": "stock_movement"})
            for row in result.all()
        ]

    async def product_creation_trend(
        self,
        seller_id: UUID,
        start_at: datetime,
        end_at: datetime,
    ) -> list[DashboardTrendPoint]:
        """Return product creation trend for the dashboard window."""
        result = await self.session.execute(
            select(func.date(Product.created_at), func.count(Product.id))
            .where(
                Product.seller_id == seller_id,
                Product.is_deleted.is_(False),
                Product.created_at >= start_at,
                Product.created_at <= end_at,
            )
            .group_by(func.date(Product.created_at))
            .order_by(func.date(Product.created_at).asc())
        )
        return [DashboardTrendPoint(period=str(row[0]), value=int(row[1] or 0)) for row in result.all()]

    async def inventory_movement_trend(
        self,
        seller_id: UUID,
        start_at: datetime,
        end_at: datetime,
    ) -> list[DashboardTrendPoint]:
        """Return inventory movement trend for the dashboard window."""
        result = await self.session.execute(
            select(
                func.date(InventoryTransaction.created_at),
                func.coalesce(func.sum(InventoryTransaction.quantity), 0),
            )
            .join(Inventory, InventoryTransaction.inventory_id == Inventory.id)
            .join(Product, Inventory.product_id == Product.id)
            .where(
                Product.seller_id == seller_id,
                Product.is_deleted.is_(False),
                Inventory.is_deleted.is_(False),
                InventoryTransaction.created_at >= start_at,
                InventoryTransaction.created_at <= end_at,
            )
            .group_by(func.date(InventoryTransaction.created_at))
            .order_by(func.date(InventoryTransaction.created_at).asc())
        )
        return [DashboardTrendPoint(period=str(row[0]), value=int(row[1] or 0)) for row in result.all()]

    async def category_product_points(self, seller_id: UUID) -> list[DashboardChartPoint]:
        """Return category distribution by product count."""
        result = await self.session.execute(
            select(Category.category_name, func.count(Product.id))
            .join(Product, Product.category_id == Category.id)
            .where(Product.seller_id == seller_id, Product.is_deleted.is_(False), Category.is_deleted.is_(False))
            .group_by(Category.id, Category.category_name)
            .order_by(func.count(Product.id).desc())
            .limit(10)
        )
        return [DashboardChartPoint(label=row[0], value=int(row[1] or 0)) for row in result.all()]

    async def recent_activities(self, seller_id: UUID, limit: int) -> list[DashboardActivity]:
        """Return recent seller activities from existing module data."""
        activities: list[DashboardActivity] = []
        product_rows = await self.session.execute(
            select(Product.id, Product.product_name, Product.status, Product.updated_at)
            .where(Product.seller_id == seller_id, Product.is_deleted.is_(False))
            .order_by(Product.updated_at.desc())
            .limit(limit)
        )
        for product_id, product_name, product_status, updated_at in product_rows.all():
            activities.append(
                DashboardActivity(
                    id=f"product-{product_id}",
                    type="product",
                    label="Product Updated",
                    description=f"{product_name} is {product_status}.",
                    entity_id=product_id,
                    entity_type="product",
                    created_at=updated_at,
                )
            )

        warehouse_rows = await self.session.execute(
            select(Warehouse.id, Warehouse.warehouse_name, Warehouse.status, Warehouse.updated_at)
            .where(Warehouse.seller_id == seller_id, Warehouse.is_deleted.is_(False))
            .order_by(Warehouse.updated_at.desc())
            .limit(limit)
        )
        for warehouse_id, warehouse_name, warehouse_status, updated_at in warehouse_rows.all():
            activities.append(
                DashboardActivity(
                    id=f"warehouse-{warehouse_id}",
                    type="warehouse",
                    label="Warehouse Updated",
                    description=f"{warehouse_name} is {warehouse_status}.",
                    entity_id=warehouse_id,
                    entity_type="warehouse",
                    created_at=updated_at,
                )
            )

        transaction_rows = await self.session.execute(
            select(
                InventoryTransaction.id,
                InventoryTransaction.transaction_type,
                InventoryTransaction.quantity,
                InventoryTransaction.created_at,
            )
            .join(Inventory, InventoryTransaction.inventory_id == Inventory.id)
            .join(Product, Inventory.product_id == Product.id)
            .where(Product.seller_id == seller_id, Product.is_deleted.is_(False), Inventory.is_deleted.is_(False))
            .order_by(InventoryTransaction.created_at.desc())
            .limit(limit)
        )
        for transaction_id, transaction_type, quantity, created_at in transaction_rows.all():
            activities.append(
                DashboardActivity(
                    id=f"inventory-{transaction_id}",
                    type="inventory",
                    label="Inventory Updated",
                    description=f"{quantity} units processed by {transaction_type}.",
                    entity_id=transaction_id,
                    entity_type="inventory_transaction",
                    created_at=created_at,
                )
            )

        activities.sort(key=lambda item: item.created_at, reverse=True)
        return activities[:limit]

    async def search(
        self,
        seller_id: UUID,
        query: str,
        params: PaginationParams,
    ) -> DashboardSearchResponse:
        """Search seller-owned products, inventory, and warehouses."""
        pattern = f"%{query}%"
        statements = [
            self._product_search_statement(seller_id, pattern),
            self._inventory_search_statement(seller_id, pattern),
            self._warehouse_search_statement(seller_id, pattern),
        ]
        items: list[DashboardSearchResult] = []
        result_types = ("product", "inventory", "warehouse")
        for index, statement in enumerate(statements):
            result = await self.session.execute(statement)
            for row in result.all():
                items.append(
                    DashboardSearchResult(
                        id=row.id,
                        type=result_types[index],
                        label=row.label,
                        description=row.description,
                        status=row.status,
                        created_at=row.created_at,
                    )
                )
        items.sort(key=lambda item: item.created_at, reverse=True)
        page_items = items[params.offset : params.offset + params.limit]
        return DashboardSearchResponse(items=page_items, meta=build_page(page_items, len(items), params).meta)

    def _product_search_statement(self, seller_id: UUID, pattern: str) -> Select[tuple[DashboardSearchResult]]:
        """Build product search projection."""
        return select(
            Product.id.label("id"),
            Product.product_name.label("label"),
            Product.short_description.label("description"),
            Product.status.label("status"),
            Product.created_at.label("created_at"),
        ).where(
            Product.seller_id == seller_id,
            Product.is_deleted.is_(False),
            or_(Product.product_name.ilike(pattern), Product.sku.ilike(pattern), Product.barcode.ilike(pattern)),
        )

    def _inventory_search_statement(self, seller_id: UUID, pattern: str) -> Select[tuple[DashboardSearchResult]]:
        """Build inventory search projection."""
        return select(
            Inventory.id.label("id"),
            Inventory.sku.label("label"),
            Product.product_name.label("description"),
            Inventory.status.label("status"),
            Inventory.created_at.label("created_at"),
        ).join(Product, Inventory.product_id == Product.id).where(
            Product.seller_id == seller_id,
            Product.is_deleted.is_(False),
            Inventory.is_deleted.is_(False),
            or_(Inventory.sku.ilike(pattern), Product.product_name.ilike(pattern)),
        )

    def _warehouse_search_statement(self, seller_id: UUID, pattern: str) -> Select[tuple[DashboardSearchResult]]:
        """Build warehouse search projection."""
        return select(
            Warehouse.id.label("id"),
            Warehouse.warehouse_name.label("label"),
            Warehouse.city.label("description"),
            Warehouse.status.label("status"),
            Warehouse.created_at.label("created_at"),
        ).where(
            Warehouse.seller_id == seller_id,
            Warehouse.is_deleted.is_(False),
            or_(
                Warehouse.warehouse_name.ilike(pattern),
                Warehouse.warehouse_code.ilike(pattern),
                Warehouse.city.ilike(pattern),
            ),
        )
