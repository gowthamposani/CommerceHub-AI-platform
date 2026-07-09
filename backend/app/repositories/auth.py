"""Authentication repository."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import RefreshToken, User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """User account persistence."""

    model = User

    async def get_by_email(self, email: str) -> User | None:
        """Return a user by normalized email."""
        result = await self.session.execute(select(User).where(User.email == email.lower(), User.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def get_active_by_id(self, user_id: UUID) -> User | None:
        """Return an active non-deleted user by ID."""
        result = await self.session.execute(
            select(User).where(User.id == user_id, User.is_active.is_(True), User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    """Refresh token persistence."""

    model = RefreshToken

    async def get_valid_by_hash(self, token_hash: str, now: datetime) -> RefreshToken | None:
        """Return a valid persisted refresh token by hash."""
        result = await self.session.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
                RefreshToken.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def revoke_for_user(self, session: AsyncSession, user_id: UUID, now: datetime) -> None:
        """Revoke all active refresh tokens for a user."""
        result = await session.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.is_deleted.is_(False),
            )
        )
        for token in result.scalars():
            token.revoked_at = now
