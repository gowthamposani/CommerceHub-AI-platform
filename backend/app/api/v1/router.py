"""API v1 router registration."""

from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.brands import router as brands_router
from app.api.v1.endpoints.categories import router as categories_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.inventory import router as inventory_router
from app.api.v1.endpoints.products import router as products_router
from app.api.v1.endpoints.seller_dashboard import router as seller_dashboard_router
from app.api.v1.endpoints.sellers import router as sellers_router
from app.api.v1.endpoints.warehouses import router as warehouses_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router)
api_router.include_router(brands_router)
api_router.include_router(categories_router)
api_router.include_router(inventory_router)
api_router.include_router(products_router)
api_router.include_router(seller_dashboard_router)
api_router.include_router(sellers_router)
api_router.include_router(warehouses_router)
