# app/models/__init__.py
"""
Import every SQLModel class here so SQLAlchemy can resolve
string-based relationship("X") references at mapper-configure time.

If a model is imported anywhere in the app but *not* here, the first
session that touches an entity referencing it will raise:

    InvalidRequestError: ... failed to locate a name ('X')

Rule of thumb: any time you add a new file under app/models/, add its
import below.
"""

# ── Core user & identity ─────────────────────────────────
from app.models.user import User
from app.models.user_follow import UserFollow
# from app.models.user_profile import UserProfile

# ── Professional ─────────────────────────────────────────
from app.models.professional import Professional
from app.models.professional_portfolio import ProfessionalPortfolio
from app.models.professional_location import ProfessionalLocation
from app.models.professional_service_area import ProfessionalServiceArea
from app.models.professional_audit_log import ProfessionalAuditLog


# ── Auth / tokens / audit ────────────────────────────────
from app.models.refresh_token import RefreshToken
from app.models.verification_token import VerificationToken
from app.models.audit_log import AuditLog

# ── Feed ─────────────────────────────────────────────────
from app.models.feed import Feed

# ── Jobs ─────────────────────────────────────────────────
from app.models.job import Job
# from app.models.application import Application

# ── Messaging (disabled until wired up) ──────────────────
# from app.models.conversation import Conversation
# from app.models.conversation_participant import ConversationParticipant
# from app.models.message import Message

# ── Reviews (disabled until wired up) ────────────────────
# from app.models.review import Review

# ── AI / knowledge / chat ────────────────────────────────
from app.models.knowledge_document import KnowledgeDocument
from app.models.chat_log import ChatLog

# ── Misc ─────────────────────────────────────────────────

from app.models.report import Report
from app.models.moderation_record import ModerationRecord
from app.models.notification import Notification