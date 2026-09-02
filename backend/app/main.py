from fastapi import FastAPI
from sqlmodel import Session, text

from app.core.config import settings
from app.database.session import engine


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name}"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
    }


@app.get("/health/database")
def database_health_check():
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))

        return {
            "database": "connected",
            "status": "healthy",
        }

    except Exception as error:
        return {
            "database": "disconnected",
            "status": "unhealthy",
            "error": str(error),
        }