"""Authentication service layer."""

from datetime import UTC, datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from uuid import UUID

from fastapi import status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.config.settings import get_settings
from app.exceptions.base import ApplicationError
from app.models.user import RefreshToken, User
from app.repositories.auth import RefreshTokenRepository, UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest
from app.security import get_token_config, hash_password, verify_password
from app.services.base import BaseService


class AuthService(BaseService):
    """Application authentication use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.users = UserRepository(session)
        self.refresh_tokens = RefreshTokenRepository(session)
        self.settings = get_settings()
        self.token_config = get_token_config(self.settings)

    async def register(self, payload: RegisterRequest) -> tuple[User, str, str]:
        """Register a new user and issue tokens."""
        existing = await self.users.get_by_email(str(payload.email))
        if existing:
            raise ApplicationError("Email is already registered", status_code=status.HTTP_409_CONFLICT)

        user = User(
            first_name=payload.first_name.strip(),
            last_name=payload.last_name.strip(),
            email=str(payload.email).lower(),
            phone=payload.phone,
            hashed_password=hash_password(payload.password),
            role=payload.role.value,
            status="active",
            is_active=True,
        )
        await self.users.add(user)
        access_token = self.create_access_token(user)
        refresh_token = await self.create_refresh_token(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user, access_token, refresh_token

    async def login(self, payload: LoginRequest) -> tuple[User, str, str]:
        """Authenticate a user and issue tokens."""
        user = await self.users.get_by_email(str(payload.email))
        if not user or not verify_password(payload.password, user.hashed_password):
            raise ApplicationError("Invalid email or password", status_code=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active or user.status != "active":
            raise ApplicationError("User account is not active", status_code=status.HTTP_403_FORBIDDEN)

        user.last_login_at = datetime.now(UTC)
        access_token = self.create_access_token(user)
        refresh_token = await self.create_refresh_token(user, remember_me=payload.remember_me)
        await self.session.commit()
        await self.session.refresh(user)
        return user, access_token, refresh_token

    async def refresh(self, refresh_token: str) -> tuple[User, str, str]:
        """Rotate a refresh token and issue a new access token."""
        now = datetime.now(UTC)
        token_hash = self.hash_token(refresh_token)
        persisted = await self.refresh_tokens.get_valid_by_hash(token_hash, now)
        if not persisted:
            raise ApplicationError("Invalid refresh token", status_code=status.HTTP_401_UNAUTHORIZED)

        user = await self.users.get_active_by_id(persisted.user_id)
        if not user:
            raise ApplicationError("User account is not active", status_code=status.HTTP_401_UNAUTHORIZED)

        persisted.revoked_at = now
        access_token = self.create_access_token(user)
        new_refresh_token = await self.create_refresh_token(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user, access_token, new_refresh_token

    async def logout(self, user_id: UUID) -> None:
        """Revoke all active sessions for the current user."""
        await self.refresh_tokens.revoke_for_user(self.session, user_id, datetime.now(UTC))
        await self.session.commit()

    async def get_current_user(self, token: str) -> User:
        """Resolve a user from a JWT access token."""
        try:
            payload = jwt.decode(token, self.token_config.secret_key, algorithms=[self.token_config.algorithm])
            subject = payload.get("sub")
            if not subject:
                raise ApplicationError("Invalid access token", status_code=status.HTTP_401_UNAUTHORIZED)
            user_id = UUID(str(subject))
        except (JWTError, ValueError) as exc:
            raise ApplicationError("Invalid access token", status_code=status.HTTP_401_UNAUTHORIZED) from exc

        user = await self.users.get_active_by_id(user_id)
        if not user:
            raise ApplicationError("User account is not active", status_code=status.HTTP_401_UNAUTHORIZED)
        return user

    def create_access_token(self, user: User) -> str:
        """Create a signed JWT access token."""
        expires_at = datetime.now(UTC) + timedelta(minutes=self.settings.access_token_expire_minutes)
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "type": "access",
            "exp": expires_at,
        }
        return jwt.encode(payload, self.token_config.secret_key, algorithm=self.token_config.algorithm)

    async def create_refresh_token(self, user: User, remember_me: bool = False) -> str:
        """Create and persist an opaque refresh token."""
        raw_token = token_urlsafe(48)
        days = 30 if remember_me else self.settings.refresh_token_expire_days
        refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=self.hash_token(raw_token),
            expires_at=datetime.now(UTC) + timedelta(days=days),
        )
        await self.refresh_tokens.add(refresh_token)
        return raw_token

    @staticmethod
    def hash_token(raw_token: str) -> str:
        """Hash opaque token values before storage."""
        return sha256(raw_token.encode("utf-8")).hexdigest()

    @staticmethod
    def to_role(value: str) -> UserRole:
        """Convert persisted role string to enum."""
        return UserRole(value)
