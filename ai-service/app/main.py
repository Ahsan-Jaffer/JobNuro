from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.health_routes import router as health_router
from app.routes.resume_routes import router as resume_router

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI/NLP microservice for JobNuro resume analysis, ATS scoring, and career intelligence.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(resume_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to JobNuro AI Service",
    }