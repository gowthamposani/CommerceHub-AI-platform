"""Product image SQLAlchemy model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID  # noqa: N811
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.product import Product


class ProductImage(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Product image metadata persisted for product galleries."""

    __tablename__ = "product_images"
    __table_args__ = (
        UniqueConstraint("product_id", "image_hash", name="uq_product_images_product_hash"),
        CheckConstraint("display_order >= 0", name="ck_product_images_display_order_non_negative"),
        CheckConstraint("file_size <= 10485760", name="ck_product_images_max_file_size"),
        Index("ix_product_images_product_id", "product_id"),
        Index("ix_product_images_display_order", "display_order"),
        Index("ix_product_images_is_primary", "is_primary"),
    )

    product_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    image_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)

    product: Mapped["Product"] = relationship(
        "Product",
        lazy="selectin",
        backref=backref("images", lazy="selectin", cascade="all, delete-orphan"),
    )
