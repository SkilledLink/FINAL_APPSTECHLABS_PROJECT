# app/models/__init__.py
"""
Import every SQLModel class here so SQLAlchemy can resolve
string-based relationship("X") references at mapper-configure time.
"""

# ── Core user & identity ─────────────────────────────────
from app.models.user import User
from app.models.user_follow import UserFollow

# ── Professional ─────────────────────────────────────────
from app.models.professional import Professional
from app.models.professional_portfolio import ProfessionalPortfolio
from app.models.professional_location import ProfessionalLocation
from app.models.professional_service_area import ProfessionalServiceArea
from app.models.professional_audit_log import ProfessionalAuditLog

# ── Professional tier / subscription / payments / AI ─────
from app.models.professional_tier import (
    ProfessionalTier,
    ProfessionalTierFeature,
)
from app.models.professional_tier_subscription import (
    ProfessionalTierSubscription,
)
from app.models.professional_payment import ProfessionalPayment
from app.models.professional_ai_usage import ProfessionalAIUsage
from app.models.professional_ai_proposal import ProfessionalAIProposal

# ── Auth / tokens / audit ────────────────────────────────
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.audit_log import AuditLog

# ── Feed ─────────────────────────────────────────────────
from app.models.feed import Feed

# ── Jobs ─────────────────────────────────────────────────
from app.models.job import Job

# ── AI / knowledge / chat ────────────────────────────────
from app.models.knowledge_document import KnowledgeDocument
from app.models.chat_log import ChatLog

# ── Misc ─────────────────────────────────────────────────
from app.models.report import Report
from app.models.moderation_record import ModerationRecord
from app.models.notification import Notification


__all__ = [
    "User",
    "UserFollow",
    "Professional",
    "ProfessionalPortfolio",
    "ProfessionalLocation",
    "ProfessionalServiceArea",
    "ProfessionalAuditLog",
    "ProfessionalTier",
    "ProfessionalTierFeature",
    "ProfessionalTierSubscription",
    "ProfessionalPayment",
    "ProfessionalAIUsage",
    "ProfessionalAIProposal",
    "RefreshToken",
    "VerificationToken",
    "AuditLog",
    "Feed",
    "Job",
    "KnowledgeDocument",
    "ChatLog",
    "Report",
    "ModerationRecord",
    "Notification",
]