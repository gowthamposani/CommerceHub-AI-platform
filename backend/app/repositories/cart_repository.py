"""Cart repository."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import MetaData, Table, inspect, select
from sqlalchemy.orm import Session, selectinload

from app.core.security import utc_now
from app.models.cart import Cart, CartItem

try:  # pragma: no cover - optional integration with the Product module
    from app.models.product import Product
except ImportError:  # pragma: no cover - product module is not present in this branch
    Product = None  # type: ignore[assignment]


class CartRepository:
    """Persistence helpers for carts and cart items."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self._products_table: Table[Any] | None = None

    def get_cart(self, customer_id: UUID) -> Cart | None:
        """Return a customer's cart with items loaded."""

        stmt = select(Cart).options(selectinload(Cart.items)).where(Cart.customer_id == customer_id)
        return self.session.scalar(stmt)

    def get_or_create_cart(self, customer_id: UUID) -> tuple[Cart, bool]:
        """Load an existing cart or create a new empty cart."""

        cart = self.get_cart(customer_id)
        if cart is not None:
            return cart, False

        cart = Cart(customer_id=customer_id)
        self.session.add(cart)
        self.session.flush()
        self.session.refresh(cart)
        return cart, True

    def get_item_by_id(self, customer_id: UUID, item_id: UUID) -> CartItem | None:
        """Return a cart item owned by the given customer."""

        stmt = (
            select(CartItem)
            .join(Cart, Cart.id == CartItem.cart_id)
            .where(Cart.customer_id == customer_id, CartItem.id == item_id)
        )
        return self.session.scalar(stmt)

    def get_item_by_product(self, customer_id: UUID, product_id: UUID) -> CartItem | None:
        """Return a cart item for a product owned by the given customer."""

        stmt = (
            select(CartItem)
            .join(Cart, Cart.id == CartItem.cart_id)
            .where(Cart.customer_id == customer_id, CartItem.product_id == product_id)
        )
        return self.session.scalar(stmt)

    def create_item(self, cart: Cart, product_id: UUID, quantity: int, unit_price: Any) -> CartItem:
        """Create and flush a new cart item."""

        item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price,
        )
        self.session.add(item)
        self.session.flush()
        self.session.refresh(item)
        return item

    def update_item_quantity(self, item: CartItem, quantity: int) -> CartItem:
        """Update a cart item's quantity."""

        item.quantity = quantity
        item.updated_at = utc_now()
        self.session.flush()
        self.session.refresh(item)
        return item

    def delete_item(self, item: CartItem) -> None:
        """Delete a cart item."""

        self.session.delete(item)
        self.session.flush()

    def clear_cart(self, cart: Cart) -> None:
        """Remove every item from the cart."""

        for item in list(cart.items):
            self.session.delete(item)
        self.session.flush()

    def touch_cart(self, cart: Cart) -> Cart:
        """Update the cart timestamp after a mutation."""

        cart.updated_at = utc_now()
        self.session.flush()
        return cart

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

    def get_product_snapshot(self, product_id: UUID) -> dict[str, Any] | None:
        """Return a reflected product row for validation and display."""

        if Product is not None:
            product = self.session.get(Product, product_id)
            return self._serialize_product(product) if product is not None else None

        products_table = self._get_products_table()
        if products_table is None:
            return None

        stmt = select(products_table).where(products_table.c.id == product_id).limit(1)
        row = self.session.execute(stmt).mappings().first()
        return dict(row) if row is not None else None

    def get_product_snapshots(self, product_ids: list[UUID]) -> dict[UUID, dict[str, Any]]:
        """Return reflected product rows keyed by product id."""

        unique_product_ids = list(dict.fromkeys(product_ids))
        if not unique_product_ids:
            return {}

        if Product is not None:
            stmt = select(Product).where(Product.id.in_(unique_product_ids))
            products = self.session.scalars(stmt).all()
            return {product.id: self._serialize_product(product) for product in products}

        products_table = self._get_products_table()
        if products_table is None:
            return {}

        stmt = select(products_table).where(products_table.c.id.in_(unique_product_ids))
        rows = self.session.execute(stmt).mappings().all()
        return {row["id"]: dict(row) for row in rows}
