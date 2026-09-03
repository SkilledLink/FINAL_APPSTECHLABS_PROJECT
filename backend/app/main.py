from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware   # <-- ADD THIS
from sqlmodel import SQLModel
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api.v1.auth import router as auth_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.messages import router as messages_router
from app.api.v1.uploads import router as uploads_router
from app.database.session import engine

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message

# Sync lifespan
def lifespan(app: FastAPI):
    print("⏳ Attempting to connect to the database...")
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        SQLModel.metadata.create_all(engine)
        print("✅ Database tables are ready.")
    except OperationalError as e:
        print("❌ Database connection FAILED.")
        print(f"Error details: {e}")
        raise e
    yield
    print("⏳ Shutting down...")
    engine.dispose()

app = FastAPI(title="Appstect API", lifespan=lifespan)

# --- CORS MIDDLEWARE (add this block) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Your Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------------

# Register routers
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(messages_router)
app.include_router(uploads_router)

@app.get("/health/database")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected"}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}