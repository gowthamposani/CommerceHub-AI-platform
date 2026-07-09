"""Seller repository integration tests."""

from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.seller import Seller
from app.repositories.seller import SellerRepository


def build_seller(**overrides: object) -> Seller:
    """Build a valid seller ORM entity for repository tests."""
    suffix = uuid4().hex[:8].upper()
    values: dict[str, object] = {
        "user_id": uuid4(),
        "business_name": f"Repository Seller {suffix}",
        "legal_business_name": f"Repository Seller {suffix} Private Limited",
        "business_type": "private_limited",
        "business_email": f"repository-{suffix.lower()}@example.com",
        "business_phone": "+91 9876543210",
        "gst_number": f"27ABC{suffix[:2]}1234F1Z5",
        "pan_number": f"ABC{suffix[:2]}1234F",
        "tax_identification_number": f"TIN{suffix}",
        "website": "https://example.com",
        "logo_url": "https://example.com/logo.png",
        "description": "Repository integration test seller",
        "address_line_1": "123 Market Street",
        "address_line_2": "Suite 5",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "400001",
        "account_holder_name": "Repository Seller",
        "bank_name": "Commerce Bank",
        "account_number": "123456789012",
        "ifsc_code": "ABCD0123456",
        "branch_name": "Mumbai Main",
        "default_currency": "INR",
        "notifications_enabled": True,
        "order_auto_accept_enabled": False,
    }
    values.update(overrides)
    return Seller(**values)


@pytest.mark.anyio
async def test_seller_repository_rollback_removes_uncommitted_create(db_session: AsyncSession) -> None:
    """Uncommitted seller creation can be rolled back safely."""
    repository = SellerRepository(db_session)
    seller = await repository.create(build_seller(gst_number="27ABCDE1234F1Z5", pan_number="ABCDE1234F"))
    seller_id = seller.id

    await db_session.rollback()

    assert await repository.get_active_by_id(seller_id) is None


@pytest.mark.anyio
async def test_seller_repository_soft_delete_persists_state(db_session: AsyncSession) -> None:
    """Soft delete persists lifecycle fields and hides seller from active reads."""
    repository = SellerRepository(db_session)
    seller = await repository.create(build_seller(gst_number="29PQRST1234F1Z5", pan_number="PQRST1234F"))
    await db_session.commit()

    deleted_seller = await repository.soft_delete(seller)
    await db_session.commit()

    stored = await db_session.get(Seller, seller.id)
    assert stored is not None
    assert deleted_seller.is_deleted is True
    assert stored.is_deleted is True
    assert stored.deleted_at is not None
    assert stored.is_active is False
    assert stored.status == "deleted"
    assert await repository.get_active_by_id(seller.id) is None
