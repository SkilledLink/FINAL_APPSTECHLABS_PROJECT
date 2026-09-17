
# app/main.py

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel

# ─── Versioned routers ─────────────────────────────────────
from app.api.v1.auth import router as auth_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.messages import router as messages_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.users import router as users_router
from app.api.v1.professionals import router as professionals_router
from app.api.v1.professional_kyc import router as professional_kyc_router
from app.api.v1.professional_portfolio import router as professional_portfolio_router
from app.api.v1.professional_admin import router as professional_admin_router
from app.api.v1.location import router as location_router
from app.api.v1.professional_location import router as professional_location_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.feeds import router as feeds_router
from app.api.v1 import search
from app.api.v1 import chat
from app.api.v1.chat import router as chat_router
from app.ai.ai_search import router as ai_search_router          # ✅ NEW
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401 registers with SQLModel.metadata

# ─── Contact Messages ──────────────────────────────────────
from app.api.v1.contact_messages import router as contact_messages_router

# ─── Webhooks ──────────────────────────────────────────────
from app.webhooks import router as webhooks_router

# ─── Database ──────────────────────────────────────────────
from app.database.session import engine

# ─── Models ────────────────────────────────────────────────
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.conversation import Conversation
from app.models.conversation_participant import ConversationParticipant
from app.models.message import Message
from app.models.professional import Professional
from app.models.professional_audit_log import ProfessionalAuditLog
from app.models.job import Job, JobImage, JobLike, JobComment
from app.api.v1.admin import admin_router
from app.api.v1.moderator import moderator_router
from app.models.contact_messages import Contact2_Message
from app.models.job import Job, JobImage, JobLike, JobComment
from app.api.v1.admin import admin_router
from app.api.v1.moderator import moderator_router

from app.models.professional_portfolio import (
    ProfessionalCategory,
    ProfessionalSpecialty,
    PortfolioSpecialty,
    ProfessionalPortfolio,
    PortfolioWork,
    ProfessionalService,
    ProfessionalAvailability,
)

from app.models.feed import (
    Feed,
    FeedMedia,
    FeedLike,
    FeedComment,
    Hashtag,
    FeedHashtag,
)

from app.models.moderation_record import ModerationRecord  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.api.v1.notifications import router as notifications_router
from app.api.v1.reports import router as report_router


# ─── Lifespan ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
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
app = FastAPI(
    title="Appstect API",
    lifespan=lifespan,
)


# ─── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Register routers ──────────────────────────────────────
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(messages_router)
app.include_router(uploads_router)
app.include_router(users_router)

# ─── Contact Messages ──────────────────────────────────────
# Public POST /contact-messages
# Admin-only GET/PATCH/POST-reply endpoints are protected
# inside the contact_messages router.
app.include_router(contact_messages_router)

# Professionals — static-prefix routers first
app.include_router(location_router)
app.include_router(professional_location_router)
app.include_router(professional_admin_router)
app.include_router(professional_portfolio_router)
app.include_router(professional_kyc_router)
app.include_router(professionals_router)

app.include_router(jobs_router)
app.include_router(feeds_router)

app.include_router(search.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(chat_router)
app.include_router(ai_search_router)          # ✅ NEW — registers /ai/search

# ─── Admin & Moderator ─────────────────────────────────────
app.include_router(admin_router)
app.include_router(moderator_router)
app.include_router(notifications_router)
app.include_router(report_router)

# ─── Webhooks (global) ─────────────────────────────────────
app.include_router(webhooks_router)


# ─── Health check ──────────────────────────────────────────
@app.get("/health/database")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {"status": "connected"}

    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e),
        }

