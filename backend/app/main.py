"""Application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.cart.router import router as cart_router
from app.api.customer.router import router as customer_router
from app.api.auth.router import router as auth_router
from app.api.orders.router import router as order_router
from app.api.wishlist.router import router as wishlist_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers

settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(cart_router, prefix=settings.api_v1_prefix)
app.include_router(customer_router, prefix=settings.api_v1_prefix)
app.include_router(order_router, prefix=settings.api_v1_prefix)
app.include_router(wishlist_router, prefix=settings.api_v1_prefix)
