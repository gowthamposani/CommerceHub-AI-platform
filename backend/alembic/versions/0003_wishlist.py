"""Create wishlist table.

Revision ID: 0003_wishlist
Revises: 0002_customer_addresses
Create Date: 2026-07-09 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID

# revision identifiers, used by Alembic.
revision = "0003_wishlist"
down_revision = "0002_customer_addresses"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wishlist",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("customer_id", PGUUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", PGUUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("customer_id", "product_id", name="uq_wishlist_customer_product"),
    )

    op.create_index("ix_wishlist_customer_id", "wishlist", ["customer_id"], unique=False)
    op.create_index("ix_wishlist_product_id", "wishlist", ["product_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_wishlist_product_id", table_name="wishlist")
    op.drop_index("ix_wishlist_customer_id", table_name="wishlist")
    op.drop_table("wishlist")
