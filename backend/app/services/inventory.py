"""Inventory service layer."""

from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams
from app.exceptions.base import ApplicationError
from app.models.inventory import Inventory, InventoryReservation, InventoryTransaction
from app.repositories.inventory import (
    InventoryRepository,
    InventoryReservationRepository,
    InventoryTransactionRepository,
)
from app.repositories.product import ProductRepository
from app.repositories.product_extension import ProductVariantRepository
from app.repositories.warehouse import WarehouseRepository
from app.schemas.inventory import (
    InventoryAdjustmentRequest,
    InventoryCreate,
    InventoryFilter,
    InventoryOperationRequest,
    InventoryTransactionType,
    InventoryUpdate,
)


class InventoryService:
    """Business logic for Inventory Management."""

    def __init__(
        self,
        session: AsyncSession,
        repository: InventoryRepository | None = None,
        transaction_repository: InventoryTransactionRepository | None = None,
        reservation_repository: InventoryReservationRepository | None = None,
        product_repository: ProductRepository | None = None,
        variant_repository: ProductVariantRepository | None = None,
        warehouse_repository: WarehouseRepository | None = None,
    ) -> None:
        self.session = session
        self.repository = repository or InventoryRepository(session)
        self.transaction_repository = transaction_repository or InventoryTransactionRepository(session)
        self.reservation_repository = reservation_repository or InventoryReservationRepository(session)
        self.product_repository = product_repository or ProductRepository(session)
        self.variant_repository = variant_repository or ProductVariantRepository(session)
        self.warehouse_repository = warehouse_repository or WarehouseRepository(session)

    async def create_inventory(self, payload: InventoryCreate) -> Inventory:
        """Create inventory for a product variant."""
        await self._require_product(payload.product_id)
        variant = await self._require_variant(payload.variant_id)
        warehouse = (
            await self.warehouse_repository.get_active_by_id(payload.warehouse_id)
            if payload.warehouse_id
            else None
        )
        if variant.product_id != payload.product_id:
            raise ApplicationError(
                "Variant does not belong to product",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        if payload.warehouse_id and warehouse is None:
            raise ApplicationError("Warehouse not found", status_code=status.HTTP_404_NOT_FOUND)
        existing_inventory = (
            await self.repository.get_by_variant_and_warehouse(payload.variant_id, payload.warehouse_id)
            if payload.warehouse_id
            else await self.repository.get_by_variant_id(payload.variant_id)
        )
        if existing_inventory:
            raise ApplicationError(
                "Inventory already exists for variant and warehouse",
                status_code=status.HTTP_409_CONFLICT,
            )
        if payload.reserved_quantity > payload.available_quantity:
            raise ApplicationError(
                "Reserved quantity cannot exceed available quantity",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        inventory = Inventory(
            product_id=payload.product_id,
            variant_id=payload.variant_id,
            warehouse_id=payload.warehouse_id,
            sku=variant.sku,
            available_quantity=payload.available_quantity,
            reserved_quantity=payload.reserved_quantity,
            damaged_quantity=payload.damaged_quantity,
            minimum_stock=payload.minimum_stock,
            maximum_stock=payload.maximum_stock,
            reorder_level=payload.reorder_level,
            transfer_ready=payload.transfer_ready,
        )
        self._refresh_status(inventory)
        await self.repository.create(inventory)
        await self.session.flush()
        if inventory.available_quantity > 0:
            await self._record_transaction(
                inventory,
                InventoryTransactionType.STOCK_IN,
                inventory.available_quantity,
                previous_quantity=0,
                current_quantity=inventory.available_quantity,
                remarks="Opening inventory balance",
            )
        await self.session.commit()
        await self.session.refresh(inventory)
        return await self.get_inventory(inventory.id)

    async def get_inventory(self, inventory_id: UUID) -> Inventory:
        """Get inventory by ID."""
        inventory = await self.repository.get_active_by_id(inventory_id)
        if inventory is None:
            raise ApplicationError("Inventory not found", status_code=status.HTTP_404_NOT_FOUND)
        return inventory

    async def list_inventory(
        self,
        params: PaginationParams,
        filters: InventoryFilter,
        search: str | None,
        sort_by: str | None,
        sort_direction: str,
    ) -> Page[Inventory]:
        """List inventory records."""
        return await self.repository.list_inventory(params, filters, search, sort_by, sort_direction)

    async def update_inventory(self, inventory_id: UUID, payload: InventoryUpdate) -> Inventory:
        """Update inventory settings."""
        inventory = await self.get_inventory(inventory_id)
        update_data = payload.model_dump(exclude_unset=True)
        next_minimum = update_data.get("minimum_stock", inventory.minimum_stock)
        next_maximum = update_data.get("maximum_stock", inventory.maximum_stock)
        next_reorder = update_data.get("reorder_level", inventory.reorder_level)
        if next_maximum is not None and next_maximum < next_minimum:
            raise ApplicationError(
                "Maximum stock cannot be lower than minimum stock",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        if next_maximum is not None and next_maximum < next_reorder:
            raise ApplicationError(
                "Maximum stock cannot be lower than reorder level",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        for key, value in update_data.items():
            setattr(inventory, key, value)
        self._refresh_status(inventory)
        await self.repository.update(inventory)
        await self.session.commit()
        await self.session.refresh(inventory)
        return await self.get_inventory(inventory.id)

    async def delete_inventory(self, inventory_id: UUID) -> Inventory:
        """Soft delete inventory."""
        inventory = await self.get_inventory(inventory_id)
        await self.repository.soft_delete(inventory)
        await self.session.commit()
        return inventory

    async def stock_in(self, inventory_id: UUID, payload: InventoryOperationRequest) -> Inventory:
        """Increase available stock."""
        inventory = await self.get_inventory(inventory_id)
        previous = inventory.available_quantity
        inventory.available_quantity += payload.quantity
        self._refresh_status(inventory)
        await self._record_transaction_from_request(
            inventory,
            InventoryTransactionType.STOCK_IN,
            payload,
            previous,
            inventory.available_quantity,
        )
        await self.repository.update(inventory)
        await self.session.commit()
        return await self.get_inventory(inventory.id)

    async def stock_out(self, inventory_id: UUID, payload: InventoryOperationRequest) -> Inventory:
        """Decrease available stock."""
        inventory = await self.get_inventory(inventory_id)
        if payload.quantity > inventory.available_quantity:
            raise ApplicationError(
                "Stock out quantity cannot exceed available stock",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        previous = inventory.available_quantity
        inventory.available_quantity -= payload.quantity
        self._refresh_status(inventory)
        await self._record_transaction_from_request(
            inventory,
            InventoryTransactionType.STOCK_OUT,
            payload,
            previous,
            inventory.available_quantity,
        )
        await self.repository.update(inventory)
        await self.session.commit()
        return await self.get_inventory(inventory.id)

    async def reserve_stock(self, inventory_id: UUID, payload: InventoryOperationRequest) -> InventoryReservation:
        """Reserve available stock."""
        inventory = await self.get_inventory(inventory_id)
        if payload.quantity > inventory.available_quantity:
            raise ApplicationError(
                "Reserved stock cannot exceed available stock",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        previous = inventory.available_quantity
        inventory.available_quantity -= payload.quantity
        inventory.reserved_quantity += payload.quantity
        self._refresh_status(inventory)
        reservation = InventoryReservation(
            inventory_id=inventory.id,
            quantity=payload.quantity,
            reference_number=payload.reference_number,
            remarks=payload.remarks,
            performed_by=payload.performed_by,
        )
        await self.reservation_repository.create(reservation)
        await self._record_transaction_from_request(
            inventory,
            InventoryTransactionType.RESERVATION,
            payload,
            previous,
            inventory.available_quantity,
        )
        await self.repository.update(inventory)
        await self.session.commit()
        await self.session.refresh(reservation)
        return reservation

    async def release_reserved_stock(self, inventory_id: UUID, payload: InventoryOperationRequest) -> Inventory:
        """Release reserved stock back to availability."""
        inventory = await self.get_inventory(inventory_id)
        if payload.quantity > inventory.reserved_quantity:
            raise ApplicationError(
                "Release quantity cannot exceed reserved stock",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        previous = inventory.available_quantity
        inventory.reserved_quantity -= payload.quantity
        inventory.available_quantity += payload.quantity
        self._refresh_status(inventory)
        await self._record_transaction_from_request(
            inventory,
            InventoryTransactionType.RESERVATION_RELEASE,
            payload,
            previous,
            inventory.available_quantity,
        )
        await self.repository.update(inventory)
        await self.session.commit()
        return await self.get_inventory(inventory.id)

    async def adjust_inventory(self, inventory_id: UUID, payload: InventoryAdjustmentRequest) -> Inventory:
        """Adjust inventory balances manually."""
        inventory = await self.get_inventory(inventory_id)
        if inventory.reserved_quantity > payload.available_quantity:
            raise ApplicationError(
                "Available quantity cannot be lower than reserved quantity during adjustment",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        previous = inventory.available_quantity
        inventory.available_quantity = payload.available_quantity
        if payload.damaged_quantity is not None:
            inventory.damaged_quantity = payload.damaged_quantity
        self._refresh_status(inventory)
        await self._record_transaction(
            inventory,
            InventoryTransactionType.ADJUSTMENT,
            abs(inventory.available_quantity - previous) or 1,
            previous_quantity=previous,
            current_quantity=inventory.available_quantity,
            reference_number=payload.reference_number,
            remarks=payload.remarks,
            performed_by=payload.performed_by,
        )
        await self.repository.update(inventory)
        await self.session.commit()
        return await self.get_inventory(inventory.id)

    async def inventory_history(self, inventory_id: UUID, params: PaginationParams) -> Page[InventoryTransaction]:
        """Get inventory transaction history."""
        await self.get_inventory(inventory_id)
        return await self.transaction_repository.list_history(inventory_id, params)

    async def _require_product(self, product_id: UUID) -> None:
        """Require an active product."""
        if await self.product_repository.get_active_by_id(product_id) is None:
            raise ApplicationError("Product not found", status_code=status.HTTP_404_NOT_FOUND)

    async def _require_variant(self, variant_id: UUID):
        """Require an active product variant."""
        variant = await self.variant_repository.get_active_by_id(variant_id)
        if variant is None:
            raise ApplicationError("Product variant not found", status_code=status.HTTP_404_NOT_FOUND)
        return variant

    async def _record_transaction_from_request(
        self,
        inventory: Inventory,
        transaction_type: InventoryTransactionType,
        payload: InventoryOperationRequest,
        previous_quantity: int,
        current_quantity: int,
    ) -> None:
        """Record transaction from operation request."""
        await self._record_transaction(
            inventory,
            transaction_type,
            payload.quantity,
            previous_quantity,
            current_quantity,
            payload.reference_number,
            payload.remarks,
            payload.performed_by,
        )

    async def _record_transaction(
        self,
        inventory: Inventory,
        transaction_type: InventoryTransactionType,
        quantity: int,
        previous_quantity: int,
        current_quantity: int,
        reference_number: str | None = None,
        remarks: str | None = None,
        performed_by: str | None = None,
    ) -> None:
        """Create transaction history row."""
        transaction = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type=transaction_type.value,
            quantity=max(quantity, 1),
            previous_quantity=previous_quantity,
            current_quantity=current_quantity,
            reference_number=reference_number,
            remarks=remarks,
            performed_by=performed_by,
        )
        await self.transaction_repository.create(transaction)

    def _refresh_status(self, inventory: Inventory) -> None:
        """Refresh low-stock/out-of-stock status."""
        if inventory.is_deleted:
            inventory.status = "deleted"
            return
        if inventory.available_quantity <= 0:
            inventory.status = "out_of_stock"
            inventory.transfer_ready = False
            return
        if inventory.available_quantity <= inventory.reorder_level:
            inventory.status = "low_stock"
            return
        inventory.status = "in_stock"
