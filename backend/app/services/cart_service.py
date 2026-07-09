"""Cart business logic."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationError, ConflictError, NotFoundError
from app.models.cart import Cart, CartItem
from app.models.enums import RoleName
from app.models.user import User
from app.repositories.cart_repository import CartRepository
from app.schemas.cart import AddCartItemRequest, CartItemResponse, CartResponse, UpdateCartQuantityRequest


class CartService:
    """Business rules for customer carts."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.carts = CartRepository(session)

    def _commit(self) -> None:
        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Unable to save cart") from exc
        except Exception:
            self.session.rollback()
            raise

    def _ensure_customer(self, current_user: User) -> User:
        if current_user.role is None or current_user.role.name != RoleName.CUSTOMER:
            raise AuthorizationError("Customer access is required")
        return current_user

    def _load_customer_cart(self, customer_id: UUID) -> Cart:
        cart = self.carts.get_cart(customer_id)
        if cart is None:
            raise NotFoundError("Cart not found")
        return cart

    def _get_product_snapshot(self, product_id: UUID) -> dict[str, object]:
        snapshot = self.carts.get_product_snapshot(product_id)
        if snapshot is None:
            raise NotFoundError("Product not found")
        return snapshot

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

    def _get_unit_price(self, snapshot: dict[str, object]) -> Decimal:
        price_value = snapshot.get("price")
        if price_value is None:
            raise ConflictError("Product price is unavailable")
        return Decimal(str(price_value))

    def _build_item_response(
        self,
        item: CartItem,
        product_snapshots: dict[UUID, dict[str, object]],
    ) -> CartItemResponse:
        snapshot = product_snapshots.get(item.product_id, {})
        unit_price = Decimal(str(item.unit_price))
        line_total = unit_price * item.quantity
        product_title = snapshot.get("title")
        return CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_title=str(product_title) if product_title is not None else None,
            quantity=item.quantity,
            unit_price=float(unit_price),
            line_total=float(line_total),
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

    def _build_cart_response(self, cart: Cart) -> CartResponse:
        items = list(cart.items)
        product_snapshots = self.carts.get_product_snapshots([item.product_id for item in items])
        item_payloads = [self._build_item_response(item, product_snapshots) for item in items]

        subtotal = sum((Decimal(str(item.unit_price)) * item.quantity for item in items), Decimal("0.00"))
        total_quantity = sum(item.quantity for item in items)

        return CartResponse(
            id=cart.id,
            customer_id=cart.customer_id,
            items=item_payloads,
            item_count=len(items),
            total_quantity=total_quantity,
            subtotal=float(subtotal),
            grand_total=float(subtotal),
            created_at=cart.created_at,
            updated_at=cart.updated_at,
        )

    def get_cart(self, current_user: User) -> CartResponse:
        """Return the current customer's cart, creating one if necessary."""

        customer = self._ensure_customer(current_user)
        cart, created = self.carts.get_or_create_cart(customer.id)
        if created:
            self._commit()

        refreshed_cart = self.carts.get_cart(customer.id)
        if refreshed_cart is None:
            raise NotFoundError("Cart not found")
        return self._build_cart_response(refreshed_cart)

    def add_item(self, current_user: User, payload: AddCartItemRequest) -> CartResponse:
        """Add a product to the current customer's cart."""

        customer = self._ensure_customer(current_user)
        snapshot = self._get_product_snapshot(payload.product_id)
        self._ensure_product_available(snapshot)
        stock = self._get_stock(snapshot)
        unit_price = self._get_unit_price(snapshot)

        cart, _ = self.carts.get_or_create_cart(customer.id)
        existing_item = self.carts.get_item_by_product(customer.id, payload.product_id)

        if existing_item is None:
            if payload.quantity > stock:
                raise ConflictError("Requested quantity exceeds available stock")
            self.carts.create_item(cart, payload.product_id, payload.quantity, unit_price)
        else:
            new_quantity = existing_item.quantity + payload.quantity
            if new_quantity > stock:
                raise ConflictError("Requested quantity exceeds available stock")
            self.carts.update_item_quantity(existing_item, new_quantity)

        self.carts.touch_cart(cart)
        self._commit()

        refreshed_cart = self.carts.get_cart(customer.id)
        if refreshed_cart is None:
            raise NotFoundError("Cart not found")
        return self._build_cart_response(refreshed_cart)

    def update_quantity(
        self,
        current_user: User,
        item_id: UUID,
        payload: UpdateCartQuantityRequest,
    ) -> CartResponse:
        """Update the quantity for an existing cart item."""

        customer = self._ensure_customer(current_user)
        cart = self._load_customer_cart(customer.id)
        item = self.carts.get_item_by_id(customer.id, item_id)
        if item is None:
            raise NotFoundError("Cart item not found")

        snapshot = self._get_product_snapshot(item.product_id)
        self._ensure_product_available(snapshot)
        stock = self._get_stock(snapshot)
        if payload.quantity > stock:
            raise ConflictError("Requested quantity exceeds available stock")

        self.carts.update_item_quantity(item, payload.quantity)
        self.carts.touch_cart(cart)
        self._commit()

        refreshed_cart = self.carts.get_cart(customer.id)
        if refreshed_cart is None:
            raise NotFoundError("Cart not found")
        return self._build_cart_response(refreshed_cart)

    def delete_item(self, current_user: User, item_id: UUID) -> CartResponse:
        """Remove a cart item."""

        customer = self._ensure_customer(current_user)
        cart = self._load_customer_cart(customer.id)
        item = self.carts.get_item_by_id(customer.id, item_id)
        if item is None:
            raise NotFoundError("Cart item not found")

        self.carts.delete_item(item)
        self.carts.touch_cart(cart)
        self._commit()

        refreshed_cart = self.carts.get_cart(customer.id)
        if refreshed_cart is None:
            raise NotFoundError("Cart not found")
        return self._build_cart_response(refreshed_cart)

    def clear_cart(self, current_user: User) -> CartResponse:
        """Remove all cart items for the current customer."""

        customer = self._ensure_customer(current_user)
        cart, _ = self.carts.get_or_create_cart(customer.id)

        if cart.items:
            self.carts.clear_cart(cart)
        self.carts.touch_cart(cart)
        self._commit()

        refreshed_cart = self.carts.get_cart(customer.id)
        if refreshed_cart is None:
            raise NotFoundError("Cart not found")
        return self._build_cart_response(refreshed_cart)
