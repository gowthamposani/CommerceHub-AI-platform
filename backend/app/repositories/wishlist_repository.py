"""Wishlist repository."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import column, inspect, select, table
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Session

from app.core.security import utc_now
from app.models.wishlist import Wishlist

PRODUCTS_TABLE = table("products", column("id", PGUUID(as_uuid=True)))


class WishlistRepository:
    """Persistence helpers for customer wishlists."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def list_for_customer(self, customer_id: UUID) -> list[Wishlist]:
        """Return all wishlist items for a customer."""

        stmt = select(Wishlist).where(Wishlist.customer_id == customer_id).order_by(Wishlist.created_at.desc())
        return list(self.session.scalars(stmt).all())

    def get_item(self, customer_id: UUID, product_id: UUID) -> Wishlist | None:
        """Return a wishlist item for the given customer and product."""

        stmt = select(Wishlist).where(Wishlist.customer_id == customer_id, Wishlist.product_id == product_id)
        return self.session.scalar(stmt)

    def create_item(self, customer_id: UUID, product_id: UUID) -> Wishlist:
        """Create a wishlist item."""

        item = Wishlist(customer_id=customer_id, product_id=product_id)
        self.session.add(item)
        self.session.flush()
        self.session.refresh(item)
        return item

    def delete_item(self, item: Wishlist) -> None:
        """Delete a wishlist item."""

        self.session.delete(item)
        self.session.flush()

    def product_exists(self, product_id: UUID) -> bool:
        """Return whether the product exists in the catalog table."""

        bind = self.session.get_bind()
        if bind is None:
            return False
        if not inspect(bind).has_table("products"):
            return False

        stmt = select(PRODUCTS_TABLE.c.id).where(PRODUCTS_TABLE.c.id == product_id).limit(1)
        return self.session.scalar(stmt) is not None

    def touch_item(self, item: Wishlist) -> Wishlist:
        """Update the wishlist item's timestamp for bookkeeping."""

        item.updated_at = utc_now()
        self.session.flush()
        self.session.refresh(item)
        return item
