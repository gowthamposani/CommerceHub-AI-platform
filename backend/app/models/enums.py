"""Shared application enumerations."""

from enum import Enum


class RoleName(str, Enum):
    """Available marketplace roles."""

    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"


class UserStatus(str, Enum):
    """User lifecycle states."""

    ACTIVE = "active"
    PENDING_APPROVAL = "pending_approval"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

