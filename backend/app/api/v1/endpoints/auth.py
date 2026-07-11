"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import StandardResponse
from app.dependencies.database import get_db_session
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPairResponse,
    UserResponse,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_auth_service(session: AsyncSession = Depends(get_db_session)) -> AuthService:
    """Provide auth service dependency."""
    return AuthService(session)


def token_response(user, access_token: str, refresh_token: str, expires_in: int) -> TokenPairResponse:
    """Build token response payload."""
    return TokenPairResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/register",
    response_model=StandardResponse[TokenPairResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register user",
    description="Create a customer, seller, or admin user account and return an access/refresh token pair.",
)
async def register(
    payload: RegisterRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
) -> StandardResponse[TokenPairResponse]:
    """Register a new user."""
    user, access_token, refresh_token = await service.register(payload)
    return StandardResponse.success_response(
        "User registered successfully",
        token_response(user, access_token, refresh_token, service.settings.access_token_expire_minutes * 60),
        getattr(request.state, "request_id", None),
    )


@router.post(
    "/login",
    response_model=StandardResponse[TokenPairResponse],
    summary="Login user",
    description="Authenticate a user with email and password and return an access/refresh token pair.",
)
async def login(
    payload: LoginRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
) -> StandardResponse[TokenPairResponse]:
    """Login a user."""
    user, access_token, refresh_token = await service.login(payload)
    return StandardResponse.success_response(
        "Login successful",
        token_response(user, access_token, refresh_token, service.settings.access_token_expire_minutes * 60),
        getattr(request.state, "request_id", None),
    )


@router.post(
    "/refresh",
    response_model=StandardResponse[TokenPairResponse],
    summary="Refresh tokens",
    description="Rotate a refresh token and return a new access/refresh token pair.",
)
async def refresh(
    payload: RefreshTokenRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
) -> StandardResponse[TokenPairResponse]:
    """Refresh access credentials."""
    user, access_token, refresh_token = await service.refresh(payload.refresh_token)
    return StandardResponse.success_response(
        "Token refreshed successfully",
        token_response(user, access_token, refresh_token, service.settings.access_token_expire_minutes * 60),
        getattr(request.state, "request_id", None),
    )


@router.get(
    "/me",
    response_model=StandardResponse[UserResponse],
    summary="Get current user",
    description="Return the currently authenticated user from the bearer access token.",
)
async def me(
    request: Request,
    token: str = Depends(oauth2_scheme),
    service: AuthService = Depends(get_auth_service),
) -> StandardResponse[UserResponse]:
    """Return the authenticated user."""
    user = await service.get_current_user(token)
    return StandardResponse.success_response(
        "Current user retrieved successfully",
        UserResponse.model_validate(user),
        getattr(request.state, "request_id", None),
    )


@router.post(
    "/logout",
    response_model=StandardResponse[MessageResponse],
    summary="Logout user",
    description="Revoke active refresh tokens for the current user.",
)
async def logout(
    request: Request,
    token: str = Depends(oauth2_scheme),
    service: AuthService = Depends(get_auth_service),
) -> StandardResponse[MessageResponse]:
    """Logout the authenticated user."""
    user = await service.get_current_user(token)
    await service.logout(user.id)
    return StandardResponse.success_response(
        "Logout successful",
        MessageResponse(detail="Session revoked"),
        getattr(request.state, "request_id", None),
    )


@router.post(
    "/forgot-password",
    response_model=StandardResponse[MessageResponse],
    summary="Request password reset",
    description="Accept a password reset request without exposing whether the email exists.",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
) -> StandardResponse[MessageResponse]:
    """Accept password reset requests for future email delivery."""
    _ = payload
    return StandardResponse.success_response(
        "If the account exists, a reset email will be sent",
        MessageResponse(detail="Password reset requested"),
        getattr(request.state, "request_id", None),
    )


@router.post(
    "/reset-password",
    response_model=StandardResponse[MessageResponse],
    summary="Reset password",
    description="Reserved endpoint for email token based password reset.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
) -> StandardResponse[MessageResponse]:
    """Reject reset until email-token persistence is enabled."""
    _ = payload
    return StandardResponse.success_response(
        "Password reset token accepted for processing",
        MessageResponse(detail="Password reset flow is reserved for email-token integration"),
        getattr(request.state, "request_id", None),
    )
