"""Order repository."""

from __future__ import annotations

from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import MetaData, Table, inspect, select, update
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import utc_now
from app.models.order import Order, OrderItem, OrderStatus

try:  # pragma: no cover - optional integration with Developer 2's product module
    from app.models.product import Product
except ImportError:  # pragma: no cover - product module is not present in this branch
    Product = None  # type: ignore[assignment]


class OrderRepository:
    """Persistence helpers for orders and product stock updates."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self._products_table: Table[Any] | None = None

    def list_orders(self, customer_id: UUID) -> list[Order]:
        """Return the customer's orders ordered by recency."""

        stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.customer_id == customer_id)
            .order_by(Order.created_at.desc())
        )
        return list(self.session.scalars(stmt).all())

    def get_order(self, customer_id: UUID, order_id: UUID) -> Order | None:
        """Return a single order owned by the customer."""

        stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.customer_id == customer_id, Order.id == order_id)
        )
        return self.session.scalar(stmt)

    def create_order(
        self,
        *,
        customer_id: UUID,
        total_amount: Decimal,
        payment_id: UUID | None = None,
        status: OrderStatus = OrderStatus.PLACED,
    ) -> Order:
        """Create and flush a new order."""

        order = Order(
            customer_id=customer_id,
            payment_id=payment_id,
            status=status,
            total_amount=total_amount,
        )
        self.session.add(order)
        self.session.flush()
        self.session.refresh(order)
        return order

    def create_order_item(
        self,
        *,
        order: Order,
        product_id: UUID,
        product_title: str | None,
        quantity: int,
        unit_price: Decimal,
        line_total: Decimal,
    ) -> OrderItem:
        """Create and flush an order item snapshot."""

        item = OrderItem(
            order=order,
            product_id=product_id,
            product_title=product_title,
            quantity=quantity,
            unit_price=unit_price,
            line_total=line_total,
        )
        self.session.add(item)
        self.session.flush()
        self.session.refresh(item)
        return item

    def update_order_status(self, order: Order, status: OrderStatus) -> Order:
        """Update the order status and timestamp."""

        order.status = status
        order.updated_at = utc_now()
        self.session.flush()
        self.session.refresh(order)
        return order

    def _get_products_table(self) -> Table[Any] | None:
        """Reflect the products table if it exists."""

        if self._products_table is not None:
            return self._products_table

        bind = self.session.get_bind()
        if bind is None or not inspect(bind).has_table("products"):
            return None

        self._products_table = Table("products", MetaData(), autoload_with=bind)
        return self._products_table

    def _serialize_product(self, product: Any) -> dict[str, Any]:
        """Normalize a product model or reflected row into a snapshot."""

        title = getattr(product, "title", getattr(product, "name", None))
        price = getattr(product, "price", getattr(product, "unit_price", None))
        stock = getattr(product, "stock", getattr(product, "inventory_count", None))

        status = getattr(product, "status", None)
        if status is None and hasattr(product, "is_active"):
            status = "active" if bool(product.is_active) else "inactive"

        return {
            "id": product.id,
            "title": title,
            "price": price,
            "stock": stock,
            "status": status,
        }

    def _stock_column_name(self, snapshot: dict[str, Any]) -> str | None:
        """Return the stock field name used by the catalog row."""

        for field_name in ("stock", "inventory_count", "available_quantity", "quantity"):
            if field_name in snapshot:
                return field_name
        return None

    def get_product_snapshot(self, product_id: UUID, *, for_update: bool = False) -> dict[str, Any] | None:
        """Return a product snapshot for validation and stock updates."""

        if Product is not None:
            stmt = select(Product).where(Product.id == product_id)
            if for_update:
                stmt = stmt.with_for_update()
            product = self.session.scalar(stmt)
            return self._serialize_product(product) if product is not None else None

        products_table = self._get_products_table()
        if products_table is None:
            return None

        stmt = select(products_table).where(products_table.c.id == product_id)
        if for_update:
            stmt = stmt.with_for_update()
        row = self.session.execute(stmt).mappings().first()
        return dict(row) if row is not None else None

    def adjust_product_stock(self, product_id: UUID, quantity_delta: int) -> dict[str, Any] | None:
        """Adjust catalog stock after order placement or cancellation."""

        if Product is not None:
            stmt = select(Product).where(Product.id == product_id).with_for_update()
            product = self.session.scalar(stmt)
            if product is None:
                raise NotFoundError("Product not found")

            stock_attr = None
            for candidate in ("stock", "inventory_count", "available_quantity", "quantity"):
                if hasattr(product, candidate):
                    stock_attr = candidate
                    break

            if stock_attr is None:
                raise ConflictError("Product stock is unavailable")

            current_stock = getattr(product, stock_attr)
            if current_stock is None:
                raise ConflictError("Product stock is unavailable")

            new_stock = int(current_stock) + int(quantity_delta)
            if new_stock < 0:
                raise ConflictError("Insufficient stock")

            setattr(product, stock_attr, new_stock)
            if hasattr(product, "updated_at"):
                product.updated_at = utc_now()
            self.session.flush()
            self.session.refresh(product)
            return self._serialize_product(product)

        products_table = self._get_products_table()
        if products_table is None:
            raise NotFoundError("Product not found")

        row = (
            self.session.execute(select(products_table).where(products_table.c.id == product_id).with_for_update())
            .mappings()
            .first()
        )
        if row is None:
            raise NotFoundError("Product not found")

        stock_column = self._stock_column_name(dict(row))
        if stock_column is None:
            raise ConflictError("Product stock is unavailable")

        current_stock = row[stock_column]
        if current_stock is None:
            raise ConflictError("Product stock is unavailable")

        new_stock = int(current_stock) + int(quantity_delta)
        if new_stock < 0:
            raise ConflictError("Insufficient stock")

        update_values: dict[str, Any] = {stock_column: new_stock}
        if "updated_at" in products_table.c:
            update_values["updated_at"] = utc_now()

        self.session.execute(update(products_table).where(products_table.c.id == product_id).values(**update_values))
        self.session.flush()
        return self.get_product_snapshot(product_id)


__all__ = ["OrderRepository"]
