# app/main.py

import asyncio
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
from app.api.v1.reviews import router as reviews_router
from app.ai.ai_search import router as ai_search_router
from app.api.v1.notifications_ext import router as notifications_ext_router
from app.api.v1.admin_notifications import router as admin_notifications_router

# ─── Contact Messages ──────────────────────────────────────
from app.api.v1.contact_messages import router as contact_messages_router

# ─── Webhooks (existing — KYC, Didit, etc.) ────────────────
from app.webhooks import router as webhooks_router

# ─── Tier / subscription / payment / AI-usage ──────────────
from app.api.v1.professional_tiers import (
    router as professional_tiers_router,
)
from app.api.v1.professional_subscriptions import (
    router as professional_subscriptions_router,
)
from app.api.v1.professional_payments import (
    router as professional_payments_router,
)
from app.api.v1.professional_ai_usage import (
    router as professional_ai_usage_router,
)
from app.api.v1.payment_webhooks import (
    router as payment_webhooks_router,
)

# ─── AI features (tier-gated content generation) ───────────
from app.api.v1.ai_features import router as ai_features_router

# ─── Database ──────────────────────────────────────────────
from app.database.session import engine

# ─── Settings (for CORS + other env-driven config) ─────────
from app.core.config import settings

# ─── Models (registering with SQLModel.metadata) ──────────
from app.models.user import User  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.verification_token import VerificationToken  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.conversation_participant import ConversationParticipant  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.professional import Professional  # noqa: F401
from app.models.professional_audit_log import ProfessionalAuditLog  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401

from app.models.job import Job, JobImage, JobLike, JobComment  # noqa: F401
from app.models.contact_messages import Contact2_Message  # noqa: F401

from app.api.v1.admin import admin_router
from app.api.v1.moderator import moderator_router

from app.models.professional_portfolio import (  # noqa: F401
    ProfessionalCategory,
    ProfessionalSpecialty,
    PortfolioSpecialty,
    ProfessionalPortfolio,
    PortfolioWork,
    ProfessionalService,
    ProfessionalAvailability,
)

from app.models.feed import (  # noqa: F401
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

# ─── Tier / subscription / payment / AI-usage models ──────
from app.models.professional_tier import (  # noqa: F401
    ProfessionalTier,
    ProfessionalTierFeature,
)
from app.models.professional_tier_subscription import (  # noqa: F401
    ProfessionalTierSubscription,
)
from app.models.professional_payment import ProfessionalPayment  # noqa: F401
from app.models.professional_ai_usage import ProfessionalAIUsage  # noqa: F401

# ─── Webhook idempotency ledger ────────────────────────────
from app.models.webhook_event import WebhookEvent  # noqa: F401

# ─── Vector / AI knowledge base models (pgvector) ──────────
try:
    from app.models.knowledge_document import KnowledgeDocument  # noqa: F401
except ImportError:
    pass


# ─── Lifespan ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 0) Bind the socket emit bridge to the running loop so sync FastAPI
    #    endpoints can push Socket.IO events via asyncio.run_coroutine_threadsafe.
    from app.sockets.emit_bridge import set_main_loop
    set_main_loop(asyncio.get_running_loop())

    print("⏳ Attempting to connect to the database...")

    # 1) Verify connectivity
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
    except OperationalError as e:
        print("❌ Database connection FAILED.")
        print(f"Error details: {e}")
        raise e

    # 2) Ensure required Postgres extensions exist BEFORE create_all.
    #    - vector   → required by knowledge_documents.embedding (pgvector)
    #    - postgis  → required by professional_locations.location (geometry)
    #    - pg_trgm  → optional, useful for fast ILIKE / fuzzy search
    try:
        with engine.begin() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        print("✅ Postgres extensions ensured (vector, postgis, pg_trgm).")
    except Exception as e:
        print("❌ Failed to enable Postgres extensions.")
        print(f"Error details: {e}")
        raise e

    # 3) Create any missing tables (idempotent).
    try:
        SQLModel.metadata.create_all(engine)
        print("✅ Database tables are ready.")
    except Exception as e:
        print("❌ Failed to create database tables.")
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
# Allow ALL origins (dev-friendly / open API).
#
# NOTE:
#   Using allow_origins=["*"] together with allow_credentials=True is
#   rejected by browsers (CORS spec forbids "*" when credentials are sent).
#   So we use allow_origin_regex=".*" which echoes the incoming Origin back,
#   allowing credentials (cookies / Authorization) from any origin.
#
# ⚠️  For production, tighten this to an explicit allow-list.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
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
app.include_router(contact_messages_router)

# ─── Professionals (static-prefix routers first) ───────────
app.include_router(location_router)
app.include_router(professional_location_router)
app.include_router(professional_admin_router)
app.include_router(professional_portfolio_router)
app.include_router(professional_kyc_router)
app.include_router(professionals_router)

# ─── Tier / subscription / payment / AI-usage ──────────────
app.include_router(professional_tiers_router)
app.include_router(professional_subscriptions_router)
app.include_router(professional_payments_router)
app.include_router(professional_ai_usage_router)
app.include_router(payment_webhooks_router)

# ─── AI features (tier-gated content generation) ───────────
app.include_router(ai_features_router)

# ─── Reviews ───────────────────────────────────────────────
app.include_router(reviews_router)

app.include_router(jobs_router)
app.include_router(feeds_router)

app.include_router(search.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(chat_router)
app.include_router(ai_search_router)

# ─── Admin & Moderator ─────────────────────────────────────
app.include_router(admin_router)
app.include_router(moderator_router)
app.include_router(notifications_router)
app.include_router(report_router)

# ─── Webhooks (KYC / Didit) ────────────────────────────────
app.include_router(webhooks_router)

# ─── Notifications ────────────────────────────────────────
app.include_router(notifications_ext_router)
app.include_router(admin_notifications_router)


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