"""Reusable enumerations."""

from enum import StrEnum


class Environment(StrEnum):
    """Supported runtime environments."""

    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"


class SortDirection(StrEnum):
    """Supported sort directions."""

    ASC = "asc"
    DESC = "desc"


class UserRole(StrEnum):
    """Role placeholders for future authentication modules."""

    ANONYMOUS = "anonymous"
    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"
