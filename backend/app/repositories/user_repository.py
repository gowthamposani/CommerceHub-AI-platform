"""User repository."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import normalize_email, utc_now
from app.models.enums import RoleName, UserStatus
from app.models.role import Role
from app.models.user import User


class UserRepository:
    """Persistence helpers for users and roles."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        """Return a user by email address."""

        normalized_email = normalize_email(email)
        stmt = select(User).where(User.email == normalized_email)
        return self.session.scalar(stmt)

    def get_by_id(self, user_id: UUID) -> User | None:
        """Return a user by identifier."""

        stmt = select(User).where(User.id == user_id)
        return self.session.scalar(stmt)

    def get_role_by_name(self, role_name: RoleName) -> Role | None:
        """Return a role by name."""

        stmt = select(Role).where(Role.name == role_name)
        return self.session.scalar(stmt)

    def get_or_create_role(self, role_name: RoleName) -> Role:
        """Load an existing role or create it on demand."""

        role = self.get_role_by_name(role_name)
        if role is not None:
            return role

        role = Role(name=role_name)
        self.session.add(role)
        self.session.flush()
        self.session.refresh(role)
        return role

    def ensure_default_roles(self) -> list[Role]:
        """Ensure the standard marketplace roles exist."""

        return [self.get_or_create_role(role_name) for role_name in RoleName]

    def create_user(
        self,
        *,
        first_name: str,
        last_name: str,
        email: str,
        password_hash: str,
        role: Role,
        status: UserStatus = UserStatus.ACTIVE,
    ) -> User:
        """Create and flush a new user record."""

        user = User(
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            email=normalize_email(email),
            password_hash=password_hash,
            role=role,
            status=status,
        )
        self.session.add(user)
        self.session.flush()
        self.session.refresh(user)
        return user

    def update_last_login(self, user: User, when: datetime | None = None) -> User:
        """Update the user's last login timestamp."""

        user.last_login_at = when or utc_now()
        self.session.flush()
        return user
