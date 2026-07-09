"""Authentication routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_auth_service, get_current_user
from app.models.enums import UserStatus
from app.models.user import User
from app.schemas.auth import (
    ApiResponse,
    AuthSessionData,
    EmptyData,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    UserRead,
)
from app.services.auth_service import AuthenticationService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=ApiResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    response_model_exclude_none=True,
)
def register(
    payload: RegisterRequest,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> ApiResponse[UserRead]:
    """Register a new customer or seller."""

    user = auth_service.register(payload)
    message = "Registration successful"
    if user.status == UserStatus.PENDING_APPROVAL:
        message = "Registration successful. Seller account is pending approval"
    return ApiResponse[UserRead](success=True, message=message, data=UserRead.model_validate(user))


@router.post(
    "/login",
    response_model=ApiResponse[AuthSessionData],
    response_model_exclude_none=True,
)
def login(
    payload: LoginRequest,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> ApiResponse[AuthSessionData]:
    """Authenticate a user and return access and refresh tokens."""

    session = auth_service.login(payload)
    return ApiResponse[AuthSessionData](success=True, message="Login successful", data=session)


@router.post(
    "/refresh",
    response_model=ApiResponse[AuthSessionData],
    response_model_exclude_none=True,
)
def refresh(
    payload: RefreshTokenRequest,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> ApiResponse[AuthSessionData]:
    """Rotate a refresh token and return a fresh token pair."""

    session = auth_service.refresh(payload)
    return ApiResponse[AuthSessionData](success=True, message="Token refreshed successfully", data=session)


@router.get(
    "/me",
    response_model=ApiResponse[UserRead],
    response_model_exclude_none=True,
)
def me(current_user: User = Depends(get_current_user)) -> ApiResponse[UserRead]:
    """Return the current authenticated user."""

    return ApiResponse[UserRead](
        success=True,
        message="Current user retrieved successfully",
        data=UserRead.model_validate(current_user),
    )


@router.post(
    "/logout",
    response_model=ApiResponse[EmptyData],
    response_model_exclude_none=True,
)
def logout(
    payload: LogoutRequest,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> ApiResponse[EmptyData]:
    """Revoke the current refresh token."""

    auth_service.logout(payload)
    return ApiResponse[EmptyData](success=True, message="Logout successful", data=EmptyData())
