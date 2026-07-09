"""FastAPI dependency providers."""

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.session import get_db
from app.models.user import User
from app.services.cart_service import CartService
from app.services.auth_service import AuthenticationService
from app.services.customer_service import CustomerService
from app.services.order_service import OrderService
from app.services.wishlist_service import WishlistService

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")


def get_auth_service(db: Session = Depends(get_db)) -> AuthenticationService:
    """Inject the authentication service."""

    return AuthenticationService(db)


def get_customer_service(db: Session = Depends(get_db)) -> CustomerService:
    """Inject the customer service."""

    return CustomerService(db)


def get_cart_service(db: Session = Depends(get_db)) -> CartService:
    """Inject the cart service."""

    return CartService(db)


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    """Inject the order service."""

    return OrderService(db)


def get_wishlist_service(db: Session = Depends(get_db)) -> WishlistService:
    """Inject the wishlist service."""

    return WishlistService(db)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> User:
    """Resolve the current authenticated user from a bearer token."""

    return auth_service.get_current_user(token)


__all__ = [
    "get_auth_service",
    "get_cart_service",
    "get_customer_service",
    "get_current_user",
    "get_order_service",
    "get_wishlist_service",
    "oauth2_scheme",
]
