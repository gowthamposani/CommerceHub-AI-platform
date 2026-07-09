"""Authentication request and response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.common.enums import UserRole


class UserResponse(BaseModel):
    """Authenticated user response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None
    role: UserRole
    status: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class RegisterRequest(BaseModel):
    """User registration payload."""

    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.CUSTOMER
    phone: str | None = Field(default=None, max_length=20)

    @field_validator("phone")
    @classmethod
    def validate_phone_number(cls, value: str | None) -> str | None:
        """Validate optional phone number."""
        if value is None:
            return None
        normalized = value.strip()
        digits = normalized.removeprefix("+")
        if not digits.isdigit() or len(digits) < 10 or len(digits) > 15:
            raise ValueError("Phone number must contain 10 to 15 digits")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        """Enforce a basic production password policy."""
        if not any(character.isupper() for character in value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(character.islower() for character in value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(character.isdigit() for character in value):
            raise ValueError("Password must contain at least one number")
        return value


class LoginRequest(BaseModel):
    """User login payload."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False


class RefreshTokenRequest(BaseModel):
    """Refresh token payload."""

    refresh_token: str = Field(min_length=20)


class TokenPairResponse(BaseModel):
    """Access and refresh token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class MessageResponse(BaseModel):
    """Simple message response."""

    detail: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request for future email-token delivery."""

    token: str = Field(min_length=20)
    new_password: str = Field(min_length=8, max_length=128)
