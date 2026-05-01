from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "success": True,
        "message": "JobNuro AI service is running",
        "data": {
            "service": settings.app_name,
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }