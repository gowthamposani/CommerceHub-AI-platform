"""Authentication service."""

from __future__ import annotations

from datetime import timedelta
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AuthenticationError, AuthorizationError, ConflictError, NotFoundError
from app.core.security import (
    create_jwt_token,
    decode_jwt_token,
    hash_password,
    normalize_email,
    utc_now,
    verify_password,
)
from app.models.enums import RoleName, UserStatus
from app.models.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    AuthSessionData,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPairData,
    UserRead,
)


class AuthenticationService:
    """Business logic for authentication."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.settings = get_settings()
        self.users = UserRepository(session)
        self.refresh_tokens = RefreshTokenRepository(session)

    def _commit(self) -> None:
        try:
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def _parse_uuid(self, value: str, *, message: str) -> UUID:
        try:
            return UUID(str(value))
        except (TypeError, ValueError) as exc:
            raise AuthenticationError(message) from exc

    def _ensure_user_can_authenticate(self, user: User) -> None:
        if user.status == UserStatus.ACTIVE:
            return
        if user.status == UserStatus.PENDING_APPROVAL:
            raise AuthorizationError("Seller account is pending approval")
        if user.status == UserStatus.SUSPENDED:
            raise AuthorizationError("Account is suspended")
        raise AuthorizationError("Account is inactive")

    def _build_user_read(self, user: User) -> UserRead:
        return UserRead.model_validate(user)

    def _get_role_name(self, user: User) -> RoleName:
        if user.role is None:
            raise NotFoundError("User role not found")
        return user.role.name

    def _build_token_pair(self, user: User) -> TokenPairData:
        role_name = self._get_role_name(user)
        access_token, access_expires_at, _ = create_jwt_token(
            subject=str(user.id),
            token_type="access",
            expires_delta=timedelta(minutes=self.settings.access_token_expire_minutes),
            secret_key=self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
            issuer=self.settings.token_issuer,
            audience=self.settings.token_audience,
            extra_claims={
                "email": user.email,
                "role": role_name.value,
            },
        )
        refresh_token, refresh_expires_at, refresh_jti = create_jwt_token(
            subject=str(user.id),
            token_type="refresh",
            expires_delta=timedelta(days=self.settings.refresh_token_expire_days),
            secret_key=self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
            issuer=self.settings.token_issuer,
            audience=self.settings.token_audience,
            extra_claims={
                "email": user.email,
                "role": role_name.value,
            },
        )
        self.refresh_tokens.create(
            user_id=user.id,
            jti=refresh_jti,
            expires_at=refresh_expires_at,
        )
        return TokenPairData(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            access_token_expires_at=access_expires_at,
            refresh_token_expires_at=refresh_expires_at,
        )

    def seed_default_roles(self) -> None:
        """Create the standard role rows if they do not already exist."""

        self.users.ensure_default_roles()
        self._commit()

    def register(self, payload: RegisterRequest) -> User:
        """Register a new customer or seller account."""

        email = normalize_email(payload.email)
        if self.users.get_by_email(email) is not None:
            raise ConflictError("A user with this email already exists")

        role = self.users.get_or_create_role(RoleName(payload.role.value))
        status = UserStatus.PENDING_APPROVAL if role.name == RoleName.SELLER else UserStatus.ACTIVE

        try:
            user = self.users.create_user(
                first_name=payload.first_name,
                last_name=payload.last_name,
                email=email,
                password_hash=hash_password(payload.password),
                role=role,
                status=status,
            )
            self._commit()
            return user
        except IntegrityError as exc:
            self.session.rollback()
            raise ConflictError("A user with this email already exists") from exc

    def login(self, payload: LoginRequest) -> AuthSessionData:
        """Authenticate a user and issue a token pair."""

        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        self._ensure_user_can_authenticate(user)
        token_pair = self._build_token_pair(user)
        self.users.update_last_login(user, utc_now())
        self._commit()
        return AuthSessionData(user=self._build_user_read(user), tokens=token_pair)

    def refresh(self, payload: RefreshTokenRequest) -> AuthSessionData:
        """Rotate a refresh token and issue a fresh token pair."""

        decoded = decode_jwt_token(
            payload.refresh_token,
            secret_key=self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
            expected_type="refresh",
            issuer=self.settings.token_issuer,
            audience=self.settings.token_audience,
        )
        refresh_jti = str(decoded.get("jti", ""))
        user_id = self._parse_uuid(decoded.get("sub", ""), message="Invalid refresh token subject")

        token_record = self.refresh_tokens.get_active_by_jti(refresh_jti)
        if token_record is None:
            raise AuthenticationError("Refresh token is invalid or revoked")

        if token_record.user_id != user_id:
            raise AuthenticationError("Refresh token does not match the current user")

        user = self.users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")

        self._ensure_user_can_authenticate(user)
        self.refresh_tokens.revoke(token_record)
        token_pair = self._build_token_pair(user)
        self._commit()
        return AuthSessionData(user=self._build_user_read(user), tokens=token_pair)

    def logout(self, payload: LogoutRequest) -> None:
        """Revoke a refresh token."""

        try:
            decoded = decode_jwt_token(
                payload.refresh_token,
                secret_key=self.settings.jwt_secret_key,
                algorithm=self.settings.jwt_algorithm,
                expected_type="refresh",
                issuer=self.settings.token_issuer,
                audience=self.settings.token_audience,
            )
        except AuthenticationError:
            return

        refresh_jti = str(decoded.get("jti", ""))
        token_record = self.refresh_tokens.get_by_jti(refresh_jti)
        if token_record is None or token_record.revoked_at is not None:
            return

        self.refresh_tokens.revoke(token_record)
        self._commit()

    def get_current_user(self, token: str) -> User:
        """Resolve the current user from an access token."""

        decoded = decode_jwt_token(
            token,
            secret_key=self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
            expected_type="access",
            issuer=self.settings.token_issuer,
            audience=self.settings.token_audience,
        )
        user_id = self._parse_uuid(decoded.get("sub", ""), message="Invalid access token subject")

        user = self.users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")

        self._ensure_user_can_authenticate(user)
        return user
