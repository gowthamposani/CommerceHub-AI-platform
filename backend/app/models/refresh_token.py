"""Refresh token persistence model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:  # pragma: no cover - typing only
    from app.models.user import User


class RefreshToken(Base):
    """Persisted refresh token record used for rotation and revocation."""

    __tablename__ = "refresh_tokens"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    jti: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="refresh_tokens", lazy="joined")

    @property
    def is_active(self) -> bool:
        """Return whether the token has not been revoked or expired."""

        from app.core.security import utc_now

        return self.revoked_at is None and self.expires_at > utc_now()

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"RefreshToken(id={self.id!s}, jti={self.jti!s})"
