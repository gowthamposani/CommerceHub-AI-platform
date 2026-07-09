"""Refresh token repository."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import utc_now
from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    """Persistence helpers for refresh token rotation and revocation."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, *, user_id: UUID, jti: str, expires_at: datetime) -> RefreshToken:
        """Persist a refresh token record."""

        token = RefreshToken(user_id=user_id, jti=jti, expires_at=expires_at)
        self.session.add(token)
        self.session.flush()
        self.session.refresh(token)
        return token

    def get_by_jti(self, jti: str) -> Optional[RefreshToken]:
        """Return a refresh token by its JWT identifier."""

        stmt = select(RefreshToken).where(RefreshToken.jti == jti)
        return self.session.scalar(stmt)

    def get_active_by_jti(self, jti: str) -> Optional[RefreshToken]:
        """Return an active refresh token by JWT identifier."""

        stmt = select(RefreshToken).where(
            RefreshToken.jti == jti,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > utc_now(),
        )
        return self.session.scalar(stmt)

    def revoke(self, token: RefreshToken, revoked_at: Optional[datetime] = None) -> RefreshToken:
        """Mark a refresh token as revoked."""

        token.revoked_at = revoked_at or utc_now()
        self.session.flush()
        return token
