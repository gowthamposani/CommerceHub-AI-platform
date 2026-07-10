"""Order business logic."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationError, ConflictError, NotFoundError
from app.models.cart import CartItem
from app.models.enums import RoleName
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.repositories.cart_repository import CartRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.order import CheckoutRequest, OrderItemResponse, OrderResponse


class OrderService:
    """Business rules for checkout and order lifecycle actions."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.orders = OrderRepository(session)
        self.carts = CartRepository(session)

    def _commit(self) -> None:
        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Unable to save order") from exc
        except Exception:
            self.session.rollback()
            raise

    def _ensure_customer(self, current_user: User) -> User:
        if current_user.role is None or current_user.role.name != RoleName.CUSTOMER:
            raise AuthorizationError("Customer access is required")
        return current_user

    def _ensure_product_available(self, snapshot: dict[str, object]) -> None:
        """Reject inactive or unavailable catalog items."""

        status_value = snapshot.get("status")
        if status_value is None:
            return

        raw_status = getattr(status_value, "value", status_value)
        if isinstance(raw_status, bool):
            if raw_status:
                return
            raise ConflictError("Product is unavailable")

        normalized_status = str(raw_status).strip().lower()
        if normalized_status not in {"active", "available", "published"}:
            raise ConflictError("Product is unavailable")

    def _get_stock(self, snapshot: dict[str, object]) -> int:
        stock_value = snapshot.get("stock")
        if stock_value is None:
            raise ConflictError("Product stock is unavailable")
        try:
            stock = int(stock_value)
        except (TypeError, ValueError) as exc:
            raise ConflictError("Product stock is unavailable") from exc
        if stock <= 0:
            raise ConflictError("Product is out of stock")
        return stock

    def _get_product_title(self, snapshot: dict[str, object]) -> str | None:
        title = snapshot.get("title")
        if title is None:
            title = snapshot.get("name")
        if title is None:
            return None
        return str(title)

    def _build_item_response(self, item: OrderItem) -> OrderItemResponse:
        unit_price = Decimal(str(item.unit_price))
        line_total = Decimal(str(item.line_total))
        return OrderItemResponse(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            product_title=item.product_title,
            quantity=item.quantity,
            unit_price=float(unit_price),
            line_total=float(line_total),
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

    def _build_order_response(self, order: Order) -> OrderResponse:
        items = list(order.items)
        total_quantity = sum(item.quantity for item in items)
        total_amount = Decimal(str(order.total_amount))

        return OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            payment_id=order.payment_id,
            status=order.status,
            items=[self._build_item_response(item) for item in items],
            item_count=len(items),
            total_quantity=total_quantity,
            total_amount=float(total_amount),
            created_at=order.created_at,
            updated_at=order.updated_at,
        )

    def _load_order(self, customer_id: UUID, order_id: UUID) -> Order:
        order = self.orders.get_order(customer_id, order_id)
        if order is None:
            raise NotFoundError("Order not found")
        return order

    def list_orders(self, current_user: User) -> list[OrderResponse]:
        """Return all orders for the current customer."""

        customer = self._ensure_customer(current_user)
        orders = self.orders.list_orders(customer.id)
        return [self._build_order_response(order) for order in orders]

    def get_order(self, current_user: User, order_id: UUID) -> OrderResponse:
        """Return a single customer order."""

        customer = self._ensure_customer(current_user)
        order = self._load_order(customer.id, order_id)
        return self._build_order_response(order)

    def checkout(self, current_user: User, payload: CheckoutRequest) -> OrderResponse:
        """Create an order from the authenticated customer's cart."""

        customer = self._ensure_customer(current_user)
        cart = self.carts.get_cart(customer.id)
        if cart is None or not cart.items:
            raise ConflictError("Cart is empty")

        try:
            cart_items = sorted(cart.items, key=lambda item: str(item.product_id))
            line_items: list[tuple[CartItem, Decimal, dict[str, object]]] = []
            total_amount = Decimal("0.00")

            for cart_item in cart_items:
                snapshot = self.orders.get_product_snapshot(cart_item.product_id, for_update=True)
                if snapshot is None:
                    raise NotFoundError("Product not found")
                self._ensure_product_available(snapshot)
                stock = self._get_stock(snapshot)
                if cart_item.quantity > stock:
                    raise ConflictError("Requested quantity exceeds available stock")

                unit_price = Decimal(str(cart_item.unit_price))
                line_total = unit_price * cart_item.quantity
                total_amount += line_total
                line_items.append((cart_item, line_total, snapshot))

            order = self.orders.create_order(
                customer_id=customer.id,
                total_amount=total_amount,
                payment_id=payload.payment_id,
                status=OrderStatus.PLACED,
            )

            for cart_item, line_total, snapshot in line_items:
                unit_price = Decimal(str(cart_item.unit_price))
                self.orders.create_order_item(
                    order=order,
                    product_id=cart_item.product_id,
                    product_title=self._get_product_title(snapshot),
                    quantity=cart_item.quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )

            for cart_item, _, _ in line_items:
                self.orders.adjust_product_stock(cart_item.product_id, -cart_item.quantity)

            self.carts.clear_cart(cart)
            self.carts.touch_cart(cart)
            self._commit()

            refreshed_order = self.orders.get_order(customer.id, order.id)
            if refreshed_order is None:
                raise NotFoundError("Order not found")
            return self._build_order_response(refreshed_order)
        except Exception:
            self.session.rollback()
            raise

    def cancel_order(self, current_user: User, order_id: UUID) -> OrderResponse:
        """Cancel an order before shipment and restore inventory."""

        customer = self._ensure_customer(current_user)
        try:
            order = self._load_order(customer.id, order_id)
            cancellable_states = {
                OrderStatus.PLACED,
                OrderStatus.CONFIRMED,
                OrderStatus.PACKED,
            }
            if order.status == OrderStatus.CANCELLED:
                raise ConflictError("Order has already been cancelled")
            if order.status not in cancellable_states:
                raise ConflictError("Order can only be cancelled before shipment")

            for item in sorted(order.items, key=lambda order_item: str(order_item.product_id)):
                snapshot = self.orders.get_product_snapshot(item.product_id, for_update=True)
                if snapshot is None:
                    raise NotFoundError("Product not found")
                self.orders.adjust_product_stock(item.product_id, item.quantity)

            self.orders.update_order_status(order, OrderStatus.CANCELLED)
            self._commit()

            refreshed_order = self.orders.get_order(customer.id, order.id)
            if refreshed_order is None:
                raise NotFoundError("Order not found")
            return self._build_order_response(refreshed_order)
        except Exception:
            self.session.rollback()
            raise


__all__ = ["OrderService"]
