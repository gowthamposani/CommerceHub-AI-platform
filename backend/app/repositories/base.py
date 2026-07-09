"""Generic repository foundation for future modules."""

from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Reusable async repository for entity persistence."""

    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def base_query(self) -> Select[tuple[ModelT]]:
        """Return the base select statement for the model."""
        return select(self.model)

    async def get_by_id(self, entity_id: UUID) -> ModelT | None:
        """Return an entity by ID."""
        return await self.session.get(self.model, entity_id)

    async def add(self, entity: ModelT) -> ModelT:
        """Add an entity to the current unit of work."""
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete(self, entity: ModelT) -> None:
        """Delete an entity from the current unit of work."""
        await self.session.delete(entity)
        await self.session.flush()

