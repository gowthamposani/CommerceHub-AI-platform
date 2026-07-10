"""Security foundation placeholders."""

from dataclasses import dataclass
from datetime import timedelta

from passlib.context import CryptContext

from app.config.settings import Settings

password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


@dataclass(frozen=True)
class TokenConfig:
    """JWT token configuration."""

    secret_key: str
    algorithm: str
    access_token_expire: timedelta
    refresh_token_expire: timedelta


def get_token_config(settings: Settings) -> TokenConfig:
    """Build token configuration without implementing authentication."""
    return TokenConfig(
        secret_key=settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
        access_token_expire=timedelta(minutes=settings.access_token_expire_minutes),
        refresh_token_expire=timedelta(days=settings.refresh_token_expire_days),
    )


def hash_password(password: str) -> str:
    """Hash a password for future auth integrations."""
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password for future auth integrations."""
    return password_context.verify(plain_password, hashed_password)
