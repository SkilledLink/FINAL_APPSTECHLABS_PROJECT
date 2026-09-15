# app/database/session.py
from sqlmodel import create_engine, Session

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.environment.lower() == "development",
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=1800,
)


def get_session():
    with Session(engine) as session:
        yield session