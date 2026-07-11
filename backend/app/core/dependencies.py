"""Backward-compatible dependency exports."""

from app.dependencies.database import get_db_session
from app.dependencies.request import (
    CurrentUserPlaceholder,
    RequestContext,
    get_current_user_placeholder,
    get_filtering,
    get_jwt_placeholder,
    get_pagination,
    get_request_context,
    get_search,
    get_sorting,
)

__all__ = [
    "CurrentUserPlaceholder",
    "RequestContext",
    "get_current_user_placeholder",
    "get_db_session",
    "get_filtering",
    "get_jwt_placeholder",
    "get_pagination",
    "get_request_context",
    "get_search",
    "get_sorting",
]
