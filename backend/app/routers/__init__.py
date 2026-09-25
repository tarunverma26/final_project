from app.routers.auth import router as auth_router
from app.routers.reports import router as reports_router
from app.routers.contractors import router as contractors_router
from app.routers.roads import router as roads_router
from app.routers.events import router as events_router
from app.routers.upload import router as upload_router
from app.routers.stats import router as stats_router

__all__ = [
    "auth_router",
    "reports_router",
    "contractors_router",
    "roads_router",
    "events_router",
    "upload_router",
    "stats_router",
]
