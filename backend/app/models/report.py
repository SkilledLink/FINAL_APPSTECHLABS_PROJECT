# app/models/report.py
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


# ─────────────────────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────────────────────
class ReportTargetType(str, Enum):
    USER = "user"
    PROFESSIONAL = "professional"
    JOB = "job"
    FEED = "feed"


class ReportReason(str, Enum):
    SPAM = "spam"
    HARASSMENT = "harassment"
    FRAUD = "fraud"
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    FAKE_ACCOUNT = "fake_account"
    SCAM = "scam"
    IMPERSONATION = "impersonation"
    OTHER = "other"


class ReportStatus(str, Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ReportAction(str, Enum):
    """What moderators did after review (audit trail)."""
    NONE = "none"
    WARNED = "warned"
    CONTENT_REMOVED = "content_removed"
    USER_SUSPENDED = "user_suspended"
    USER_BANNED = "user_banned"


# ─────────────────────────────────────────────────────────────
# REPORT
# ─────────────────────────────────────────────────────────────
class Report(SQLModel, table=True):
    __tablename__ = "reports"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
    )

    # ─── Who reported ────────────────────────────────────────
    reporter_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
    )

    # ─── What was reported ───────────────────────────────────
    # `target_id` is polymorphic: it can point to users.id,
    # professionals.id, jobs.id, or feeds.id depending on target_type.
    # A real FK isn't possible for polymorphic targets, so we index
    # the pair (target_type, target_id) at query time.
    target_type: ReportTargetType = Field(nullable=False, index=True)
    target_id: UUID = Field(nullable=False, index=True)

    # ─── Why ─────────────────────────────────────────────────
    reason: ReportReason = Field(nullable=False, index=True)
    description: Optional[str] = Field(default=None, max_length=2000)

    # ─── Review state ────────────────────────────────────────
    status: ReportStatus = Field(
        default=ReportStatus.PENDING,
        nullable=False,
        index=True,
    )

    reviewed_by: Optional[UUID] = Field(
        default=None,
        foreign_key="users.id",
        nullable=True,
    )
    reviewed_at: Optional[datetime] = Field(default=None)
    review_notes: Optional[str] = Field(default=None, max_length=2000)

    action_taken: ReportAction = Field(
        default=ReportAction.NONE,
        nullable=False,
    )

    # ─── Soft delete ─────────────────────────────────────────
    deleted_at: Optional[datetime] = Field(default=None, index=True)

    # ─── Timestamps ──────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )