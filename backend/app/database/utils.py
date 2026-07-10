"""Reusable database query utilities."""

from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams, build_page


async def paginate(session: AsyncSession, statement: Select[tuple[Any]], params: PaginationParams) -> Page[Any]:
    """Execute a paginated select statement."""
    count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
    total_items = await session.scalar(count_statement) or 0
    result = await session.execute(statement.offset(params.offset).limit(params.limit))
    return build_page(list(result.scalars().all()), total_items, params)


async def exists(session: AsyncSession, statement: Select[tuple[Any]]) -> bool:
    """Return whether a select statement yields at least one row."""
    result = await session.execute(statement.limit(1))
    return result.scalar_one_or_none() is not None

