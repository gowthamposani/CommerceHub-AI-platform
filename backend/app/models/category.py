"""Category SQLAlchemy model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as POSTGRES_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from collections.abc import Sequence


class Category(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Hierarchical category for future product classification."""

    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("category_name", name="uq_categories_category_name"),
        UniqueConstraint("category_slug", name="uq_categories_category_slug"),
        CheckConstraint("display_order >= 0", name="ck_categories_display_order_non_negative"),
        Index("ix_categories_category_name", "category_name"),
        Index("ix_categories_category_slug", "category_slug"),
        Index("ix_categories_parent_category_id", "parent_category_id"),
        Index("ix_categories_status", "status"),
        Index("ix_categories_display_order", "display_order"),
    )

    parent_category_id: Mapped[UUID | None] = mapped_column(
        POSTGRES_UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    category_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)

    parent: Mapped["Category | None"] = relationship(
        "Category",
        remote_side="Category.id",
        back_populates="children",
        lazy="selectin",
    )
    children: Mapped["Sequence[Category]"] = relationship(
        "Category",
        back_populates="parent",
        lazy="selectin",
        passive_deletes=True,
    )
