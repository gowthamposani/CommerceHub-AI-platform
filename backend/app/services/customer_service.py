"""Customer business logic."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationError, ConflictError, NotFoundError
from app.models.address import Address
from app.models.enums import RoleName
from app.models.user import User
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import (
    AddressCreateRequest,
    AddressUpdateRequest,
    CustomerProfileUpdateRequest,
)


class CustomerService:
    """Business rules for customer profile and address management."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.customers = CustomerRepository(session)

    def _commit(self) -> None:
        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Unable to save customer data") from exc
        except Exception:
            self.session.rollback()
            raise

    def _ensure_customer(self, current_user: User) -> User:
        if current_user.role is None or current_user.role.name != RoleName.CUSTOMER:
            raise AuthorizationError("Customer access is required")
        return current_user

    def _get_owned_address(self, customer_id: UUID, address_id: UUID) -> Address:
        address = self.customers.get_address_for_customer(customer_id, address_id)
        if address is None:
            raise NotFoundError("Address not found")
        return address

    def get_profile(self, current_user: User) -> User:
        """Return the current customer's profile."""

        customer = self._ensure_customer(current_user)
        profile = self.customers.get_customer_profile(customer.id)
        if profile is None:
            raise NotFoundError("Customer profile not found")
        return profile

    def update_profile(self, current_user: User, payload: CustomerProfileUpdateRequest) -> User:
        """Update the current customer's profile."""

        customer = self._ensure_customer(current_user)
        profile = self.customers.get_customer_profile(customer.id)
        if profile is None:
            raise NotFoundError("Customer profile not found")

        if payload.first_name is not None:
            profile.first_name = payload.first_name
        if payload.last_name is not None:
            profile.last_name = payload.last_name

        self._commit()
        refreshed_profile = self.customers.get_customer_profile(customer.id)
        if refreshed_profile is None:
            raise NotFoundError("Customer profile not found")
        return refreshed_profile

    def list_addresses(self, current_user: User) -> list[Address]:
        """Return the customer's addresses."""

        customer = self._ensure_customer(current_user)
        return self.customers.list_addresses(customer.id)

    def create_address(self, current_user: User, payload: AddressCreateRequest) -> Address:
        """Create a new customer address."""

        customer = self._ensure_customer(current_user)
        existing_default = self.customers.get_default_address(customer.id)
        should_be_default = payload.is_default or existing_default is None

        try:
            if should_be_default and existing_default is not None:
                self.customers.unset_default_addresses(customer.id)

            address = self.customers.create_address(
                customer_id=customer.id,
                address_line_1=payload.address_line_1,
                address_line_2=payload.address_line_2,
                city=payload.city,
                state=payload.state,
                postal_code=payload.postal_code,
                country=payload.country,
                phone_number=payload.phone_number,
                is_default=should_be_default,
            )
            self._commit()
            refreshed_address = self.customers.get_address_for_customer(customer.id, address.id)
            if refreshed_address is None:
                raise NotFoundError("Address not found")
            return refreshed_address
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Only one default address is allowed") from exc

    def update_address(self, current_user: User, address_id: UUID, payload: AddressUpdateRequest) -> Address:
        """Update an existing customer address."""

        customer = self._ensure_customer(current_user)
        address = self._get_owned_address(customer.id, address_id)

        for field_name, value in payload.model_dump(exclude_unset=True).items():
            setattr(address, field_name, value)

        self._commit()
        refreshed_address = self.customers.get_address_for_customer(customer.id, address.id)
        if refreshed_address is None:
            raise NotFoundError("Address not found")
        return refreshed_address

    def delete_address(self, current_user: User, address_id: UUID) -> None:
        """Delete a customer address."""

        customer = self._ensure_customer(current_user)
        address = self._get_owned_address(customer.id, address_id)
        was_default = address.is_default

        try:
            self.customers.delete_address(address)
            if was_default:
                fallback = self.customers.get_fallback_address(customer.id, exclude_address_id=address.id)
                if fallback is not None:
                    self.customers.set_default_address(fallback)
            self._commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Unable to delete customer address") from exc

    def set_default_address(self, current_user: User, address_id: UUID) -> Address:
        """Promote a customer address to be the default."""

        customer = self._ensure_customer(current_user)
        address = self._get_owned_address(customer.id, address_id)

        try:
            updated_address = self.customers.set_default_address(address)
            self._commit()
            refreshed_address = self.customers.get_address_for_customer(customer.id, updated_address.id)
            if refreshed_address is None:
                raise NotFoundError("Address not found")
            return refreshed_address
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("Only one default address is allowed") from exc
