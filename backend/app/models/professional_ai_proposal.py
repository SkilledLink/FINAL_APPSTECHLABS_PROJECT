# app/models/professional_ai_proposal.py

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column, String
from sqlmodel import Field, Relationship, SQLModel

from app.enums.ai_proposal import ProposalStatus

if TYPE_CHECKING:
    from app.models.professional import Professional


class ProfessionalAIProposal(SQLModel, table=True):
    __tablename__ = "professional_ai_proposals"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    professional_id: UUID = Field(
        foreign_key="professionals.id", nullable=False, index=True
    )

    feature_key: str = Field(nullable=False, max_length=100, index=True)
    field_path: str = Field(nullable=False, max_length=200, index=True)

    current_value: Optional[str] = Field(default=None)
    proposed_value: str = Field(nullable=False)

    reason: Optional[str] = Field(default=None, max_length=1000)
    impact: str = Field(default="medium", max_length=10, index=True)

    status: ProposalStatus = Field(
        sa_column=Column(
            String(20),
            nullable=False,
            default=ProposalStatus.PENDING.value,
            index=True,
        ),
    )

    accepted_value: Optional[str] = Field(default=None)
    accepted_at: Optional[datetime] = Field(default=None)
    accepted_by_user_id: Optional[UUID] = Field(
        default=None, foreign_key="users.id", nullable=True
    )

    rejected_at: Optional[datetime] = Field(default=None)
    expires_at: datetime = Field(nullable=False, index=True)

    extra: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    professional: Optional["Professional"] = Relationship()