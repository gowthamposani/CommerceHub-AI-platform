"""Request-scoped dependencies."""

from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, Header, Query, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.constants import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, REQUEST_ID_HEADER
from app.common.enums import SortDirection, UserRole
from app.common.pagination import PaginationParams
from app.dependencies.database import get_db_session
from app.services.auth import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class RequestContext:
    """Context extracted from the current HTTP request."""

    trace_id: str
    path: str
    method: str


@dataclass(frozen=True)
class CurrentUserPlaceholder:
    """Authentication placeholder for future auth module integration."""

    id: UUID | None = None
    role: UserRole = UserRole.ANONYMOUS
    permissions: frozenset[str] = frozenset()


def get_pagination(
    page: int = Query(default=DEFAULT_PAGE, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
) -> PaginationParams:
    """Provide validated pagination parameters."""
    return PaginationParams(page=page, page_size=page_size)


def get_sorting(
    sort_by: str | None = Query(default=None),
    sort_direction: SortDirection = Query(default=SortDirection.ASC),
) -> dict[str, str | SortDirection | None]:
    """Provide reusable sorting inputs."""
    return {"sort_by": sort_by, "sort_direction": sort_direction}


def get_filtering(filters: str | None = Query(default=None)) -> dict[str, str | None]:
    """Provide serialized filtering input for future modules."""
    return {"filters": filters}


def get_search(search: str | None = Query(default=None, min_length=1, max_length=255)) -> str | None:
    """Provide reusable search query input."""
    return search.strip() if search else None


def get_request_context(
    request: Request,
    request_id: str | None = Header(default=None, alias=REQUEST_ID_HEADER),
) -> RequestContext:
    """Provide request context."""
    trace_id = request_id or getattr(request.state, "request_id", None) or "unknown"
    return RequestContext(trace_id=trace_id, path=request.url.path, method=request.method)


async def get_current_user_placeholder(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db_session),
) -> CurrentUserPlaceholder:
    """Resolve the current user when a bearer token is present.

    Existing public module tests and routes continue to work without a token,
    while protected routes can reuse the same dependency and receive role data.
    """
    if credentials is None:
        return CurrentUserPlaceholder()
    user = await AuthService(session).get_current_user(credentials.credentials)
    return CurrentUserPlaceholder(id=user.id, role=UserRole(user.role), permissions=frozenset())


def get_jwt_placeholder() -> None:
    """Reserve a dependency slot for the future JWT implementation."""
    return None
