"""Customer repository."""

from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.core.security import utc_now
from app.models.address import Address
from app.models.user import User


class CustomerRepository:
    """Persistence helpers for customer profile and addresses."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_customer_profile(self, customer_id: UUID) -> Optional[User]:
        """Return a customer profile with addresses loaded."""

        stmt = select(User).options(selectinload(User.addresses)).where(User.id == customer_id)
        return self.session.scalar(stmt)

    def list_addresses(self, customer_id: UUID) -> list[Address]:
        """Return all addresses for the given customer."""

        stmt = (
            select(Address)
            .where(Address.customer_id == customer_id)
            .order_by(Address.is_default.desc(), Address.created_at.asc())
        )
        return list(self.session.scalars(stmt).all())

    def get_address_for_customer(self, customer_id: UUID, address_id: UUID) -> Optional[Address]:
        """Return a single address owned by the customer."""

        stmt = select(Address).where(Address.customer_id == customer_id, Address.id == address_id)
        return self.session.scalar(stmt)

    def get_default_address(self, customer_id: UUID) -> Optional[Address]:
        """Return the customer's default address, if any."""

        stmt = (
            select(Address)
            .where(Address.customer_id == customer_id, Address.is_default.is_(True))
            .order_by(Address.created_at.asc())
        )
        return self.session.scalar(stmt)

    def get_fallback_address(self, customer_id: UUID, *, exclude_address_id: UUID) -> Optional[Address]:
        """Return another address that can become the default."""

        stmt = (
            select(Address)
            .where(Address.customer_id == customer_id, Address.id != exclude_address_id)
            .order_by(Address.created_at.asc())
        )
        return self.session.scalar(stmt)

    def create_address(
        self,
        *,
        customer_id: UUID,
        address_line_1: str,
        address_line_2: Optional[str],
        city: str,
        state: str,
        postal_code: str,
        country: str,
        phone_number: Optional[str],
        is_default: bool,
    ) -> Address:
        """Create and flush a new address."""

        address = Address(
            customer_id=customer_id,
            address_line_1=address_line_1,
            address_line_2=address_line_2,
            city=city,
            state=state,
            postal_code=postal_code,
            country=country,
            phone_number=phone_number,
            is_default=is_default,
        )
        self.session.add(address)
        self.session.flush()
        self.session.refresh(address)
        return address

    def unset_default_addresses(self, customer_id: UUID, *, exclude_address_id: Optional[UUID] = None) -> None:
        """Clear the default flag for the customer addresses."""

        stmt = update(Address).where(Address.customer_id == customer_id)
        if exclude_address_id is not None:
            stmt = stmt.where(Address.id != exclude_address_id)
        stmt = stmt.values(is_default=False, updated_at=utc_now())
        self.session.execute(stmt)

    def set_default_address(self, address: Address) -> Address:
        """Mark an address as the customer's default address."""

        self.unset_default_addresses(address.customer_id, exclude_address_id=address.id)
        address.is_default = True
        address.updated_at = utc_now()
        self.session.flush()
        self.session.refresh(address)
        return address

    def delete_address(self, address: Address) -> None:
        """Delete an address."""

        self.session.delete(address)
        self.session.flush()
