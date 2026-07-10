"""Authentication schemas."""

from __future__ import annotations

import re
from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator

from app.models.enums import RoleName, UserStatus

NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
PasswordStr = Annotated[str, StringConstraints(min_length=8, max_length=128)]
TokenStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4096)]

DataT = TypeVar("DataT")


class ApiResponse[DataT](BaseModel):
    """Standard API envelope used across the backend."""

    success: bool = True
    message: str = ""
    data: DataT | None = None


class RegistrationRole(StrEnum):
    """Publicly registrable roles."""

    CUSTOMER = "customer"
    SELLER = "seller"


class RoleRead(BaseModel):
    """Role response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: RoleName
    created_at: datetime
    updated_at: datetime


class UserRead(BaseModel):
    """User response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    full_name: str
    email: EmailStr
    role: RoleRead
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None


class TokenPairData(BaseModel):
    """Access and refresh token payload."""

    model_config = ConfigDict(from_attributes=True)

    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = Field(default="bearer")
    access_token_expires_at: datetime
    refresh_token_expires_at: datetime


class AuthSessionData(BaseModel):
    """Authenticated session response payload."""

    model_config = ConfigDict(from_attributes=True)

    user: UserRead
    tokens: TokenPairData


class EmptyData(BaseModel):
    """Empty response payload for endpoints that only return a message."""

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    """Registration payload."""

    first_name: NameStr
    last_name: NameStr
    email: EmailStr
    password: PasswordStr
    role: RegistrationRole = RegistrationRole.CUSTOMER

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Za-z]", value):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number")
        return value


class LoginRequest(BaseModel):
    """Login payload."""

    email: EmailStr
    password: PasswordStr


class RefreshTokenRequest(BaseModel):
    """Refresh token payload."""

    refresh_token: TokenStr


class LogoutRequest(RefreshTokenRequest):
    """Logout payload."""


__all__ = [
    "ApiResponse",
    "AuthSessionData",
    "EmptyData",
    "LoginRequest",
    "LogoutRequest",
    "RefreshTokenRequest",
    "RegisterRequest",
    "RegistrationRole",
    "RoleRead",
    "TokenPairData",
    "UserRead",
]
