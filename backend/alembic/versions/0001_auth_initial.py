"""Create authentication tables.

Revision ID: 0001_auth_initial
Revises:
Create Date: 2026-07-08 00:00:00.000000
"""

from __future__ import annotations

from uuid import NAMESPACE_DNS, uuid5

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.models.enums import RoleName, UserStatus

# revision identifiers, used by Alembic.
revision = "0001_auth_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "name",
            sa.Enum(
                RoleName,
                name="role_name_enum",
                values_callable=lambda enum_cls: [item.value for item in enum_cls],
                native_enum=False,
            ),
            nullable=False,
            unique=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    roles_table = sa.table(
        "roles",
        sa.column("id", PGUUID(as_uuid=True)),
        sa.column("name", sa.String(length=32)),
    )
    op.bulk_insert(
        roles_table,
        [
            {"id": uuid5(NAMESPACE_DNS, "commercehub-role-customer"), "name": RoleName.CUSTOMER.value},
            {"id": uuid5(NAMESPACE_DNS, "commercehub-role-seller"), "name": RoleName.SELLER.value},
            {"id": uuid5(NAMESPACE_DNS, "commercehub-role-admin"), "name": RoleName.ADMIN.value},
        ],
    )

    op.create_table(
        "users",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("role_id", PGUUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                UserStatus,
                name="user_status_enum",
                values_callable=lambda enum_cls: [item.value for item in enum_cls],
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_index("ix_users_role_id", "users", ["role_id"], unique=False)
    op.create_index("ix_users_status", "users", ["status"], unique=False)
    op.create_index("ix_users_last_login_at", "users", ["last_login_at"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", PGUUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("jti", sa.String(length=36), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"], unique=False)
    op.create_index("ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"], unique=False)
    op.create_index("ix_refresh_tokens_revoked_at", "refresh_tokens", ["revoked_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_revoked_at", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_index("ix_users_last_login_at", table_name="users")
    op.drop_index("ix_users_status", table_name="users")
    op.drop_index("ix_users_role_id", table_name="users")
    op.drop_table("users")

    op.drop_table("roles")
