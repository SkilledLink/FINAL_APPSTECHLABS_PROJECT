# app/schemas/report.py
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.report import ReportReason, ReportTargetType


class ReportCreate(BaseModel):
    target_id: UUID = Field(
        ...,
        description="ID of the user, professional, job, or feed being reported",
    )
    target_type: ReportTargetType = Field(
        ...,
        description="Type of entity being reported",
    )
    reason: ReportReason = Field(
        ...,
        description="Reason for the report",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional additional context from the reporter",
    )


# ─────────────────────────────────────────────────────────────
# READ / RESPONSE SCHEMAS
# ─────────────────────────────────────────────────────────────
from datetime import datetime

from app.models.report import ReportAction, ReportStatus


class ReportRead(BaseModel):
    id: UUID
    reporter_id: UUID
    target_id: UUID
    target_type: ReportTargetType
    reason: ReportReason
    description: Optional[str] = None
    status: ReportStatus
    action_taken: ReportAction
    review_notes: Optional[str] = None
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReportReview(BaseModel):
    """Payload a moderator submits to resolve a report."""
    status: ReportStatus = Field(
        ...,
        description="New status (resolved / dismissed / reviewing)",
    )
    action_taken: ReportAction = Field(
        default=ReportAction.NONE,
        description="Action taken against the reported entity",
    )
    review_notes: Optional[str] = Field(
        default=None,
        max_length=2000,
    )