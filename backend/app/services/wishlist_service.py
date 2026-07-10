"""Wishlist business logic."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationError, ConflictError, NotFoundError
from app.models.enums import RoleName
from app.models.user import User
from app.repositories.wishlist_repository import WishlistRepository
from app.schemas.wishlist import AddWishlistItemRequest


class WishlistService:
    """Business rules for customer wishlists."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.wishlists = WishlistRepository(session)

    def _commit(self) -> None:
        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Unable to save wishlist item") from exc
        except Exception:
            self.session.rollback()
            raise

    def _ensure_customer(self, current_user: User) -> User:
        if current_user.role is None or current_user.role.name != RoleName.CUSTOMER:
            raise AuthorizationError("Customer access is required")
        return current_user

    def _get_owned_item(self, customer_id: UUID, product_id: UUID):
        item = self.wishlists.get_item(customer_id, product_id)
        if item is None:
            raise NotFoundError("Wishlist item not found")
        return item

    def list_wishlist(self, current_user: User):
        """Return the authenticated customer's wishlist."""

        customer = self._ensure_customer(current_user)
        return self.wishlists.list_for_customer(customer.id)

    def add_item(self, current_user: User, payload: AddWishlistItemRequest):
        """Add a product to the authenticated customer's wishlist."""

        customer = self._ensure_customer(current_user)
        if not self.wishlists.product_exists(payload.product_id):
            raise NotFoundError("Product not found")

        existing = self.wishlists.get_item(customer.id, payload.product_id)
        if existing is not None:
            raise ConflictError("Product already exists in wishlist")

        try:
            item = self.wishlists.create_item(customer.id, payload.product_id)
            self._commit()
            refreshed_item = self.wishlists.get_item(customer.id, item.product_id)
            if refreshed_item is None:
                raise NotFoundError("Wishlist item not found")
            return refreshed_item
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Product already exists in wishlist") from exc

    def remove_item(self, current_user: User, product_id: UUID) -> None:
        """Remove a product from the authenticated customer's wishlist."""

        customer = self._ensure_customer(current_user)
        item = self._get_owned_item(customer.id, product_id)
        self.wishlists.delete_item(item)
        self._commit()

    def move_to_cart(self, current_user: User, product_id: UUID) -> None:
        """Move a wishlist item out of the wishlist.

        The cart module is not implemented yet, so this operation removes the item
        from the wishlist and preserves the endpoint contract for later cart wiring.
        """

        self.remove_item(current_user, product_id)
