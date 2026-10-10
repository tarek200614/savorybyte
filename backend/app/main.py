from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.menu import router as menu_router
from app.api.v1.orders import router as orders_router
from app.api.v1.reservations import router as reservations_router
from app.api.v1.security import router as security_router
from app.api.v1.tables import router as tables_router
from app.core.config import settings
from app.core.security_headers import SecurityHeadersMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# AppSec Defensive Security Headers & Request Correlation ID Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(tables_router, prefix=settings.API_V1_STR)
app.include_router(reservations_router, prefix=settings.API_V1_STR)
app.include_router(menu_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(security_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint used by Docker, load balancers, and monitoring systems.
    Returns status 200 OK when the application service is alive.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get(f"{settings.API_V1_STR}", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": "/health",
    }
