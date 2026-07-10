"""Shared application enumerations."""

from enum import StrEnum


class RoleName(StrEnum):
    """Available marketplace roles."""

    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"


class UserStatus(StrEnum):
    """User lifecycle states."""

    ACTIVE = "active"
    PENDING_APPROVAL = "pending_approval"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
