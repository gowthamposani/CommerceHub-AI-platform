"""Security helpers for password hashing and JWT handling."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Mapping, Optional
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.exceptions import AuthenticationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""

    return datetime.now(timezone.utc)


def normalize_email(email: str) -> str:
    """Normalize email addresses for comparison and persistence."""

    return email.strip().lower()


def hash_password(password: str) -> str:
    """Hash a plain-text password."""

    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its stored hash."""

    return pwd_context.verify(plain_password, hashed_password)


def create_jwt_token(
    *,
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    secret_key: str,
    algorithm: str,
    issuer: Optional[str] = None,
    audience: Optional[str] = None,
    extra_claims: Optional[Mapping[str, Any]] = None,
) -> tuple[str, datetime, str]:
    """Create a signed JWT and return the token, expiry and jti."""

    now = utc_now()
    expires_at = now + expires_delta
    jti = str(uuid4())
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
        "jti": jti,
    }
    if issuer is not None:
        payload["iss"] = issuer
    if audience is not None:
        payload["aud"] = audience
    if extra_claims is not None:
        payload.update(extra_claims)
    token = jwt.encode(payload, secret_key, algorithm=algorithm)
    return token, expires_at, jti


def decode_jwt_token(
    token: str,
    *,
    secret_key: str,
    algorithm: str,
    expected_type: Optional[str] = None,
    issuer: Optional[str] = None,
    audience: Optional[str] = None,
) -> dict[str, Any]:
    """Decode and validate a JWT."""

    options = {
        "verify_aud": audience is not None,
        "verify_iss": issuer is not None,
    }
    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[algorithm],
            issuer=issuer,
            audience=audience,
            options=options,
        )
    except JWTError as exc:  # pragma: no cover - exercised in runtime tests
        raise AuthenticationError("Invalid or expired token") from exc

    if expected_type is not None and payload.get("type") != expected_type:
        raise AuthenticationError("Invalid token type")

    return payload


__all__ = [
    "create_jwt_token",
    "decode_jwt_token",
    "hash_password",
    "normalize_email",
    "utc_now",
    "verify_password",
]
