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
from app.api.v1.jobs import router as jobs_router
from app.api.v1 import search


# ─── NEW routers ──────────────────────────────────────────
from app.api.v1.professional_kyc import router as professional_kyc_router
from app.api.v1.professional_portfolio import router as professional_portfolio_router
from app.webhooks import router as webhooks_router
from app.api.v1 import chat


from app.database.session import engine

# ─── Import all models so they are registered with SQLModel.metadata ──
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message
from app.models.professional import Professional
from app.models.job import Job, JobImage, JobLike, JobComment
from app.models.professional_portfolio import (
    ProfessionalCategory,
    ProfessionalSpecialty,
    PortfolioSpecialty,
    ProfessionalPortfolio,
    PortfolioWork,
    ProfessionalService,
    ProfessionalAvailability,
)

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
app.include_router(auth_router)                          # /auth
app.include_router(conversations_router)                # /conversations
app.include_router(messages_router)                     # /messages
app.include_router(uploads_router)                      # /uploads
app.include_router(users_router)                        # /users

# ─── IMPORTANT: Put professional_portfolio_router BEFORE professionals_router ──
app.include_router(professional_portfolio_router)       # /professionals/portfolio (static)
app.include_router(professionals_router)                # /professionals (dynamic routes like /{professional_id})
app.include_router(professional_kyc_router)             # /professionals/kyc
app.include_router(jobs_router)                         # /jobs
app.include_router(search.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")



# ─── Webhooks (global, not versioned) ──────────────────
app.include_router(webhooks_router)                     # /webhooks/didit

# ─── Health check ────────────────────────────────────────
@app.get("/health/database")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected"}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}