from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api.v1.auth import router as auth_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.messages import router as messages_router
from app.api.v1.upload import router as upload_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.project import router as project_router

from app.database.session import engine

# Import models so they are registered
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message
from app.models.jobs import JobPost
from app.models.project import Project
from app.models.job_interaction import JobLike, JobComment, JobShare, JobApplication
from app.api.v1.upload import router as upload_router

def lifespan(app: FastAPI):
    print("⏳ Attempting to connect to the database...")
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        
        # ✅ CREATE ALL TABLES (including new ones)
        SQLModel.metadata.create_all(engine)
        print("✅ Database tables are ready.")
        
    except OperationalError as e:
        print("❌ Database connection FAILED.")
        print(f"Error details: {e}")
        raise e
    yield
    print("⏳ Shutting down...")
    engine.dispose()

app = FastAPI(
    title="Appstect API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ✅ CORS Middleware - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(messages_router)
app.include_router(upload_router)
app.include_router(jobs_router)
app.include_router(project_router)
app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "Welcome to Appstect API"}

@app.get("/health/database")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected"}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}