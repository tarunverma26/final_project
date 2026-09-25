import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from app.config import (
    APP_TITLE, APP_VERSION, CORS_ORIGINS, UPLOAD_DIR
)
from app.database import client, init_indexes, seed_default_data
from app.utils.security import hash_password
from app.routers import (
    auth_router,
    reports_router,
    contractors_router,
    roads_router,
    events_router,
    upload_router,
    stats_router,
)

logger = logging.getLogger("roadwatch.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management for index initialization and data seeding."""
    logger.info("[App] Starting ROADWATCH API...")
    await init_indexes()
    await seed_default_data(hash_password)
    logger.info("[App] Startup sequence completed.")
    yield
    logger.info("[App] Shutting down ROADWATCH API...")
    client.close()


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title=APP_TITLE,
        version=APP_VERSION,
        lifespan=lifespan,
    )

    # CORS Middleware with valid credential configuration
    # Note: Modern browser fetch standards prohibit allow_credentials=True when allow_origins=["*"]
    has_wildcard = "*" in CORS_ORIGINS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=not has_wildcard,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Static file serving for uploads
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

    # Group all domain routers under /api prefix
    api_router = APIRouter(prefix="/api")
    api_router.include_router(auth_router)
    api_router.include_router(reports_router)
    api_router.include_router(contractors_router)
    api_router.include_router(roads_router)
    api_router.include_router(events_router)
    api_router.include_router(upload_router)
    api_router.include_router(stats_router)

    @api_router.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "app": APP_TITLE, "version": APP_VERSION}

    app.include_router(api_router)

    return app


app = create_app()
