"""Domain models for the admin module."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4


class AdminUserRole(str, Enum):
    """Supported admin-managed user roles."""

    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"


class AccountStatus(str, Enum):
    """Lifecycle states for users managed from the admin panel."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"


@dataclass(slots=True)
class AdminUser:
    """User record visible to admins."""

    email: str
    name: str
    role: AdminUserRole = AdminUserRole.CUSTOMER
    status: AccountStatus = AccountStatus.PENDING
    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class Category:
    """Product category managed by admins."""

    name: str
    description: str = ""
    is_active: bool = True
    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
