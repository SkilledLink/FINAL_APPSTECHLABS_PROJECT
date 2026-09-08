from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

# ─── Existing versioned routers ──────────────────────────
from app.api.v1.auth import router as auth_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.messages import router as messages_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.users import router as users_router
from app.api.v1.professionals import router as professionals_router

# ─── NEW routers ──────────────────────────────────────────
from app.api.v1.professional_kyc import router as professional_kyc_router
from app.webhooks import router as webhooks_router

from app.database.session import engine

# ─── Import all models so they are registered with SQLModel.metadata ──
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message
from app.models.professional import Professional   # updated with KYC fields

# ─── Lifespan (database init) ────────────────────────────
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

# ─── App instance ──────────────────────────────────────────
app = FastAPI(title="Appstect API", lifespan=lifespan)

# ─── CORS Middleware ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register routers ─────────────────────────────────────
app.include_router(auth_router)                 # /api/v1/auth
app.include_router(conversations_router)        # /api/v1/conversations
app.include_router(messages_router)             # /api/v1/messages
app.include_router(uploads_router)              # /api/v1/uploads
app.include_router(users_router)                # /api/v1/users
app.include_router(professionals_router)        # /api/v1/professionals (CRUD)
app.include_router(professional_kyc_router)     # /api/v1/professionals/kyc (NEW)

# ─── Webhooks (global, not versioned) ──────────────────
app.include_router(webhooks_router)             # /webhooks/didit

# ─── Health check ────────────────────────────────────────
@app.get("/health/database")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected"}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}