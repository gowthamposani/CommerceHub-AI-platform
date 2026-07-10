"""SQLAlchemy declarative base and reusable model mixins."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    type_annotation_map = {UUID: PostgresUUID(as_uuid=True)}


class UUIDMixin:
    """Mixin that adds a UUID primary key."""

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)


class TimestampMixin:
    """Mixin that adds timezone-aware creation and update timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Mixin that adds soft-delete support."""

    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(default=False, nullable=False, index=True)

    def mark_deleted(self) -> None:
        """Mark the entity as deleted without removing it from the database."""
        self.is_deleted = True
        self.deleted_at = datetime.now().astimezone()

    def restore(self) -> None:
        """Restore a previously soft-deleted entity."""
        self.is_deleted = False
        self.deleted_at = None


class AuditMixin:
    """Mixin that adds generic audit user references."""

    @declared_attr.directive
    def created_by_id(cls) -> Mapped[UUID | None]:
        """Return creator foreign key column."""
        return mapped_column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    @declared_attr.directive
    def updated_by_id(cls) -> Mapped[UUID | None]:
        """Return updater foreign key column."""
        return mapped_column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    @declared_attr.directive
    def deleted_by_id(cls) -> Mapped[UUID | None]:
        """Return deleter foreign key column."""
        return mapped_column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)


class ModelMixin(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Default base mixin for future business entities."""

    def as_dict(self) -> dict[str, Any]:
        """Serialize mapped columns to a dictionary."""
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}
