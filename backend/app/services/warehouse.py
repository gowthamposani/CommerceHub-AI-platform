"""Warehouse service layer."""

import logging
from decimal import ROUND_HALF_UP, Decimal
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.common.pagination import Page, PaginationParams
from app.dependencies.request import CurrentUserPlaceholder
from app.exceptions.base import ApplicationError
from app.models.inventory import Inventory, InventoryTransaction
from app.models.warehouse import Warehouse
from app.repositories.inventory import InventoryRepository, InventoryTransactionRepository
from app.repositories.seller import SellerRepository
from app.repositories.warehouse import WarehouseRepository
from app.schemas.inventory import InventoryTransactionType
from app.schemas.warehouse import (
    WarehouseActivityListResponse,
    WarehouseActivityResponse,
    WarehouseCapacityResponse,
    WarehouseCreate,
    WarehouseFilter,
    WarehouseInventorySummaryResponse,
    WarehouseStatisticsResponse,
    WarehouseStatusUpdate,
    WarehouseTransferRequest,
    WarehouseTransferResponse,
    WarehouseUpdate,
)

logger = logging.getLogger(__name__)


class WarehouseService:
    """Business logic for Warehouse Management."""

    def __init__(
        self,
        session: AsyncSession,
        repository: WarehouseRepository | None = None,
        seller_repository: SellerRepository | None = None,
        inventory_repository: InventoryRepository | None = None,
        transaction_repository: InventoryTransactionRepository | None = None,
    ) -> None:
        self.session = session
        self.repository = repository or WarehouseRepository(session)
        self.seller_repository = seller_repository or SellerRepository(session)
        self.inventory_repository = inventory_repository or InventoryRepository(session)
        self.transaction_repository = transaction_repository or InventoryTransactionRepository(session)

    async def create_warehouse(
        self,
        payload: WarehouseCreate,
        current_user: CurrentUserPlaceholder,
    ) -> Warehouse:
        """Create a warehouse after validating seller ownership and unique code."""
        await self._require_seller(payload.seller_id)
        self._authorize_seller_access(payload.seller_id, current_user)
        await self._validate_unique_code(payload.warehouse_code)
        if payload.is_default:
            await self.repository.clear_default_for_seller(payload.seller_id)

        warehouse = Warehouse(
            **payload.model_dump(exclude={"warehouse_type", "status"}),
            warehouse_type=payload.warehouse_type.value,
            status=payload.status.value,
            created_by=current_user.id,
            updated_by=current_user.id,
        )
        await self.repository.create(warehouse)
        await self.session.commit()
        await self.session.refresh(warehouse)
        logger.info(
            "Warehouse created",
            extra={"warehouse_id": str(warehouse.id), "seller_id": str(warehouse.seller_id)},
        )
        return await self.get_warehouse(warehouse.id, current_user)

    async def get_warehouse(self, warehouse_id: UUID, current_user: CurrentUserPlaceholder) -> Warehouse:
        """Get warehouse by ID."""
        warehouse = await self.repository.get_active_by_id(warehouse_id)
        if warehouse is None:
            raise ApplicationError("Warehouse not found", status_code=status.HTTP_404_NOT_FOUND)
        self._authorize_seller_access(warehouse.seller_id, current_user)
        return warehouse

    async def list_warehouses(
        self,
        params: PaginationParams,
        filters: WarehouseFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
        current_user: CurrentUserPlaceholder,
    ) -> Page[Warehouse]:
        """List warehouses."""
        scoped_filters = self._scope_filters(filters, current_user)
        return await self.repository.list_warehouses(params, scoped_filters, search, sort_by, sort_direction)

    async def update_warehouse(
        self,
        warehouse_id: UUID,
        payload: WarehouseUpdate,
        current_user: CurrentUserPlaceholder,
    ) -> Warehouse:
        """Update warehouse details."""
        warehouse = await self.get_warehouse(warehouse_id, current_user)
        update_data = payload.model_dump(exclude_unset=True)
        if update_data.get("is_default") is True:
            await self.repository.clear_default_for_seller(warehouse.seller_id, exclude_id=warehouse.id)
        for key, value in update_data.items():
            if key in {"warehouse_type", "status"} and value is not None:
                value = value.value
            setattr(warehouse, key, value)
        warehouse.updated_by = current_user.id
        await self.repository.update(warehouse)
        await self.session.commit()
        await self.session.refresh(warehouse)
        logger.info("Warehouse updated", extra={"warehouse_id": str(warehouse.id)})
        return await self.get_warehouse(warehouse.id, current_user)

    async def delete_warehouse(self, warehouse_id: UUID, current_user: CurrentUserPlaceholder) -> Warehouse:
        """Soft delete warehouse if inventory has been transferred or does not exist."""
        warehouse = await self.get_warehouse(warehouse_id, current_user)
        blocking_inventory = await self.repository.count_blocking_inventory(warehouse.id)
        if blocking_inventory > 0:
            raise ApplicationError(
                "Warehouse cannot be deleted until inventory is transferred",
                status_code=status.HTTP_409_CONFLICT,
            )
        warehouse.updated_by = current_user.id
        await self.repository.soft_delete(warehouse)
        await self.session.commit()
        logger.info("Warehouse deleted", extra={"warehouse_id": str(warehouse.id)})
        return warehouse

    async def set_default_warehouse(self, warehouse_id: UUID, current_user: CurrentUserPlaceholder) -> Warehouse:
        """Set one warehouse as default for its seller."""
        warehouse = await self.get_warehouse(warehouse_id, current_user)
        await self.repository.clear_default_for_seller(warehouse.seller_id, exclude_id=warehouse.id)
        warehouse.is_default = True
        warehouse.updated_by = current_user.id
        await self.repository.update(warehouse)
        await self.session.commit()
        await self.session.refresh(warehouse)
        logger.info("Default warehouse changed", extra={"warehouse_id": str(warehouse.id)})
        return await self.get_warehouse(warehouse.id, current_user)

    async def update_status(
        self,
        warehouse_id: UUID,
        payload: WarehouseStatusUpdate,
        current_user: CurrentUserPlaceholder,
    ) -> Warehouse:
        """Update warehouse status."""
        warehouse = await self.get_warehouse(warehouse_id, current_user)
        warehouse.status = payload.status.value
        if payload.status.value != "active":
            warehouse.is_default = False
        warehouse.updated_by = current_user.id
        await self.repository.update(warehouse)
        await self.session.commit()
        await self.session.refresh(warehouse)
        logger.info("Warehouse status updated", extra={"warehouse_id": str(warehouse.id), "status": warehouse.status})
        return await self.get_warehouse(warehouse.id, current_user)

    async def statistics(
        self,
        seller_id: UUID | None,
        current_user: CurrentUserPlaceholder,
    ) -> WarehouseStatisticsResponse:
        """Return warehouse statistics."""
        scoped_seller_id = self._scope_seller_id(seller_id, current_user)
        return WarehouseStatisticsResponse(**await self.repository.statistics(scoped_seller_id))

    async def capacity(
        self,
        warehouse_id: UUID,
        current_user: CurrentUserPlaceholder,
    ) -> WarehouseCapacityResponse:
        """Return capacity details for a warehouse."""
        await self.get_warehouse(warehouse_id, current_user)
        summary = await self.repository.inventory_summary(warehouse_id)
        utilized = (
            summary["total_available_quantity"]
            + summary["total_reserved_quantity"]
            + summary["total_damaged_quantity"]
        )
        capacity = summary["capacity_units"] or None
        available_capacity = capacity - utilized if capacity is not None else None
        utilization = None
        if capacity:
            utilization = (Decimal(utilized) / Decimal(capacity) * Decimal("100")).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )
        return WarehouseCapacityResponse(
            warehouse_id=warehouse_id,
            capacity_units=capacity,
            utilized_units=utilized,
            available_capacity_units=available_capacity,
            utilization_percentage=utilization,
        )

    async def inventory_summary(
        self,
        warehouse_id: UUID,
        current_user: CurrentUserPlaceholder,
    ) -> WarehouseInventorySummaryResponse:
        """Return inventory summary for a warehouse."""
        await self.get_warehouse(warehouse_id, current_user)
        summary = await self.repository.inventory_summary(warehouse_id)
        return WarehouseInventorySummaryResponse(warehouse_id=warehouse_id, **summary)

    async def transfer_inventory(
        self,
        payload: WarehouseTransferRequest,
        current_user: CurrentUserPlaceholder,
    ) -> WarehouseTransferResponse:
        """Transfer available inventory from one warehouse to another."""
        source = await self.get_warehouse(payload.source_warehouse_id, current_user)
        destination = await self.get_warehouse(payload.destination_warehouse_id, current_user)
        if source.seller_id != destination.seller_id:
            raise ApplicationError(
                "Inventory cannot be transferred across sellers",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        inventory = await self.inventory_repository.get_active_by_id(payload.inventory_id)
        if inventory is None:
            raise ApplicationError("Inventory not found", status_code=status.HTTP_404_NOT_FOUND)
        if inventory.warehouse_id != source.id:
            raise ApplicationError(
                "Inventory does not belong to source warehouse",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        if inventory.available_quantity < payload.quantity:
            raise ApplicationError(
                "Transfer quantity cannot exceed available stock",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        destination_inventory = await self.inventory_repository.get_by_variant_and_warehouse(
            inventory.variant_id,
            destination.id,
        )
        source_previous = inventory.available_quantity
        inventory.available_quantity -= payload.quantity
        self._refresh_inventory_status(inventory)
        await self._record_transfer_transaction(
            inventory,
            InventoryTransactionType.STOCK_OUT,
            payload,
            source_previous,
            inventory.available_quantity,
            destination.warehouse_code,
        )

        if destination_inventory is None:
            destination_inventory = Inventory(
                product_id=inventory.product_id,
                variant_id=inventory.variant_id,
                warehouse_id=destination.id,
                sku=inventory.sku,
                available_quantity=0,
                reserved_quantity=0,
                damaged_quantity=0,
                minimum_stock=inventory.minimum_stock,
                maximum_stock=inventory.maximum_stock,
                reorder_level=inventory.reorder_level,
                transfer_ready=True,
            )
            await self.inventory_repository.create(destination_inventory)
            await self.session.flush()

        destination_previous = destination_inventory.available_quantity
        destination_inventory.available_quantity += payload.quantity
        self._refresh_inventory_status(destination_inventory)
        await self._record_transfer_transaction(
            destination_inventory,
            InventoryTransactionType.STOCK_IN,
            payload,
            destination_previous,
            destination_inventory.available_quantity,
            source.warehouse_code,
        )

        await self.inventory_repository.update(inventory)
        await self.inventory_repository.update(destination_inventory)
        await self.session.commit()
        await self.session.refresh(inventory)
        await self.session.refresh(destination_inventory)
        logger.info(
            "Inventory transferred between warehouses",
            extra={
                "source_warehouse_id": str(source.id),
                "destination_warehouse_id": str(destination.id),
                "inventory_id": str(inventory.id),
                "quantity": payload.quantity,
            },
        )
        return WarehouseTransferResponse(
            source_inventory_id=inventory.id,
            destination_inventory_id=destination_inventory.id,
            source_warehouse_id=source.id,
            destination_warehouse_id=destination.id,
            product_id=inventory.product_id,
            variant_id=inventory.variant_id,
            sku=inventory.sku,
            quantity=payload.quantity,
            source_available_quantity=inventory.available_quantity,
            destination_available_quantity=destination_inventory.available_quantity,
        )

    async def activity(
        self,
        warehouse_id: UUID,
        current_user: CurrentUserPlaceholder,
    ) -> WarehouseActivityListResponse:
        """Return warehouse activity derived from warehouse and inventory events."""
        warehouse = await self.get_warehouse(warehouse_id, current_user)
        transactions = await self.repository.activity_transactions(warehouse_id)
        items = [
            WarehouseActivityResponse(
                id=f"{warehouse.id}-created",
                label="Warehouse Created",
                description=f"{warehouse.warehouse_code} was created.",
                timestamp=warehouse.created_at,
                type="created",
            ),
            WarehouseActivityResponse(
                id=f"{warehouse.id}-updated",
                label="Warehouse Updated",
                description="Warehouse details were updated.",
                timestamp=warehouse.updated_at,
                type="updated",
            ),
        ]
        items.extend(self._transaction_activity(transaction) for transaction in transactions)
        items.sort(key=lambda item: item.timestamp, reverse=True)
        return WarehouseActivityListResponse(items=items)

    async def _require_seller(self, seller_id: UUID) -> None:
        """Require active seller."""
        seller = await self.seller_repository.get_active_by_id(seller_id)
        if seller is None:
            raise ApplicationError("Seller not found", status_code=status.HTTP_404_NOT_FOUND)

    async def _validate_unique_code(self, warehouse_code: str, exclude_id: UUID | None = None) -> None:
        """Validate warehouse code uniqueness."""
        if await self.repository.get_by_code(warehouse_code, exclude_id=exclude_id):
            raise ApplicationError("Warehouse code already exists", status_code=status.HTTP_409_CONFLICT)

    def _scope_filters(self, filters: WarehouseFilter, current_user: CurrentUserPlaceholder) -> WarehouseFilter:
        """Scope filters for seller users when real auth is active."""
        if current_user.role == UserRole.SELLER and current_user.id is not None:
            return filters.model_copy(update={"seller_id": filters.seller_id or current_user.id})
        return filters

    def _scope_seller_id(self, seller_id: UUID | None, current_user: CurrentUserPlaceholder) -> UUID | None:
        """Scope seller id for statistics."""
        if current_user.role == UserRole.SELLER and current_user.id is not None:
            return seller_id or current_user.id
        return seller_id

    def _authorize_seller_access(self, seller_id: UUID, current_user: CurrentUserPlaceholder) -> None:
        """Authorize seller or admin access when authentication is active."""
        if current_user.role in {UserRole.ANONYMOUS, UserRole.ADMIN}:
            return
        if current_user.role == UserRole.SELLER and current_user.id == seller_id:
            return
        raise ApplicationError("Forbidden", status_code=status.HTTP_403_FORBIDDEN)

    async def _record_transfer_transaction(
        self,
        inventory: Inventory,
        transaction_type: InventoryTransactionType,
        payload: WarehouseTransferRequest,
        previous_quantity: int,
        current_quantity: int,
        counterparty_code: str,
    ) -> None:
        """Record inventory movement caused by a warehouse transfer."""
        direction = "to" if transaction_type == InventoryTransactionType.STOCK_OUT else "from"
        transaction = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type=transaction_type.value,
            quantity=payload.quantity,
            previous_quantity=previous_quantity,
            current_quantity=current_quantity,
            reference_number=payload.reference_number,
            remarks=payload.remarks or f"Warehouse transfer {direction} {counterparty_code}",
            performed_by=payload.performed_by,
        )
        await self.transaction_repository.create(transaction)

    def _refresh_inventory_status(self, inventory: Inventory) -> None:
        """Refresh inventory status after warehouse transfer."""
        if inventory.is_deleted:
            inventory.status = "deleted"
            inventory.transfer_ready = False
            return
        if inventory.available_quantity <= 0:
            inventory.status = "out_of_stock"
            inventory.transfer_ready = False
            return
        if inventory.available_quantity <= inventory.reorder_level:
            inventory.status = "low_stock"
            return
        inventory.status = "in_stock"

    def _transaction_activity(self, transaction: InventoryTransaction) -> WarehouseActivityResponse:
        """Convert inventory transaction into warehouse activity."""
        labels = {
            "stock_in": "Inventory Added",
            "stock_out": "Inventory Removed",
            "adjustment": "Inventory Adjusted",
            "reservation": "Inventory Reserved",
            "reservation_release": "Reservation Released",
            "manual_correction": "Inventory Corrected",
        }
        return WarehouseActivityResponse(
            id=str(transaction.id),
            label=labels.get(transaction.transaction_type, "Inventory Activity"),
            description=transaction.remarks or f"{transaction.quantity} units processed.",
            timestamp=transaction.created_at,
            type="inventory",
        )
