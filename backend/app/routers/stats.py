from fastapi import APIRouter
from app.database import db

router = APIRouter(prefix="/stats", tags=["System Statistics"])


@router.get("/overview")
async def stats_overview():
    """Retrieve citywide infrastructure statistics and resolution metrics."""
    total = await db.reports.count_documents({})
    resolved = await db.reports.count_documents({"status": "RESOLVED"})
    in_progress = await db.reports.count_documents(
        {"status": {"$in": ["WORK_IN_PROGRESS", "WORK_PLANNED", "ASSIGNED", "UNDER_REVIEW", "FORWARDED", "RESOLUTION", "VERIFIED"]}}
    )
    critical = await db.reports.count_documents({"severity": "CRITICAL"})

    if total == 0:
        # Marketing showcase fallbacks when database is completely empty
        return {
            "total_problems": 2481,
            "resolved_or_progress_pct": 73,
            "resolved": 0,
            "in_progress": 0,
            "critical": 0,
        }

    pct = round(((resolved + in_progress) / total) * 100) if total else 0
    return {
        "total_problems": total,
        "resolved_or_progress_pct": pct,
        "resolved": resolved,
        "in_progress": in_progress,
        "critical": critical,
    }
