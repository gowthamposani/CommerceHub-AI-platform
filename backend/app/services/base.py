"""Service-layer foundation for future modules."""

from sqlalchemy.ext.asyncio import AsyncSession


class BaseService:
    """Base class for application services."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

